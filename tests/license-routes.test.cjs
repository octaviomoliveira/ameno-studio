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
  const invalid = await route.POST(request({ token: 'invalid', machine_id: 'pc-a' }))
  assert.equal(invalid.status, 400)
  assert.equal(Object.hasOwn(await invalid.json(), 'verified_at'), false)
  assert.equal(calls, 0)
  const input = { token: randomUUID(), machine_id: 'pc-a' }
  const beforeVerify = Date.now()
  const approved = await route.POST(request(input))
  const afterVerify = Date.now()
  assert.equal(approved.headers.get('Cache-Control'), 'no-store')
  const approvedBody = await approved.json()
  assert.equal(approvedBody.valid, true)
  assert.match(approvedBody.verified_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  assert.ok(Date.parse(approvedBody.verified_at) >= beforeVerify)
  assert.ok(Date.parse(approvedBody.verified_at) <= afterVerify)
  for (const reason of ['not_found', 'inactive', 'machine_mismatch']) {
    result = { valid: false, reason }
    const deniedBody = await (await route.POST(request(input))).json()
    assert.equal(deniedBody.reason, reason)
    assert.equal(Object.hasOwn(deniedBody, 'verified_at'), false)
  }
  result = { valid: false, reason: 'rate_limited', retry_after: 42 }
  const limited = await route.POST(request(input))
  assert.equal(limited.status, 429)
  assert.equal(limited.headers.get('Retry-After'), '42')
  assert.equal(Object.hasOwn(await limited.json(), 'verified_at'), false)
  result = { valid: true, reason: 'rate_limited', retry_after: 42 }
  const contradictory = await route.POST(request(input))
  assert.equal(contradictory.status, 429)
  assert.equal(Object.hasOwn(await contradictory.json(), 'verified_at'), false)
  const failed = loadRoute('src/app/api/verify/route.ts', async () => ({ error: { message: 'private error' } }))
  const unavailable = await failed.POST(request(input))
  assert.equal(unavailable.status, 503)
  const unavailableBody = await unavailable.json()
  assert.equal(unavailableBody.reason, 'service_unavailable')
  assert.equal(Object.hasOwn(unavailableBody, 'verified_at'), false)
})

test('checkout is paused on the server and creates no Stripe session', async () => {
  const created = []
  const createCheckout = async (options) => {
    created.push(options)
    return { url: 'https://checkout.stripe.test/session' }
  }
  const request = (body) => new Request('http://localhost/api/checkout', {
    method: 'POST',
    body,
  })

  const guest = loadCheckoutRoute(null, createCheckout)
  const guestResult = await guest.POST(request(JSON.stringify({ amount: 3000 })))
  assert.equal(guestResult.status, 503)
  assert.equal(guestResult.headers.get('Cache-Control'), 'no-store')
  assert.match((await guestResult.json()).error, /temporariamente indisponíveis/)

  const claims = {
    sub: '2d57a8ba-d6e9-42ee-9d16-1f2dfaf9d57f',
    email: 'BUYER@EXAMPLE.INVALID',
  }
  const authenticated = loadCheckoutRoute(claims, createCheckout)
  assert.equal((await authenticated.POST(request(JSON.stringify({ amount: 1000 })))).status, 503)
  assert.equal((await authenticated.POST(request('invalid json'))).status, 503)
  assert.equal(created.length, 0)
})
