/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

const releaseId = '3cbdc744-d4db-4c16-b45e-b96481db3b50'
const buyerId = 'f0b75c38-b36a-4b8e-b6e9-9b6cba87da38'
const basePurchase = {
  user_id: buyerId,
  customer_email: 'buyer@example.invalid',
  product: 'ameno-cotas',
  status: 'completed',
  licenses: [{ active: true, product: 'ameno-cotas' }],
}
const baseRelease = {
  id: releaseId,
  product: 'ameno-cotas',
  entitlement_scope: 'ameno-cotas-first-paid',
  max_year: 2026,
  bucket: 'ameno-private-releases',
  object_path: 'max2026/1.0.0/Ameno-Tools.zip',
  release_version: '1.0.0',
  status: 'published',
}

function loadDownloadRoute(overrides = {}) {
  const calls = { queries: [], signs: [] }
  const user = Object.hasOwn(overrides, 'user') ? overrides.user : {
    id: buyerId, email: 'buyer@example.invalid', email_confirmed_at: '2026-10-11T00:00:00Z',
  }
  const purchases = overrides.purchases ?? [basePurchase]
  const releases = overrides.releases ?? [baseRelease]
  const admin = {
    from(table) {
      const filters = []
      calls.queries.push({ table, filters })
      const query = {
        select() { return this },
        eq(key, value) { filters.push([key, value]); return this },
        maybeSingle() {
          const rows = (table === 'release_artifacts' ? releases : purchases)
            .filter((row) => filters.every(([key, value]) => row[key] === value))
          return Promise.resolve({ data: rows[0] ?? null, error: overrides.dbError ?? null })
        },
        then(resolve, reject) {
          const rows = purchases.filter((row) => filters.every(([key, value]) => row[key] === value))
          return Promise.resolve({ data: rows, error: overrides.dbError ?? null }).then(resolve, reject)
        },
      }
      return query
    },
    storage: {
      from(bucket) {
        return {
          async createSignedUrl(path, seconds, options) {
            calls.signs.push({ bucket, path, seconds, options })
            return { data: { signedUrl: overrides.signedUrl ??
              'https://project.supabase.co/storage/v1/object/sign/ameno-private-releases/Ameno-Tools.zip?token=opaque' },
            error: overrides.signError ?? null }
          },
        }
      },
    },
  }
  const source = fs.readFileSync('src/app/api/download/[releaseId]/route.ts', 'utf8')
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports = {}
  const sandbox = {
    exports, Response, Request, URL, console,
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co' } },
    require(name) {
      if (name === 'next/server') return {
        NextResponse: {
          json: (body, init) => Response.json(body, init),
          redirect: (url, status) => new Response(null, { status, headers: { Location: String(url) } }),
        },
      }
      if (name === '@/lib/supabase/server') return {
        createClient: async () => ({ auth: { getUser: async () => ({
          data: { user }, error: overrides.authError ?? null,
        }) } }),
      }
      if (name === '@/lib/supabase-admin') return { getSupabaseAdmin: () => admin }
      throw new Error(`Unexpected import: ${name}`)
    },
  }
  vm.runInNewContext(js, sandbox, { filename: 'download-route.ts' })
  return { route: exports, calls }
}

async function request(route, id = releaseId) {
  return route.GET(new Request(`https://ameno.studio/api/download/${id}`), {
    params: Promise.resolve({ releaseId: id }),
  })
}

