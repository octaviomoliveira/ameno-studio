import { STRIPE_MIN_AMOUNT, STRIPE_SUGGESTED_AMOUNT } from '@/lib/stripe'
import PluginDiagram from '@/components/plugins/PluginDiagram'
import PluginTutorial from '@/components/plugins/PluginTutorial'
import styles from './page.module.css'

export const metadata = {
  title: 'Ameno Cotas — Plugin e Tutorial Completo para 3ds Max 2026',
  description:
    'Apresentação completa e tutorial passo a passo do Ameno Cotas para 3ds Max 2026: cotas individuais e em cadeia, âncoras reativas em vértices, editor de estilos 2D, revisão auditável e passe PNG transparente para Corona e V-Ray.',
}

const FEATURES = [
  {
    title: 'Medir 1 vão ou vários seguidos',
    description:
      'Dê 3 cliques pra medir um espaço isolado ou saia clicando nos cantos do armário pra fazer uma fila inteira de cotas alinhadas de uma vez só.',
  },
  {
    title: 'Mudou o móvel? A cota muda sozinha',
    description:
      'As cotas ficam presas nas quinas do seu modelo. Se você arrastar uma parede ou mexer no móvel depois, o número atualiza na hora sem precisar refazer.',
  },
  {
    title: 'Planta (visto de cima) ou Fachada (de frente)',
    description:
      'Funciona tanto pra plantas baixas vistas de cima quanto pra vistas frontais de marcenaria e cortes, na horizontal ou na vertical.',
  },
  {
    title: 'Troque seta, tracinho, cor e tamanho',
    description:
      'Aumente a letra, engrosse a linha e escolha entre tracinho (Tick), seta fechada, seta aberta, bolinha ou losango vendo o desenho mudar na hora.',
  },
  {
    title: 'Arredonde ou digite o número que quiser',
    description:
      'Deu 1803 mm no 3D mas você quer escrever 1800 mm? Arredonde ou digite o valor na mão — a cota fica laranja na tela pra você lembrar que foi editada.',
  },
  {
    title: 'Salve PNG sem fundo pro Photoshop',
    description:
      'Gere em segundos uma imagem PNG transparente só com as cotas (no Corona ou V-Ray) pra jogar por cima do seu render pronto, sem renderizar a cena de novo.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Cole seu código na 1ª vez',
    body: 'Coloque a pasta do plugin no 3ds Max, abra pelo menu Ameno Tools e cole seu código. Depois da 1ª vez ele já abre direto liberado (mesmo com o Max bloqueado no Firewall).',
  },
  {
    num: '02',
    title: 'Escolha 1 medida ou várias seguidas',
    body: 'Na primeira aba (Cotar), escolha se quer medir um espaço só ou vários seguidos, e marque se está olhando em Planta ou Fachada.',
  },
  {
    num: '03',
    title: 'Dê 3 cliques com o imã (Tecla S)',
    body: 'Com o Snap do Max ligado, clique no começo, clique no fim e puxe a linha pro lado. A cota já nasce presa no móvel.',
  },
  {
    num: '04',
    title: 'Ajuste o visual ou arredonde medidas',
    body: 'Se quiser mudar o tamanho da letra ou trocar tracinho por seta, use a aba Estilos. Se quiser arredondar um número quebrado, use a aba Revisar.',
  },
  {
    num: '05',
    title: 'Clique em Exportar PNG e jogue no Photoshop',
    body: 'Na aba Exportar, salve o PNG com fundo transparente em segundos e solte por cima do seu render pronto.',
  },
]

