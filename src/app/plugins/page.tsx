import PurchaseForm from './purchase-form'
import { STRIPE_MIN_AMOUNT, STRIPE_SUGGESTED_AMOUNT } from '@/lib/stripe'
import PluginDiagram from '@/components/plugins/PluginDiagram'

export default function PluginsPage() {
  return (
    <section className="plugins-page relative overflow-hidden px-6 pb-28 pt-36 sm:pb-40 sm:pt-48" aria-labelledby="plugins-title">
      <div className="page-grid" aria-hidden="true" />
      <div className="mx-auto max-w-[1440px]">
        <div className="page-topline">
          <p>LOJA / FERRAMENTAS AMENO</p>
          <p>001 — 001</p>
        </div>
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24">
          <div>
            <h1 id="plugins-title" className="text-display-sm max-w-5xl">Ameno Cotas<span className="text-red">.</span></h1>
            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-[#e8e8e0]">Plugin para 3ds Max — gera cotas automaticamente por layer com render integrado.</p>
            <p className="mt-5 max-w-2xl leading-relaxed text-[#666666]">Compatível com 3ds Max 2024–2026 e Corona 12+. Pagamento único por versão, sem assinatura e sem cadastro obrigatório.</p>
            <div className="mt-12 max-w-xl border-l border-[#E63B2E] pl-5 text-sm leading-relaxed text-[#a0a098]">
              Uma licença para um computador. O plugin verifica o token no início e vincula o primeiro uso à máquina.
            </div>
            <div className="mt-12 grid max-w-xl gap-4 border-t border-[#222222] pt-5 text-sm text-[#666666] sm:grid-cols-2">
              <p><span className="text-[#e8e8e0]">Compatibilidade</span><br />3ds Max 2024–2026</p>
              <p><span className="text-[#e8e8e0]">Render</span><br />Corona 12+</p>
              <p><span className="text-[#e8e8e0]">Sistema</span><br />Windows</p>
              <p><span className="text-[#e8e8e0]">Modelo</span><br />Pay-what-you-want</p>
            </div>
          </div>
          <div className="plugin-purchase-column">
            <PluginDiagram />
            <div className="border-t border-[#222222] pt-6 lg:border lg:p-8">
            <p className="mb-7 text-xs uppercase tracking-[0.2em] text-[#666666]">Apoie esta versão</p>
            <PurchaseForm minimum={STRIPE_MIN_AMOUNT} suggested={STRIPE_SUGGESTED_AMOUNT} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