test('only a confirmed buyer with completed purchase and active license receives a short private URL', async () => {
  const { route, calls } = loadDownloadRoute({
    purchases: [{ ...basePurchase, customer_email: ' BUYER@EXAMPLE.INVALID ' }],
  })
  const result = await request(route)
  assert.equal(result.status, 302)
  assert.match(result.headers.get('Location'), /^https:\/\/project\.supabase\.co\/storage\/v1\/object\/sign\//)
  assert.equal(result.headers.get('Cache-Control'), 'private, no-store, max-age=0')
  assert.equal(result.headers.get('Referrer-Policy'), 'no-referrer')
  assert.deepEqual(JSON.parse(JSON.stringify(calls.signs)), [{
    bucket: 'ameno-private-releases', path: baseRelease.object_path,
    seconds: 60, options: { download: 'Ameno-Tools-Max-2026-1.0.0.zip' },
  }])
  assert.ok(calls.queries.some(({ table, filters }) => table === 'purchases' &&
    filters.some(([key, value]) => key === 'status' && value === 'completed')))
  assert.ok(calls.queries.some(({ table, filters }) => table === 'release_artifacts' &&
    filters.some(([key, value]) => key === 'status' && value === 'published')))
})

test('missing session, unconfirmed email and malformed IDs never sign', async () => {
  for (const scenario of [
    { user: null, expected: 401 },
    { user: { id: buyerId, email: 'buyer@example.invalid', email_confirmed_at: null }, expected: 403 },
    { user: { id: buyerId, email: null, email_confirmed_at: 'yes' }, expected: 403 },
  ]) {
    const { route, calls } = loadDownloadRoute(scenario)
    const response = await request(route)
    assert.equal(response.status, scenario.expected)
    assert.equal(calls.signs.length, 0)
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store, max-age=0')
  }
  const malformed = loadDownloadRoute()
  assert.equal((await request(malformed.route, '../invalid')).status, 404)
  assert.equal(malformed.calls.signs.length, 0)
})

test('guest not claimed, different email, pending/refunded purchase and inactive license are refused', async () => {
  const ineligible = [
    { ...basePurchase, user_id: null },
    { ...basePurchase, user_id: '7caec8ca-a156-4cc7-9551-99cff5ed315d' },
    { ...basePurchase, customer_email: 'other@example.invalid' },
    { ...basePurchase, status: 'pending' },
    { ...basePurchase, status: 'refunded' },
    { ...basePurchase, status: 'suspended' },
    { ...basePurchase, licenses: [{ active: false, product: 'ameno-cotas' }] },
    { ...basePurchase, licenses: [{ active: true, product: 'other-product' }] },
  ]
  for (const purchase of ineligible) {
    const { route, calls } = loadDownloadRoute({ purchases: [purchase] })
    assert.equal((await request(route)).status, 404)
    assert.equal(calls.signs.length, 0)
  }
})

test('staged/withdrawn/wrong-year release is never signed', async () => {
  for (const release of [
    { ...baseRelease, status: 'staged' },
    { ...baseRelease, status: 'withdrawn' },
    { ...baseRelease, max_year: 2027 },
    { ...baseRelease, product: 'other-product' },
    { ...baseRelease, entitlement_scope: 'ameno-cotas-second-paid' },
    { ...baseRelease, bucket: 'public' },
  ]) {
    const { route, calls } = loadDownloadRoute({ releases: [release] })
    assert.equal((await request(route)).status, 404)
    assert.equal(calls.signs.length, 0)
  }
})

test('database or Storage failure and unexpected signed host fail closed', async () => {
  for (const options of [
    { dbError: { message: 'private SQL detail' } },
    { signError: { message: 'private Storage detail' } },
    { signedUrl: 'https://attacker.example.invalid/steal' },
    { signedUrl: 'https://project.supabase.co/unexpected' },
  ]) {
    const { route } = loadDownloadRoute(options)
    const response = await request(route)
    assert.equal(response.status, 503)
    assert.equal(response.headers.get('Location'), null)
    assert.doesNotMatch(JSON.stringify(await response.json()), /private SQL|private Storage|attacker/)
  }
})

test('account UI only links through the authenticated route and shows a digest', () => {
  const page = fs.readFileSync('src/app/conta/page.tsx', 'utf8')
  assert.match(page, /href=\{`\/api\/download\/\$\{artifact\.id\}`\}/)
  assert.match(page, /artifact\.sha256/)
  assert.match(page, /purchase\.status === 'completed'/)
  assert.match(page, /purchase\.status === 'suspended'/)
  assert.match(page, /licenseUsable \? license\.token : licenseMessage/)
  assert.match(page, /licenseUsable \? <CopyLicenseButton/)
  assert.doesNotMatch(page, /createSignedUrl/)
})
