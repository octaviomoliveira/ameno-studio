import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/auth'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Entrar — ameno.studio',
  description: 'Acesse suas compras e licenças da Ameno.',
}

export const dynamic = 'force-dynamic'

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>
}) {
  const params = await searchParams
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next
  const nextPath = safeNextPath(rawNext)
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) redirect(nextPath)

  return (
    <section className="account-page auth-page relative overflow-hidden px-6 pb-28 pt-36 sm:pb-40 sm:pt-48">
      <div className="page-grid" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1440px]">
        <div className="page-topline">
          <p>ÁREA DO CLIENTE / ACESSO</p>
          <p>SEM SENHA / CÓDIGO ÚNICO</p>
        </div>

        <div className="account-layout grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-24">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#666666]">Compras, licenças e downloads</p>
            <h1 className="max-w-4xl text-display-sm">Entre com seu e-mail<span className="text-red">.</span></h1>
            <p className="mt-10 max-w-xl border-t border-[#222222] pt-8 text-lg leading-relaxed text-[#e8e8e0]">
              Enviaremos um código de uso único. Se você já comprou como convidado, use o mesmo e-mail informado no pagamento para recuperar a compra.
            </p>
          </div>

          <LoginForm nextPath={nextPath} initialError={Boolean(params.error)} />
        </div>
      </div>
    </section>
  )
}
