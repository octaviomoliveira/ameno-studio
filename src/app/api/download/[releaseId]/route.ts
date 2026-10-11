import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

const PRODUCT = 'ameno-cotas'
const FIRST_PAID_SCOPE = 'ameno-cotas-first-paid'
const MAX_YEAR = 2026
const PRIVATE_BUCKET = 'ameno-private-releases'
const SIGNED_URL_SECONDS = 60
const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Purchase = {
  customer_email: string | null
  licenses: { active: boolean; product: string }[] | { active: boolean; product: string } | null
}

function sameConfirmedEmail(purchase: Purchase, email: string) {
  return purchase.customer_email?.trim().toLowerCase() === email.trim().toLowerCase()
}

function hasActiveLicense(purchase: Purchase) {
  const licenses = Array.isArray(purchase.licenses)
    ? purchase.licenses
    : purchase.licenses ? [purchase.licenses] : []
  return licenses.some((license) => license.active === true && license.product === PRODUCT)
}

function denied(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: PRIVATE_HEADERS })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ releaseId: string }> },
) {
  const { releaseId } = await params
  if (!UUID.test(releaseId)) return denied(404, 'Release indisponível')

  try {
    const supabase = await createClient()
    // getUser checks with Auth; an unverified cookie or editable metadata is
    // never enough to authorize a paid download.
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData.user
    if (userError || !user) return denied(401, 'Entre na sua conta')
    if (!user.email || !user.email_confirmed_at) return denied(403, 'Confirme seu e-mail')

    const admin = getSupabaseAdmin()
    const { data: purchases, error: purchaseError } = await admin
      .from('purchases')
      .select('customer_email, licenses(active, product)')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .eq('product', PRODUCT)
    if (purchaseError) throw new Error('Purchase lookup failed')
    const entitled = ((purchases ?? []) as Purchase[]).some(
      (purchase) => sameConfirmedEmail(purchase, user.email!) && hasActiveLicense(purchase),
    )
    if (!entitled) return denied(404, 'Release indisponível')

    const { data: release, error: releaseError } = await admin
      .from('release_artifacts')
      .select('id, product, entitlement_scope, max_year, bucket, object_path, release_version, status')
      .eq('id', releaseId)
      .eq('product', PRODUCT)
      .eq('entitlement_scope', FIRST_PAID_SCOPE)
      .eq('max_year', MAX_YEAR)
      .eq('status', 'published')
      .maybeSingle()
    if (releaseError) throw new Error('Release lookup failed')
    if (!release || release.entitlement_scope !== FIRST_PAID_SCOPE ||
      release.bucket !== PRIVATE_BUCKET || !release.object_path) {
      return denied(404, 'Release indisponível')
    }

    const { data: signed, error: signedError } = await admin.storage
      .from(PRIVATE_BUCKET)
      .createSignedUrl(release.object_path, SIGNED_URL_SECONDS, {
        download: `Ameno-Tools-Max-2026-${release.release_version}.zip`,
      })
    if (signedError || !signed?.signedUrl) throw new Error('Signing failed')

    // Defense in depth: do not redirect to an unexpected host or endpoint.
    const configuredOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin
    const signedUrl = new URL(signed.signedUrl, configuredOrigin)
    if (signedUrl.origin !== configuredOrigin ||
      !signedUrl.pathname.startsWith('/storage/v1/object/sign/')) {
      throw new Error('Unexpected signed URL')
    }
    const response = NextResponse.redirect(signedUrl, 302)
    Object.entries(PRIVATE_HEADERS).forEach(([name, value]) => response.headers.set(name, value))
    return response
  } catch {
    // Deliberately do not log customer identity, object paths, URLs or keys.
    console.error('Ameno release download unavailable')
    return denied(503, 'Download temporariamente indisponível')
  }
}
