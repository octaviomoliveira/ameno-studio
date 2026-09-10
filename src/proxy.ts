import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Supabase redireciona erros de auth e códigos PKCE para a raiz do site.
  // Intercepta aqui e redireciona para as rotas corretas.
  if (pathname === '/') {
    const errorCode = searchParams.get('error_code')
    const error = searchParams.get('error')
    const code = searchParams.get('code')

    if (error || errorCode) {
      const msg = errorCode === 'otp_expired' ? 'expired' : 'auth'
      return NextResponse.redirect(
        new URL(`/entrar?error=${msg}&next=/conta`, request.url)
      )
    }

    if (code) {
      return NextResponse.redirect(
        new URL(`/auth/confirm?code=${encodeURIComponent(code)}&next=/conta`, request.url)
      )
    }
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
