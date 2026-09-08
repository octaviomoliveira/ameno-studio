import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const token = body?.token
  const machineId = body?.machine_id
  if (typeof token !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token.trim()) ||
      typeof machineId !== 'string' || !/^[a-zA-Z0-9._:-]{1,256}$/.test(machineId)) {
    return NextResponse.json({ valid: false, reason: 'invalid_request' }, { status: 400 })
  }

  try {
    const { data, error } = await getSupabaseAdmin().rpc('verify_plugin_license', {
      p_token: token.trim().toLowerCase(), p_machine_id: machineId,
    })
    if (error || !data || typeof data.valid !== 'boolean') throw new Error('License verification failed')
    return NextResponse.json(data, {
      status: data.reason === 'rate_limited' ? 429 : 200,
      headers: {
        'Cache-Control': 'no-store',
        ...(data.reason === 'rate_limited' ? { 'Retry-After': String(data.retry_after) } : {}),
      },
    })
  } catch {
    // Do not log tokens, fingerprints, or admin credentials.
    return NextResponse.json({ valid: false, reason: 'service_unavailable' }, {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    })
  }
}
