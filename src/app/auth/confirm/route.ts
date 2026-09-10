import type { EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null
  const code = request.nextUrl.searchParams.get('code')
  const nextPath = safeNextPath(request.nextUrl.searchParams.get('next'))
  const supabase = await createClient()

  let valid = false
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    valid = !error
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    valid = !error
  }

  if (valid) return NextResponse.redirect(new URL(nextPath, request.url))
  return NextResponse.redirect(new URL(`/entrar?error=auth&next=${encodeURIComponent(nextPath)}`, request.url))
}
