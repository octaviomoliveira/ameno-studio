/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const Stripe = require('stripe')
const { randomUUID } = require('node:crypto')

const session = {
  id: 'cs_live_123ABC', mode: 'payment', payment_status: 'paid',
  livemode: true, metadata: {
    product: 'ameno-cotas', entitlement_scope: 'ameno-cotas-first-paid',
  },
  amount_total: 3000, currency: 'brl',
  customer_details: { email: 'buyer@example.invalid' },
  payment_intent: 'pi_123ABC',
}
const intent = {
  id: 'pi_123ABC', livemode: true, status: 'succeeded', currency: 'brl',
  amount: 3000, amount_received: 3000, latest_charge: 'ch_123ABC',
}
const charge = {
  id: 'ch_123ABC', livemode: true, currency: 'brl',
  amount: 3000, amount_captured: 3000, amount_refunded: 3000,
  payment_intent: 'pi_123ABC',
}
const dispute = {
  id: 'du_123ABC', charge: 'ch_123ABC', payment_intent: 'pi_123ABC',
  livemode: true, currency: 'brl',
}

function load(overrides = {}) {
  const stripe = new Stripe('sk_test_local_test_only')
  const secret = 'whsec_local_test_only'
  const calls = { rpc: [], stripe: [] }
  stripe.paymentIntents.retrieve = async (id) => {
    calls.stripe.push(['intent', id])
    if (overrides.apiFails) throw new Error('Stripe unavailable')
    return { ...intent, ...overrides.intent }
  }
  stripe.charges.retrieve = async (id) => {
    calls.stripe.push(['charge', id])
    if (overrides.apiFails) throw new Error('Stripe unavailable')
    return { ...charge, ...overrides.charge }
  }
  stripe.checkout.sessions.list = async (options) => {
    calls.stripe.push(['sessions', options])
    if (overrides.apiFails) throw new Error('Stripe unavailable')
    return {
      data: overrides.sessions ?? [{ ...session, ...overrides.session }],
      has_more: overrides.hasMore ?? false,
    }
  }
  const source = fs.readFileSync('src/app/api/webhooks/stripe/route.ts', 'utf8')
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports = {}
  const sandbox = {
    exports, process: { env: { STRIPE_WEBHOOK_SECRET: overrides.noSecret ? '' : secret } },
    require(name) {
      if (name === 'next/server') return {
        NextResponse: { json: (data, init) => Response.json(data, init) },
      }
      if (name === '@/lib/stripe') return { stripe, STRIPE_MIN_AMOUNT: 1000 }
      if (name === '@/lib/purchase-entitlement') return {
        FIRST_PAID_SCOPE: 'ameno-cotas-first-paid',
      }
      if (name === '@/lib/supabase-admin') return { getSupabaseAdmin: () => ({
        rpc: async (name, args) => {
          calls.rpc.push({ name, args })
          return {
            data: name === 'attach_purchase_to_user' ? (overrides.attachResult ?? true) : null,
            error: overrides.rpcFails ? { message: 'private SQL detail' } : null,
          }
        },
      }) }
      if (name === 'node:crypto') return { randomUUID }
      throw new Error(`Unexpected import: ${name}`)
    },
  }
  vm.runInNewContext(code, sandbox, { filename: 'stripe-webhook-route.ts' })
  function request(type, object, eventOptions = {}) {
    const payload = JSON.stringify({
      id: eventOptions.eventId ?? 'evt_123ABC',
      type, livemode: eventOptions.livemode ?? true,
      data: { object },
    })
    const signed = stripe.webhooks.generateTestHeaderString({ payload, secret })
    return new Request('https://ameno.studio/api/webhooks/stripe', {
      method: 'POST', body: payload,
      headers: { 'stripe-signature': eventOptions.signature ?? signed },
    })
  }
  return { route: exports, request, calls }
}

test('raw-body signature is mandatory; unhandled events cannot grant or reactivate', async () => {
  const { route, request, calls } = load()
  assert.equal((await route.POST(request('checkout.session.completed', session,
    { signature: 'invalid' }))).status, 400)
  const unknown = await route.POST(request('charge.dispute.closed', dispute))
  assert.equal(unknown.status, 200)
  assert.equal((await unknown.json()).ignored, 'unhandled_event')
  assert.equal(calls.rpc.length, 0)
  assert.equal((await load({ noSecret: true }).route.POST(request(
    'checkout.session.completed', session))).status, 503)
})

test('live paid snapshot and succeeded PI enter v2 RPC; ownership is separate and retriable', async () => {
  const userId = 'd532795d-9572-4f57-b6ef-b06b0d9e93b1'
  const paid = { ...session, client_reference_id: userId,
    metadata: { ...session.metadata, user_id: userId } }
  const { route, request, calls } = load()
  const result = await route.POST(request('checkout.session.completed', paid))
  assert.equal(result.status, 200)
  assert.deepEqual(await result.json(), { received: true })
  assert.equal(calls.rpc[0].name, 'fulfill_plugin_purchase_v2')
  assert.equal(calls.rpc[0].args.p_event_id, 'evt_123ABC')
  assert.equal(calls.rpc[0].args.p_amount, 3000)
  assert.equal(calls.rpc[0].args.p_entitlement_scope, 'ameno-cotas-first-paid')
  assert.equal(calls.rpc[0].args.p_livemode, true)
  assert.match(calls.rpc[0].args.p_token, /^[0-9a-f-]{36}$/)
  assert.equal(calls.rpc[1].name, 'attach_purchase_to_user')
  assert.equal(calls.rpc[1].args.p_email, 'buyer@example.invalid')
  assert.doesNotMatch(JSON.stringify(await (await route.POST(request(
    'checkout.session.async_payment_succeeded', paid))).json()), /token|license/i)
  const failed = load({ attachResult: false })
  assert.equal((await failed.route.POST(failed.request('checkout.session.completed', paid))).status, 500)
  assert.equal(failed.calls.rpc[0].name, 'fulfill_plugin_purchase_v2')
  assert.equal(failed.calls.rpc[1].name, 'attach_purchase_to_user')
})

