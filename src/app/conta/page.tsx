import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import CopyLicenseButton from './copy-license-button'

export const metadata: Metadata = {
  title: 'Conta — ameno.studio',
  description: 'Compras e licenças da sua conta Ameno.',
}

export const dynamic = 'force-dynamic'

type License = {
  token: string
  machine_id: string | null
  machine_bound_at: string | null
  last_verified_at: string | null
  active: boolean
}

type Purchase = {
  id: string
  amount: number | null
  currency: string | null
  product: string | null
  status: string | null
  created_at: string
  licenses: License[] | License | null
}

function getLicense(purchase: Purchase) {
  return Array.isArray(purchase.licenses) ? purchase.licenses[0] ?? null : purchase.licenses
}

function formatAmount(amount: number | null, currency: string | null) {
  if (amount === null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: (currency ?? 'brl').toUpperCase(),
  }).format(amount / 100)
}

function maskMachineId(machineId: string | null) {
  if (!machineId) return 'Ainda não vinculada'
  if (machineId.length <= 8) return 'Vinculada'
  return `•••• ${machineId.slice(-6)}`
}

export default async function ContaPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string | string[] }>
}) {
  const params = await searchParams
  const success = params.success === 'true' || (Array.isArray(params.success) && params.success.includes('true'))
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims) {
    if (!success) redirect('/entrar?next=/conta')

    return (
      <section className="account-page relative overflow-hidden px-6 pb-28 pt-36 sm:pb-40 sm:pt-48">
        <div className="page-grid" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1440px]">
          <div className="page-topline"><p>ÁREA DO CLIENTE / CHECKOUT</p><p>STATUS / RECEBIDO</p></div>
          <div className="account-layout grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-24">
            <div>
              <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#666666]">Pagamento enviado</p>
              <h1 className="max-w-4xl text-display-sm">Pedido recebido<span className="text-red">.</span></h1>
              <div className="mt-10 max-w-xl border-t border-[#222222] pt-8 text-lg leading-relaxed text-[#e8e8e0]">
                <p>O pagamento será confirmado pelo webhook. Entre com o mesmo e-mail usado no checkout para acompanhar a compra e recuperar sua licença.</p>
              </div>
              <Link href="/entrar?next=/conta%3Fsuccess%3Dtrue" className="ameno-button ameno-button--primary mt-10">
                Entrar na conta <span aria-hidden="true">→</span>
              </Link>
            </div>
            <PurchaseFlow active />
          </div>
        </div>
      </section>
    )
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user
  if (userError || !user?.email || !user.email_confirmed_at) redirect('/entrar?error=auth&next=/conta')

  const admin = getSupabaseAdmin()
  const { error: claimError } = await admin.rpc('claim_purchases_for_user', {
    p_user_id: user.id,
    p_email: user.email,
  })

  const { data, error: purchasesError } = await admin
    .from('purchases')
    .select('id, amount, currency, product, status, created_at, licenses(token, machine_id, machine_bound_at, last_verified_at, active)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const accountError = claimError || purchasesError
  const purchases = (data ?? []) as Purchase[]

  return (
    <section className="account-page relative overflow-hidden px-6 pb-28 pt-36 sm:pb-40 sm:pt-48">
      <div className="page-grid" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1440px]">
        <div className="page-topline">
          <p>ÁREA DO CLIENTE / CONTA</p>
          <p>{purchases.length.toString().padStart(3, '0')} / COMPRAS</p>
        </div>

        <div className="account-dashboard-header">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[#666666]">Sessão verificada</p>
            <h1 className="text-display-sm">Sua conta<span className="text-red">.</span></h1>
            <p className="mt-6 font-mono text-xs text-[#8b8b85]">{user.email}</p>
          </div>
          <form action="/auth/sair" method="post">
            <button className="account-signout ameno-button ameno-button--secondary" type="submit">Sair da conta</button>
          </form>
        </div>

        {success && (
          <div className="account-notice" role="status">
            <span aria-hidden="true" />
            <p><strong>Pedido recebido.</strong> A confirmação pode levar alguns instantes. Recarregue a página se a compra ainda não aparecer.</p>
          </div>
        )}

        {accountError ? (
          <div className="account-empty" role="alert">
            <p>Não foi possível carregar suas compras agora.</p>
            <small>Tente novamente em alguns instantes ou escreva para contato@ameno.studio.</small>
          </div>
        ) : purchases.length === 0 ? (
          <div className="account-empty">
            <p>Nenhuma compra encontrada para este e-mail.</p>
            <small>Se você usou outro e-mail no pagamento, entre com ele ou fale com o suporte.</small>
            <Link href="/plugins" className="ameno-button ameno-button--secondary">Conhecer os plugins <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
          <div className="account-purchases" aria-label="Suas compras">
            {purchases.map((purchase, index) => {
              const license = getLicense(purchase)
              return (
                <article className="account-purchase-card" key={purchase.id}>
                  <div className="account-purchase-topline">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>{new Intl.DateTimeFormat('pt-BR').format(new Date(purchase.created_at))}</span>
                  </div>
                  <div className="account-purchase-heading">
                    <div>
                      <p>{purchase.product === 'ameno-cotas' ? 'Ameno Cotas' : purchase.product}</p>
                      <small>{formatAmount(purchase.amount, purchase.currency)} / pagamento único</small>
                    </div>
                    <span className={license?.active ? 'is-active' : ''}>{license?.active ? 'ATIVA' : 'PROCESSANDO'}</span>
                  </div>
                  <dl className="account-license-data">
                    <div>
                      <dt>Licença</dt>
                      <dd className="account-license-token">
                        <span>{license?.token ?? 'Aguardando confirmação do pagamento'}</span>
                        {license?.token ? <CopyLicenseButton token={license.token} /> : null}
                      </dd>
                    </div>
                    <div><dt>Computador</dt><dd>{maskMachineId(license?.machine_id ?? null)}</dd></div>
                    <div><dt>Download</dt><dd>Será liberado quando o arquivo final estiver disponível</dd></div>
                  </dl>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function PurchaseFlow({ active = false }: { active?: boolean }) {
  return (
    <div className="account-status-card" aria-label="Fluxo de confirmação da compra">
      <div className="account-status-heading">
        <span className={`account-status-dot${active ? ' is-active' : ''}`} aria-hidden="true" />
        <span>{active ? 'PROCESSANDO PEDIDO' : 'AGUARDANDO PEDIDO'}</span>
      </div>
      <div className="account-flow">
        <div><span>01</span><strong>CHECKOUT</strong><small>Pagamento único</small></div>
        <i aria-hidden="true" />
        <div><span>02</span><strong>WEBHOOK</strong><small>Confirmação segura</small></div>
        <i aria-hidden="true" />
        <div><span>03</span><strong>CONTA</strong><small>Licença recuperável</small></div>
      </div>
      <div className="account-rule" />
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#666666]">Ameno Cotas / versão 0.1 / 2026</p>
    </div>
  )
}
