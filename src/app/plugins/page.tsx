import PurchaseForm from './purchase-form'
import { STRIPE_MIN_AMOUNT, STRIPE_SUGGESTED_AMOUNT } from '@/lib/stripe'

export const metadata = {
  title: 'Ameno Cotas — Plugin para 3ds Max',
  description: 'Gera cotas automaticamente por layer com render integrado. Compatível com 3ds Max 2024–2026 e Corona 12+.',
}

const FEATURES = [
  {
    icon: '⌗',
    title: 'Cotas automáticas por layer',
    description: 'Selecione os objetos, escolha o layer e o plugin gera todas as cotas automaticamente, sem trabalho manual.',
  },
  {
    icon: '◎',
    title: 'Render integrado',
    description: 'As cotas são geradas já preparadas para render — sem ajustes adicionais entre a modelagem e a entrega.',
  },
  {
    icon: '▦',
    title: 'Compatível com seu fluxo',
    description: 'Funciona dentro do 3ds Max com Corona 12+. Não muda sua forma de trabalhar — apenas elimina o repetitivo.',
  },
]

const STEPS = [
  { num: '01', title: 'Selecione os objetos', body: 'Selecione os objetos que deseja cotar dentro do 3ds Max. Podem ser paredes, móveis, fachadas — qualquer elemento organizado por layer.' },
  { num: '02', title: 'Execute o plugin', body: 'Abra o Ameno Cotas pelo menu de scripts. Escolha o plano de cota (planta, fachada ou corte) e configure as preferências de estilo.' },
  { num: '03', title: 'Cotas geradas automaticamente', body: 'O plugin analisa os objetos selecionados, calcula as distâncias e posiciona as cotas no espaço 3D com precisão. Pronto para render.' },
]

const FAQ = [
  {
    q: 'Posso usar em mais de um computador?',
    a: 'Cada compra gera uma licença para um computador. O plugin vincula a licença na primeira vez que é usado. Para trocar de máquina, entre em contato.',
  },
  {
    q: 'O que acontece se eu reinstalar o Windows?',
    a: 'Se precisar trocar de máquina ou reinstalar o sistema, entre em contato para fazer o reset da licença. Por enquanto o processo é manual e sem custo.',
  },
  {
    q: 'Funciona sem internet?',
    a: 'O plugin tolera até 7 dias sem conexão. Após esse período, ele precisa de uma verificação online para continuar funcionando.',
  },
  {
    q: 'Atualizações estão incluídas?',
    a: 'A compra garante a versão atual e suas correções de bugs. Versões com funcionalidades novas significativas poderão ter custo adicional — você sempre será avisado.',
  },
  {
    q: 'Posso pedir reembolso?',
    a: 'Por se tratar de software digital com entrega imediata, não há reembolso após a ativação da licença. Em caso de dúvidas antes da compra, entre em contato.',
  },
]

