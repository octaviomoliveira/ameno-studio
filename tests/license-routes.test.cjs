/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const Stripe = require('stripe')
const { randomUUID } = require('node:crypto')

// Execute actual route source, replacing only external dependencies. No live purchases.
function loadRoute(file, rpc) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports = {}
  const stripe = new Stripe('sk_test_local_test_only')
  const secret = 'whsec_local_test_only'
  const sandbox = {
    exports, process: { env: { STRIPE_WEBHOOK_SECRET: secret } },
    require(name) {
      if (name === 'next/server') return { NextResponse: { json: (data, init) => Response.json(data, init) } }
      if (name === '@/lib/supabase-admin') return { getSupabaseAdmin: () => ({ rpc }) }
      if (name === '@/lib/supabase/server') return { createClient: async () => ({ auth: { getClaims: async () => ({ data: null }) } }) }
      if (name === '@/lib/stripe') return { stripe, STRIPE_MIN_AMOUNT: 1000 }
      if (name === 'node:crypto') return { randomUUID }
      throw new Error(`Unexpected import: ${name}`)
    },
  }
  vm.runInNewContext(code, sandbox, { filename: file })
  return { ...exports, stripe, secret }
}

function loadCheckoutRoute(claims, createCheckout) {
  const file = 'src/app/api/checkout/route.ts'
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports = {}
  const sandbox = {
    exports,
    process: { env: { NEXT_PUBLIC_SITE_URL: 'http://localhost' } },
    require(name) {
      if (name === 'next/server') return { NextResponse: { json: (data, init) => Response.json(data, init) } }
      if (name === '@/lib/stripe') return {
        STRIPE_MIN_AMOUNT: 1000,
        stripe: { checkout: { sessions: { create: createCheckout } } },
      }
      if (name === '@/lib/supabase/server') return {
        createClient: async () => ({ auth: { getClaims: async () => ({ data: claims ? { claims } : null }) } }),
      }
      throw new Error(`Unexpected import: ${name}`)
    },
  }
  vm.runInNewContext(code, sandbox, { filename: file })
  return exports
}

test('verify validates inputs before database access and preserves denial reasons', async () => {
  let calls = 0
  let result = { valid: true }
  const route = loadRoute('src/app/api/verify/route.ts', async (_name, args) => {
    calls++
    assert.equal(args.p_machine_id, 'pc-a')
    return { data: result, error: null }
  })
  const request = (body) => new Request('http://localhost/api/verify', { method: 'POST', body: JSON.stringify(body) })
  assert.equal((await route.POST(request({ token: 'invalid', machine_id: 'pc-a' }))).status, 400)
  assert.equal(calls, 0)
  const input = { token: randomUUID(), machine_id: 'pc-a' }
  assert.deepEqual(await (await route.POST(request(input))).json(), { valid: true })
  for (const reason of ['not_found', 'inactive', 'machine_mismatch']) {
    result = { valid: false, reason }
    assert.equal((await (await route.POST(request(input))).json()).reason, reason)
  }
  result = { valid: false, reason: 'rate_limited', retry_after: 42 }
  const limited = await route.POST(request(input))
  assert.equal(limited.status, 429)
  assert.equal(limited.headers.get('Retry-After'), '42')
  const failed = loadRoute('src/app/api/verify/route.ts', async () => ({ error: { message: 'private error' } }))
  const unavailable = await failed.POST(request(input))
  assert.equal(unavailable.status, 503)
  assert.equal((await unavailable.json()).reason, 'service_unavailable')
})

test('checkout remains public and only attaches server-verified identity', async () => {
  const created = []
  const createCheckout = async (options) => {
    created.push(options)
    return { url: 'https://checkout.stripe.test/session' }
  }
  const request = () => new Request('http://localhost/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ amount: 2900, user_id: 'untrusted-client-value' }),
  })

  const guest = loadCheckoutRoute(null, createCheckout)
  assert.equal((await guest.POST(request())).status, 200)
  assert.equal(created[0].client_reference_id, undefined)
  assert.equal(created[0].metadata.user_id, undefined)

  const claims = {
    sub: '2d57a8ba-d6e9-42ee-9d16-1f2dfaf9d57f',
    email: 'BUYER@EXAMPLE.INVALID',
  }
  const authenticated = loadCheckoutRoute(claims, createCheckout)
  assert.equal((await authenticated.POST(request())).status, 200)
  assert.equal(created[1].client_reference_id, claims.sub)
  assert.equal(created[1].metadata.user_id, claims.sub)
  assert.equal(created[1].customer_email, 'buyer@example.invalid')
})

test('webhook verifies real signatures, requires paid status and uses atomic fulfillment', async () => {
  const calls = []
  let dbFails = false
  const route = loadRoute('src/app/api/webhooks/stripe/route.ts', async (name, args) => {
    calls.push({ name, args })
    return { data: name === 'attach_purchase_to_user' ? true : null, error: dbFails ? { message: 'private error' } : null }
  })
  const session = { id: 'cs_test_local', mode: 'payment', payment_status: 'paid',
    metadata: { product: 'ameno-cotas' }, amount_total: 2900, currency: 'brl',
    customer_details: { email: 'test@example.invalid' }, payment_intent: 'pi_local' }
  function request(object = session, type = 'checkout.session.completed', validSignature = true) {
    const payload = JSON.stringify({ id: 'evt_local', type, data: { object } })
    const header = route.stripe.webhooks.generateTestHeaderString({ payload, secret: route.secret })
    return new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST', body: payload, headers: { 'stripe-signature': validSignature ? header : 'bad' },
    })
  }
  assert.equal((await route.POST(request(session, undefined, false))).status, 400)
  assert.equal((await route.POST(request({ ...session, payment_status: 'unpaid' }))).status, 200)
  assert.equal((await route.POST(request(session, 'payment_intent.created'))).status, 200)
  assert.equal(calls.length, 0)
  assert.equal((await route.POST(request({ ...session, amount_total: 999 }))).status, 400)
  const success = await route.POST(request())
  assert.equal(success.status, 200)
  assert.deepEqual(await success.json(), { received: true })
  assert.equal(calls[0].name, 'fulfill_plugin_purchase')
  assert.equal(calls[0].args.p_amount, 2900)
  assert.match(calls[0].args.p_token, /^[0-9a-f-]{36}$/)
  assert.equal((await route.POST(request(session, 'checkout.session.async_payment_succeeded'))).status, 200)
  const userId = '2d57a8ba-d6e9-42ee-9d16-1f2dfaf9d57f'
  const ownedSession = {
    ...session,
    id: 'cs_test_owned',
    client_reference_id: userId,
    metadata: { product: 'ameno-cotas', user_id: userId },
  }
  assert.equal((await route.POST(request(ownedSession))).status, 200)
  assert.equal(calls.at(-1).name, 'attach_purchase_to_user')
  assert.equal(calls.at(-1).args.p_email, 'test@example.invalid')
  dbFails = true
  assert.equal((await route.POST(request())).status, 500)
})
