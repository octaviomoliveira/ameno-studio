import { randomUUID } from 'node:crypto'
import type Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { stripe, STRIPE_MIN_AMOUNT } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

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

  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return NextResponse.json({ received: true })
  }
  const session = event.data.object
  if (session.mode !== 'payment' || session.payment_status !== 'paid' || session.metadata?.product !== 'ameno-cotas') {
    return NextResponse.json({ received: true, ignored: true })
  }
  if (session.currency !== 'brl' || !Number.isSafeInteger(session.amount_total) || session.amount_total! < STRIPE_MIN_AMOUNT) {
    return NextResponse.json({ error: 'Valor ou moeda incompatível.' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const paymentIntent = typeof session.payment_intent === 'string'
      ? session.payment_intent : session.payment_intent?.id ?? null
    const customerEmail = session.customer_details?.email ?? session.customer_email ?? null
    const { error } = await supabase.rpc('fulfill_plugin_purchase', {
      p_session_id: session.id, p_payment_intent: paymentIntent,
      p_amount: session.amount_total, p_currency: session.currency,
      p_email: customerEmail,
      p_product: 'ameno-cotas', p_token: randomUUID(),
    })
    if (error) throw new Error('Purchase fulfillment failed')

    const userId = session.metadata?.user_id
    if (userId && session.client_reference_id === userId && customerEmail) {
      const { error: attachError } = await supabase.rpc('attach_purchase_to_user', {
        p_session_id: session.id,
        p_user_id: userId,
        p_email: customerEmail,
      })
      if (attachError) throw new Error('Purchase ownership failed')
    }

    // Email delivery is a later step. Never return the license in a webhook response.
    return NextResponse.json({ received: true })
  } catch {
    // Non-2xx permits Stripe retries; the SQL transaction preserves the original token.
    return NextResponse.json({ error: 'Não foi possível registrar a compra.' }, { status: 500 })
  }
}
