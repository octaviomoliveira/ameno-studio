import Link from 'next/link'

export const metadata = {
  title: 'Compra — ameno.studio',
  description: 'Retorno da compra do Ameno Cotas.',
}

export default async function ContaPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string | string[] }>
}) {
  const params = await searchParams
  const success = params.success === 'true' || (Array.isArray(params.success) && params.success.includes('true'))

  return (
    <section className="account-page relative overflow-hidden px-6 pb-28 pt-36 sm:pb-40 sm:pt-48">
      <div className="page-grid" aria-hidden="true" />
      <div className="mx-auto max-w-[1440px]">
        <div className="page-topline">
          <p>ÁREA DO CLIENTE / CHECKOUT</p>
          <p>{success ? 'STATUS / RECEBIDO' : '004 — 001'}</p>
        </div>

        <div className="account-layout grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-24">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#666666]">Acompanhe seu pedido</p>
            <h1 className="max-w-4xl text-display-sm">{success ? 'Pedido recebido' : 'Acesso à sua compra'}<span className="text-red">.</span></h1>
            <div className="mt-10 max-w-xl border-t border-[#222222] pt-8 text-lg leading-relaxed text-[#e8e8e0]">
              {success ? (
                <>
                  <p>O checkout retornou com sucesso. O pagamento será confirmado pelo webhook e a licença será gerada para o Ameno Cotas.</p>
                  <p className="mt-5 text-sm text-[#666666]">A entrega automática do token ainda está sendo conectada. Para suporte, escreva para contato@ameno.studio.</p>
                </>
              ) : (
                <p>A compra é direta e não exige cadastro. Depois do pagamento, volte por este endereço para acompanhar a confirmação.</p>
              )}
            </div>
            <Link href="/plugins" className="mt-10 inline-flex border border-[#E63B2E] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[#E63B2E] transition-colors hover:bg-[#E63B2E] hover:text-white">
              Voltar aos plugins →
            </Link>
          </div>

          <div className="account-status-card" aria-label="Fluxo de confirmação da compra">
            <div className="account-status-heading">
              <span className={`account-status-dot${success ? ' is-active' : ''}`} aria-hidden="true" />
              <span>{success ? 'PROCESSANDO PEDIDO' : 'AGUARDANDO PEDIDO'}</span>
            </div>
            <div className="account-flow">
              <div><span>01</span><strong>CHECKOUT</strong><small>Pagamento único</small></div>
              <i aria-hidden="true" />
              <div><span>02</span><strong>WEBHOOK</strong><small>Confirmação segura</small></div>
              <i aria-hidden="true" />
              <div><span>03</span><strong>LICENÇA</strong><small>Token individual</small></div>
            </div>
            <div className="account-rule" />
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#666666]">Ameno Cotas / versão 0.1 / 2026</p>
          </div>
        </div>
      </div>
    </section>
  )
}
