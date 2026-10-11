import { STRIPE_MIN_AMOUNT, STRIPE_SUGGESTED_AMOUNT } from '@/lib/stripe'
import PluginDiagram from '@/components/plugins/PluginDiagram'
import styles from './page.module.css'

export const metadata = {
  title: 'Ameno Cotas — Plugin para 3ds Max',
  description: 'Ameno Cotas para 3ds Max em preparação. Compatibilidade e licenciamento ainda em validação.',
}

const FEATURES = [
  {
    title: 'Cotas em layer dedicado',
    description: 'Organize as cotas separadamente da geometria para revisar a planta com clareza.',
  },
  {
    title: 'Editor de estilos',
    description: 'Ajuste texto, linhas, terminais e cores das cotas antes da entrega.',
  },
  {
    title: 'Render das cotas',
    description: 'O fluxo de render com Corona e V-Ray está em validação para o lançamento.',
  },
]

const STEPS = [
  { num: '01', title: 'Marque os pontos', body: 'Indique na viewport os pontos que definem a medida.' },
  { num: '02', title: 'Ajuste o estilo', body: 'Configure fonte, linhas, terminais e cores no editor de estilos.' },
  { num: '03', title: 'Revise a saída', body: 'Confira os valores e a aparência das cotas no layer dedicado antes da entrega.' },
]

const FAQ = [
  {
    q: 'Posso usar em mais de um computador?',
    a: 'A política planejada é uma licença por compra, vinculada a um computador. A ativação ainda está em implementação.',
  },
  {
    q: 'O que acontece se eu reinstalar o Windows?',
    a: 'A transferência manual e gratuita está prevista, mas o procedimento será confirmado antes da abertura das vendas.',
  },
  {
    q: 'Funciona sem internet?',
    a: 'A meta é permitir até 7 dias offline após a verificação online. Esse comportamento ainda está em implementação.',
  },
  {
    q: 'Atualizações estão incluídas?',
    a: 'As condições de atualização serão publicadas antes da abertura das vendas.',
  },
  {
    q: 'Posso pedir reembolso?',
    a: 'A política de reembolso será publicada antes da abertura das vendas. No momento não aceitamos pagamentos.',
  },
]

export default function PluginsPage() {
  const minLabel = `R$ ${(STRIPE_MIN_AMOUNT / 100).toFixed(2).replace('.', ',')}`

  return (
    <div className={`plugin-page ${styles.page}`}>

      {/* ── HERO DO PRODUTO ─────────────────────────────────── */}
      <section className="plugin-hero">
        <div className={`plugin-hero-inner ${styles.heroInner}`}>
          <div className="plugin-hero-topline">
            <span>AMENO TOOLS / 001</span>
            <span>PLUGIN PARA 3DS MAX</span>
          </div>
          <div className={styles.heroGrid}>
            <div>
              <h1 id="plugin-title" className="plugin-hero-title">
                Ameno<br /><em className="font-editorial">Cotas.</em>
              </h1>
              <p className="plugin-hero-subtitle">
                Ferramenta de cotas para 3ds Max. Lançamento em preparação.
              </p>
              <div className={styles.heroActions}>
                <span>Em preparação<br />Compra temporariamente indisponível</span>
              </div>
            </div>
            <div className={styles.heroVisual}><PluginDiagram /></div>
          </div>
          <div className="plugin-hero-badges">
            <span className="plugin-badge">Meta: 3ds Max 2021–2027</span>
            <span className="plugin-badge">Corona e V-Ray em validação</span>
            <span className="plugin-badge">Windows</span>
            <span className="plugin-badge">Valor livre planejado</span>
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
              O Ameno Cotas organiza medidas e estilos em um fluxo próprio. O produto ainda está em validação para venda.
            </p>
          </div>
          <div className="plugin-features-grid">
            {FEATURES.map((f, index) => (
              <div key={f.title} className="plugin-feature-card">
                <span className="plugin-feature-icon" aria-hidden="true">0{index + 1}</span>
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
              <dd>Meta: 3ds Max 2021 a 2027; homologação pendente</dd>
            </div>
            <div className="plugin-req-item">
              <dt>Render</dt>
              <dd>Corona e V-Ray; integração em validação</dd>
            </div>
            <div className="plugin-req-item">
              <dt>Sistema</dt>
              <dd>Windows 64-bit; homologação pendente</dd>
            </div>
            <div className="plugin-req-item">
              <dt>Licença</dt>
              <dd>1 computador por compra; política planejada</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── COMPRA + LICENÇA ────────────────────────────────── */}
      <section id="licenca" className="plugin-section plugin-section--dark plugin-purchase-section" aria-labelledby="purchase-title">
        <div className="plugin-section-inner plugin-section-inner--split">
          {/* Explicação da licença */}
          <div className="plugin-license-info">
            <span className="plugin-section-tag">LICENCIAMENTO</span>
            <h2 id="purchase-title">Licenciamento planejado</h2>
            <p className="plugin-license-note">Estas condições serão confirmadas antes da abertura das vendas.</p>
            <ul className="plugin-license-list">
              <li>
                <span className="plugin-license-icon" aria-hidden="true">↳</span>
                <span><strong>Meta: 1 compra = 1 licença = 1 computador.</strong> Ativação ainda em implementação.</span>
              </li>
              <li>
                <span className="plugin-license-icon" aria-hidden="true">↳</span>
                <span>Está prevista a verificação de um token e o vínculo à máquina na primeira ativação.</span>
              </li>
              <li>
                <span className="plugin-license-icon" aria-hidden="true">↳</span>
                <span>Meta: verificação online com tolerância de até <strong>7 dias offline</strong>.</span>
              </li>
              <li>
                <span className="plugin-license-icon" aria-hidden="true">↳</span>
                <span>Está prevista a transferência manual e gratuita da licença para outro computador.</span>
              </li>
            </ul>
            <p className="plugin-license-note">
              Planejamos pagamento único com valor livre a partir de R$ 10,00. As condições finais serão publicadas antes da venda.
            </p>
          </div>

          {/* Aviso de venda suspensa */}
          <div id="comprar" className="plugin-purchase-box" tabIndex={-1}>
            <div className="plugin-purchase-header">
              <p className="plugin-purchase-product">Ameno Cotas</p>
              <p className="plugin-purchase-version">Lançamento em preparação</p>
            </div>
            <div className="plugin-purchase-price-hint">
              <p>Quando lançado: valor sugerido de R$ {(STRIPE_SUGGESTED_AMOUNT / 100).toFixed(2).replace('.', ',')}</p>
              <p className="plugin-purchase-min">mínimo {minLabel}</p>
            </div>
            <p role="status" className="plugin-purchase-security">
              As compras estão temporariamente indisponíveis enquanto finalizamos o pacote e a entrega. Nenhum pagamento está sendo recebido nesta página.
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

    </div>
  )
}
