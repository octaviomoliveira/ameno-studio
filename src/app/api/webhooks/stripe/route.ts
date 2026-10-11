import { randomUUID } from 'node:crypto'
import type Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { stripe, STRIPE_MIN_AMOUNT } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { FIRST_PAID_SCOPE } from '@/lib/purchase-entitlement'

export const runtime = 'nodejs'

const PRODUCT = 'ameno-cotas'
const PI_ID = /^pi_[A-Za-z0-9]+$/
const LIVE_SESSION_ID = /^cs_live_[A-Za-z0-9]+$/
const TEST_SESSION_ID = /^cs_test_[A-Za-z0-9]+$/

function idOf(value: string | { id: string } | null | undefined): string | null {
  return typeof value === 'string' ? value : value?.id ?? null
}

function validEmail(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.length >= 3 && value.length <= 320 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

// A non-Ameno product can be acknowledged. Missing or contradictory metadata
// is ambiguous and must be retried/investigated, never silently 2xx'd.
function productDisposition(session: Stripe.Checkout.Session): 'ameno' | 'other' {
  const product = session.metadata?.product
  if (product === PRODUCT) return 'ameno'
  if (typeof product === 'string' && product.length > 0) return 'other'
  throw new Error('Ambiguous Checkout product')
}

async function matchingSession(paymentIntentId: string): Promise<Stripe.Checkout.Session> {
  if (!PI_ID.test(paymentIntentId)) throw new Error('PaymentIntent missing')
  const found = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 2 })
  if (found.data.length !== 1 || found.has_more) throw new Error('Checkout session not unique')
  const session = found.data[0]
  if (idOf(session.payment_intent) !== paymentIntentId) throw new Error('Checkout/PI mismatch')
  return session
}

function validateBlockSession(session: Stripe.Checkout.Session, eventLivemode: boolean): 'ameno' | 'other' {
  const product = productDisposition(session)
  if (product === 'other') return product
  if (session.livemode !== eventLivemode || session.mode !== 'payment' ||
    session.payment_status !== 'paid' || session.currency !== 'brl' ||
    !Number.isSafeInteger(session.amount_total) ||
    (session.amount_total ?? 0) < STRIPE_MIN_AMOUNT ||
    !(eventLivemode ? LIVE_SESSION_ID : TEST_SESSION_ID).test(session.id)) {
    throw new Error('Checkout identity mismatch')
  }
  return 'ameno'
}

async function handlePaid(event: Stripe.Event, session: Stripe.Checkout.Session) {
  if (productDisposition(session) === 'other') return { received: true, ignored: 'other_product' }
  if (event.livemode !== session.livemode) throw new Error('Stripe mode mismatch')
  const paymentIntentId = idOf(session.payment_intent)
  const email = session.customer_details?.email ?? session.customer_email
  if (session.mode !== 'payment' || session.payment_status !== 'paid' ||
    session.currency !== 'brl' ||
    !(event.livemode ? LIVE_SESSION_ID : TEST_SESSION_ID).test(session.id) ||
    !Number.isSafeInteger(session.amount_total) ||
    (session.amount_total ?? 0) < STRIPE_MIN_AMOUNT ||
    !paymentIntentId || !PI_ID.test(paymentIntentId) || !validEmail(email)) {
    throw new Error('Incomplete paid Checkout snapshot')
  }
  // The scope is only minted by future server-side Checkout creation. A
  // historical session cannot become paid-first through webhook redelivery.
  if (session.metadata?.entitlement_scope == null) {
    return { received: true, ignored: 'legacy_checkout' }
  }
  if (session.metadata.entitlement_scope !== FIRST_PAID_SCOPE) {
    throw new Error('Unknown commercial entitlement scope')
  }
  if (!event.livemode) return { received: true, ignored: 'test_mode' }
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (intent.id !== paymentIntentId || intent.livemode !== true ||
    intent.status !== 'succeeded' || intent.currency !== 'brl' ||
    intent.amount !== session.amount_total ||
    !Number.isSafeInteger(intent.amount_received) ||
    intent.amount_received !== session.amount_total) {
    throw new Error('PaymentIntent does not confirm received amount')
  }

  const admin = getSupabaseAdmin()
  const { error } = await admin.rpc('fulfill_plugin_purchase_v2', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_session_id: session.id,
    p_payment_intent: paymentIntentId,
    p_amount: intent.amount_received,
    p_currency: intent.currency,
    p_email: email,
    p_product: PRODUCT,
    p_entitlement_scope: FIRST_PAID_SCOPE,
    p_livemode: true,
    p_token: randomUUID(),
  })
  if (error) throw new Error('Paid event transaction failed')

  const userId = session.metadata?.user_id
  if (userId && session.client_reference_id === userId) {
    const { data, error: attachError } = await admin.rpc('attach_purchase_to_user', {
      p_session_id: session.id, p_user_id: userId, p_email: email,
    })
    if (attachError || data !== true) throw new Error('Buyer ownership failed')
  }
  return { received: true }
}