const FAQ = [
  {
    q: 'Como instalo e onde acho o botão dentro do 3ds Max?',
    a: 'Com o 3ds Max fechado, coloque a pasta AmenoTools dentro de %APPDATA%\\Autodesk\\ApplicationPlugins\\AmenoTools. Quando abrir o 3ds Max 2026, vai aparecer o menu "Ameno Tools" lá no topo da tela.',
  },
  {
    q: 'Meu 3ds Max é bloqueado no Firewall do Windows. Vai funcionar?',
    a: 'Sim, funciona normal! O plugin valida seu código por fora do 3ds Max justamente para o Firewall nunca atrapalhar. E depois de entrar, você pode ficar até 7 dias sem internet que ele continua funcionando.',
  },
  {
    q: 'Se eu mexer no móvel depois de cotar, tenho que apagar e cotar de novo?',
    a: 'Não! Como a cota fica presa nos cantos da peça, quando você arrasta o móvel ou puxa os pontos no Edit Poly, a linha estica e o número muda sozinho.',
  },
  {
    q: 'E se o meu 3D estiver com medida quebrada (tipo 1803 mm) e eu quiser mostrar 1800 mm?',
    a: 'Na aba Revisar você pode mandar arredondar ou digitar 1800 na mão. A cota fica laranja na tela do Max pra você lembrar que mudou aquele número.',
  },
  {
    q: 'Posso usar em outro computador se eu formatar ou trocar de PC?',
    a: 'Cada compra vale para 1 computador por vez. Se você formatar ou trocar de máquina, é só chamar a gente no suporte que liberamos pro computador novo gratuitamente.',
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
                Cotas técnicas reativas, editor de estilos 2D e exportação em passe PNG transparente direto no 3ds Max 2026.
              </p>
              <div className={styles.heroActions}>
                <a href="#tutorial" className={styles.heroTutorialBtn}>
                  Explorar tutorial interativo ↓
                </a>
                <span>Em preparação<br />Compra temporariamente indisponível</span>
              </div>
            </div>
            <div className={styles.heroVisual}><PluginDiagram /></div>
          </div>
          <div className="plugin-hero-badges">
            <span className="plugin-badge">Compatível: 3ds Max 2026</span>
            <span className="plugin-badge">Passe PNG: Corona &amp; V-Ray</span>
            <span className="plugin-badge">Âncoras 3D Reativas</span>
            <span className="plugin-badge">Offline até 7 dias (DPAPI)</span>
          </div>
        </div>
      </section>

      {/* ── O QUE FAZ (TODAS AS FUNÇÕES) ────────────────────── */}
      <section className="plugin-section" aria-labelledby="features-title">
        <div className="plugin-section-inner">
          <div className="plugin-section-header">
            <span className="plugin-section-tag">RECURSOS COMPLETOS</span>
            <h2 id="features-title">Um sistema completo de cotagem dentro do 3ds Max.</h2>
            <p>
              Cotar desenhos técnicos e marcenaria no 3ds Max sempre foi um processo manual e frágil.
              O Ameno Cotas reúne criação individual e contínua, âncoras inteligentes em vértices,
              padronização gráfica, auditoria de medidas e render em passe transparente.
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

      {/* ── TUTORIAL INTERATIVO ABA POR ABA ─────────────────── */}
      <PluginTutorial />

      {/* ── FLUXO COMPLETO DO ZERO À PÓS-PRODUÇÃO ───────────── */}
      <section className="plugin-section plugin-section--dark" aria-labelledby="how-title">
        <div className="plugin-section-inner">
          <div className="plugin-section-header">
            <span className="plugin-section-tag">FLUXO DE TRABALHO</span>
            <h2 id="how-title">Do clique na viewport ao PNG na pós-produção.</h2>
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
              <dd>Autodesk 3ds Max 2026 (Python 3.11 / PySide6 nativo)</dd>
            </div>
            <div className="plugin-req-item">
              <dt>Render</dt>
              <dd>Corona Renderer e V-Ray (exportação de passe PNG com Alpha)</dd>
            </div>
            <div className="plugin-req-item">
              <dt>Sistema</dt>
              <dd>Windows 10 / 11 64-bit (mesmo com 3dsmax.exe bloqueado no Firewall)</dd>
            </div>
            <div className="plugin-req-item">
              <dt>Licença</dt>
              <dd>1 computador por compra com tolerância de até 7 dias offline</dd>
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