export default function PluginsPage() {
  const minLabel = `R$ ${(STRIPE_MIN_AMOUNT / 100).toFixed(2).replace('.', ',')}`

  return (
    <main className="plugin-page" aria-labelledby="plugin-title">

      {/* ── HERO DO PRODUTO ─────────────────────────────────── */}
      <section className="plugin-hero">
        <div className="plugin-hero-inner">
          <div className="plugin-hero-topline">
            <span>AMENO TOOLS / 001</span>
            <span>PLUGIN PARA 3DS MAX</span>
          </div>
          <h1 id="plugin-title" className="plugin-hero-title">
            Ameno<br /><em className="font-editorial">Cotas.</em>
          </h1>
          <p className="plugin-hero-subtitle">
            Gera cotas automaticamente por layer com render integrado.<br />
            Compatível com 3ds Max 2024–2026 e Corona 12+.
          </p>
          <div className="plugin-hero-badges">
            <span className="plugin-badge">3ds Max 2024–2026</span>
            <span className="plugin-badge">Corona 12+</span>
            <span className="plugin-badge">Windows</span>
            <span className="plugin-badge plugin-badge--red">Pay-what-you-want</span>
          </div>
        </div>
      </section>

      {/* ── O QUE FAZ ───────────────────────────────────────── */}
      <section className="plugin-section" aria-labelledby="features-title">
        <div className="plugin-section-inner">
          <div className="plugin-section-header">
            <span className="plugin-section-tag">O QUE FAZ</span>
            <h2 id="features-title">Um plugin que devolve tempo.</h2>
            <p>
              Cotar desenhos técnicos no 3ds Max é um processo manual e repetitivo.
              O Ameno Cotas automatiza essa etapa — você configura uma vez e entrega cotas consistentes sempre.
            </p>
          </div>
          <div className="plugin-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="plugin-feature-card">
                <span className="plugin-feature-icon" aria-hidden="true">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ───────────────────────────────────── */}
      <section className="plugin-section plugin-section--dark" aria-labelledby="how-title">
        <div className="plugin-section-inner">
          <div className="plugin-section-header">
            <span className="plugin-section-tag">COMO FUNCIONA</span>
            <h2 id="how-title">Três passos. Sem complicação.</h2>
          </div>
          <ol className="plugin-steps">
            {STEPS.map((step) => (
              <li key={step.num} className="plugin-step">
                <span className="plugin-step-num" aria-hidden="true">{step.num}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── REQUISITOS ──────────────────────────────────────── */}
      <section className="plugin-section" aria-labelledby="req-title">
        <div className="plugin-section-inner plugin-section-inner--narrow">
          <span className="plugin-section-tag">REQUISITOS</span>
          <h2 id="req-title" className="plugin-req-title">Compatibilidade</h2>
          <dl className="plugin-req-grid">
            <div className="plugin-req-item">
              <dt>Software</dt>
              <dd>3ds Max 2024, 2025 ou 2026</dd>
            </div>
            <div className="plugin-req-item">
              <dt>Render</dt>
              <dd>Corona Renderer 12 ou superior</dd>
            </div>
            <div className="plugin-req-item">
              <dt>Sistema</dt>
              <dd>Windows 10 / 11 (64-bit)</dd>
            </div>
            <div className="plugin-req-item">
              <dt>Licença</dt>
              <dd>1 computador por compra</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── COMPRA + LICENÇA ────────────────────────────────── */}
      <section className="plugin-section plugin-section--dark plugin-purchase-section" aria-labelledby="purchase-title">
        <div className="plugin-section-inner plugin-section-inner--split">
          {/* Explicação da licença */}
          <div className="plugin-license-info">
            <span className="plugin-section-tag">LICENCIAMENTO</span>
            <h2 id="purchase-title">Como funciona a licença</h2>
            <ul className="plugin-license-list">
              <li>
                <span className="plugin-license-icon" aria-hidden="true">↳</span>
                <span><strong>1 compra = 1 licença = 1 computador.</strong> Sem compartilhamento.</span>
              </li>
              <li>
                <span className="plugin-license-icon" aria-hidden="true">↳</span>
                <span>Na primeira vez que você usa o plugin, ele pede um token e vincula à sua máquina automaticamente.</span>
              </li>
              <li>
                <span className="plugin-license-icon" aria-hidden="true">↳</span>
                <span>A verificação acontece online ao abrir o 3ds Max. O plugin tolera até <strong>7 dias offline</strong>.</span>
              </li>
              <li>
                <span className="plugin-license-icon" aria-hidden="true">↳</span>
                <span>Para trocar de computador, entre em contato — o processo de reset é manual e gratuito.</span>
              </li>
            </ul>
            <p className="plugin-license-note">
              Pagamento único por versão. Sem assinatura. Sem cadastro obrigatório.
            </p>
          </div>

          {/* Formulário de compra */}
          <div className="plugin-purchase-box">
            <div className="plugin-purchase-header">
              <p className="plugin-purchase-product">Ameno Cotas</p>
              <p className="plugin-purchase-version">Versão atual · Pagamento único</p>
            </div>
            <div className="plugin-purchase-price-hint">
              <p>Escolha o quanto quer pagar</p>
              <p className="plugin-purchase-min">mínimo {minLabel}</p>
            </div>
            <PurchaseForm minimum={STRIPE_MIN_AMOUNT} suggested={STRIPE_SUGGESTED_AMOUNT} />
            <p className="plugin-purchase-security">
              Pagamento seguro via Stripe · SSL · sem armazenar dados do cartão
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="plugin-section" aria-labelledby="faq-title">
        <div className="plugin-section-inner plugin-section-inner--narrow">
          <span className="plugin-section-tag">DÚVIDAS FREQUENTES</span>
          <h2 id="faq-title">Perguntas comuns</h2>
          <dl className="plugin-faq">
            {FAQ.map((item) => (
              <div key={item.q} className="plugin-faq-item">
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
          <p className="plugin-faq-contact">
            Mais dúvidas?{' '}
            <a href="mailto:contato@ameno.studio" className="plugin-faq-link">
              contato@ameno.studio
            </a>
          </p>
        </div>
      </section>

    </main>
  )
}