async function handleBlock(
  event: Stripe.Event,
  objectId: string,
  chargeId: string,
  paymentIntentHint: string | null,
  snapshotLivemode: boolean,
  snapshotCurrency: string,
  snapshotAmount: number | null,
  snapshotCaptured: number | null,
  kind: 'partial_refund' | 'full_refund' | 'dispute',
) {
  if (event.livemode !== snapshotLivemode) throw new Error('Stripe mode mismatch')
  // The current Charge is consulted for correlation only. In particular,
  // never use its current refunded amount to reclassify an old snapshot.
  const currentCharge = await stripe.charges.retrieve(chargeId)
  const paymentIntentId = idOf(currentCharge.payment_intent)
  if (!paymentIntentId || !PI_ID.test(paymentIntentId) ||
    (paymentIntentHint && paymentIntentHint !== paymentIntentId) ||
    currentCharge.id !== chargeId || currentCharge.livemode !== event.livemode ||
    currentCharge.currency !== snapshotCurrency ||
    (snapshotAmount !== null && currentCharge.amount !== snapshotAmount) ||
    (snapshotCaptured !== null && currentCharge.amount_captured !== snapshotCaptured)) {
    throw new Error('Charge/PaymentIntent mismatch')
  }
  const session = await matchingSession(paymentIntentId)
  if (validateBlockSession(session, event.livemode) === 'other') {
    return { received: true, ignored: 'other_product' }
  }
  if (!event.livemode) return { received: true, ignored: 'test_mode' }
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (intent.id !== paymentIntentId || intent.livemode !== true ||
    intent.status !== 'succeeded' || intent.currency !== session.currency ||
    intent.amount !== session.amount_total ||
    intent.amount_received !== session.amount_total ||
    idOf(intent.latest_charge) !== chargeId ||
    currentCharge.amount_captured !== intent.amount_received) {
    throw new Error('Charge/Checkout received amount mismatch')
  }

  const { error } = await getSupabaseAdmin().rpc('record_plugin_payment_block', {
    p_event_id: event.id, p_event_type: event.type,
    p_object_id: objectId, p_session_id: session.id,
    p_payment_intent: paymentIntentId, p_block_kind: kind,
    p_livemode: true,
  })
  if (error) throw new Error('Payment block transaction failed')
  return { received: true }
}

async function processEvent(event: Stripe.Event) {
  if (event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded') {
    return handlePaid(event, event.data.object as Stripe.Checkout.Session)
  }
  if (event.type === 'charge.refunded') {
    const snapshot = event.data.object as Stripe.Charge
    // amount_refunded is cumulative in this signed event's Charge snapshot.
    // Compare with captured funds, not the later current Charge state.
    if (!snapshot.id || !Number.isSafeInteger(snapshot.amount_captured) ||
      snapshot.amount_captured <= 0 ||
      !Number.isSafeInteger(snapshot.amount_refunded) ||
      snapshot.amount_refunded <= 0 ||
      snapshot.amount_refunded > snapshot.amount_captured) {
      throw new Error('Invalid refund snapshot')
    }
    const kind = snapshot.amount_refunded === snapshot.amount_captured
      ? 'full_refund' : 'partial_refund'
    return handleBlock(event, snapshot.id, snapshot.id,
      idOf(snapshot.payment_intent), snapshot.livemode, snapshot.currency,
      snapshot.amount, snapshot.amount_captured, kind)
  }
  if (event.type === 'charge.dispute.created') {
    const snapshot = event.data.object as Stripe.Dispute
    const chargeId = idOf(snapshot.charge)
    if (!snapshot.id || !chargeId) throw new Error('Invalid dispute snapshot')
    return handleBlock(event, snapshot.id, chargeId,
      idOf(snapshot.payment_intent), snapshot.livemode, snapshot.currency,
      null, null, 'dispute')
  }
  // Dispute closure, failed refund, and unrelated events do not reactivate.
  return { received: true, ignored: 'unhandled_event' }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 503 })
  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret)
  } catch {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 })
  }

  try {
    return NextResponse.json(await processEvent(event), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    // A non-2xx asks Stripe to retry. Event/PI/identity/PII are not logged.
    return NextResponse.json({ error: 'Não foi possível processar o evento.' }, {
      status: 500, headers: { 'Cache-Control': 'no-store' },
    })
  }
}