test('historical/test/other product sessions are not elevated by a replay', async () => {
  const { route, request, calls } = load()
  const old = { ...session, metadata: { product: 'ameno-cotas' } }
  assert.equal((await (await route.POST(request('checkout.session.completed', old))).json()).ignored,
    'legacy_checkout')
  const other = { ...session, metadata: { product: 'other-product' } }
  assert.equal((await (await route.POST(request('checkout.session.completed', other))).json()).ignored,
    'other_product')
  const testMode = { ...session, id: 'cs_test_123ABC', livemode: false }
  assert.equal((await (await route.POST(request('checkout.session.completed', testMode,
    { livemode: false }))).json()).ignored, 'test_mode')
  assert.equal((await route.POST(request('checkout.session.completed',
    { ...session, metadata: {} }))).status, 500)
  assert.equal(calls.rpc.length, 0)
})

test('paid PI/Checkout amount, currency, status, identity and SQL errors fail closed', async () => {
  for (const bad of [
    { session: { amount_total: 999 } },
    { session: { payment_status: 'unpaid' } },
    { session: { currency: 'usd' } },
    { session: { payment_intent: 'pi_other' } },
    { session: { id: 'cs_test_123ABC' } },
    { session: { customer_details: { email: null } } },
    { intent: { amount_received: 2900 } },
    { intent: { amount: 2900 } },
    { intent: { currency: 'usd' } },
    { intent: { livemode: false } },
    { intent: { status: 'processing' } },
    { rpcFails: true },
    { apiFails: true },
  ]) {
    const ctx = load(bad)
    const response = await ctx.route.POST(ctx.request('checkout.session.completed',
      { ...session, ...bad.session }))
    assert.equal(response.status, 500, JSON.stringify(bad))
    assert.doesNotMatch(JSON.stringify(await response.json()), /private SQL|pi_other|token/i)
  }
})

test('partial, full, then partial replay retains signed snapshot classification', async () => {
  // All API lookups now show a fully refunded Charge; the older partial
  // snapshot must still be recorded as partial, even with R$25 remaining.
  const ctx = load({ charge: { amount_refunded: 3000 } })
  const partial = { ...charge, amount_refunded: 500 }
  const full = { ...charge, amount_refunded: 3000 }
  assert.equal((await ctx.route.POST(ctx.request('charge.refunded', partial,
    { eventId: 'evt_partial' }))).status, 200)
  assert.equal((await ctx.route.POST(ctx.request('charge.refunded', full,
    { eventId: 'evt_full' }))).status, 200)
  assert.equal((await ctx.route.POST(ctx.request('charge.refunded', partial,
    { eventId: 'evt_partial' }))).status, 200)
  assert.deepEqual(ctx.calls.rpc.map((call) => call.args.p_block_kind),
    ['partial_refund', 'full_refund', 'partial_refund'])
  assert.ok(ctx.calls.rpc.every((call) => call.name === 'record_plugin_payment_block'))
  assert.ok(ctx.calls.stripe.some(([name, options]) =>
    name === 'sessions' && options.payment_intent === 'pi_123ABC'))
})

test('dispute created suspends; absent correlation and other products never mutate', async () => {
  const valid = load()
  assert.equal((await valid.route.POST(valid.request('charge.dispute.created', dispute))).status, 200)
  assert.equal(valid.calls.rpc[0].args.p_block_kind, 'dispute')
  assert.equal(valid.calls.rpc[0].args.p_object_id, dispute.id)

  const other = load({ session: { metadata: { product: 'unrelated' } } })
  const otherResult = await other.route.POST(other.request('charge.refunded', charge))
  assert.equal(otherResult.status, 200)
  assert.equal(other.calls.rpc.length, 0)
  for (const bad of [
    { charge: { payment_intent: null } },
    { charge: { payment_intent: 'pi_other' } },
    { charge: { livemode: false } },
    { charge: { currency: 'usd' } },
    { session: { payment_intent: 'pi_other' } },
    { session: { metadata: {} } },
    { session: { amount_total: 999 } },
    { sessions: [] },
    { intent: { amount_received: 2000 } },
    { intent: { latest_charge: 'ch_other' } },
    { rpcFails: true },
    { apiFails: true },
  ]) {
    const ctx = load(bad)
    const result = await ctx.route.POST(ctx.request('charge.refunded', charge))
    assert.equal(result.status, 500, JSON.stringify(bad))
  }
})

test('invalid refund snapshot never reaches SQL', async () => {
  for (const snapshot of [
    { ...charge, amount_refunded: 0 },
    { ...charge, amount_refunded: 3001 },
    { ...charge, amount_captured: 0 },
  ]) {
    const ctx = load()
    assert.equal((await ctx.route.POST(ctx.request('charge.refunded', snapshot))).status, 500)
    assert.equal(ctx.calls.rpc.length, 0)
  }
})
