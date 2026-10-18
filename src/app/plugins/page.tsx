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
    title: 'Cota individual e cadeia contínua',
    description:
      'Meça um vão isolado em 3 cliques ou encadeie vários vãos consecutivos na mesma linha base (estilo Revit), finalizando com um clique no espaço vazio.',
  },
  {
    title: 'Âncoras 3D e vértices reativos',
    description:
      'As cotas se prendem aos objetos e vértices do Editable Poly / Edit Poly. Moveu uma parede ou alterou a marcenaria? A medida e o desenho atualizam sozinhos.',
  },
  {
    title: 'Planta (XY) e Fachada / Vista',
    description:
      'Alterne entre o plano horizontal do mundo para plantas baixas e o plano da vista ativa para elevações, cortes e detalhamento de marcenaria, nas direções Automática, Horizontal ou Vertical.',
  },
  {
    title: 'Editor de estilos com prévia 2D',
    description:
      'Personalize fonte, tamanho, máscara de texto, linhas, cor e 6 tipos de terminais (Tick, Seta fechada, Seta aberta, Ponto, Losango ou Nenhum) com biblioteca global persistente entre cenas.',
  },
  {
    title: 'Revisão, arredondamento e destaque âmbar',
    description:
      'Compare o valor medido na cena com o exibido, arredonde em múltiplos exatos ou aplique valor manual com motivo documentado e destaque visual em âmbar (#F5A623) na viewport.',
  },
  {
    title: 'Passe PNG transparente (Corona e V-Ray)',
    description:
      'Exporte um passe separado em PNG com fundo transparente (Alpha) contendo todas as cotas ou apenas as selecionadas, sem sujar seu Beauty, LightMix ou materiais da cena.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Instale e ative seu token',
    body: 'Copie o pacote para ApplicationPlugins\\AmenoTools, abra pelo menu Ameno Tools no 3ds Max 2026 e ative com seu token UUID v4 — funciona inclusive com o 3dsmax.exe bloqueado no Firewall e por até 7 dias offline.',
  },
  {
    num: '02',
    title: 'Prepare a cena e escolha o modo',
    body: 'Na aba Cotar, clique em Preparar cena para estruturar a layer dedicada AMENO_COTAS, escolha Uma medida ou Várias medidas, defina Planta ou Fachada e a direção desejada.',
  },
  {
    num: '03',
    title: 'Marque os pontos com Snap 3D',
    body: 'Com o Snap (tecla S) ativo em vértices, clique nos pontos do modelo. As cotas nascem ancoradas à geometria e acompanham futuras edições de malha ou movimentações.',
  },
  {
    num: '04',
    title: 'Padronize o estilo e revise valores',
    body: 'Ajuste terminais, fontes e cores na aba Estilos com prévia 2D ao vivo, e use a aba Revisar para arredondar medidas quebradas ou registrar ajustes executivos com auditoria em âmbar.',
  },
  {
    num: '05',
    title: 'Exporte o PNG transparente para pós',
    body: 'Na aba Exportar, gere em 1 clique o arquivo .png com canal Alpha via Corona ou V-Ray e sobreponha direto no Photoshop sem alterar nada na iluminação da sua cena.',
  },
]

const FAQ = [
  {
    q: 'Como faço a instalação e onde encontro o plugin dentro do 3ds Max?',
    a: 'Com o 3ds Max fechado, basta colocar a pasta AmenoTools dentro de %APPDATA%\\Autodesk\\ApplicationPlugins\\AmenoTools. Ao abrir o 3ds Max 2026, o menu "Ameno Tools" aparece automaticamente na barra superior (e a macro AbrirCotasPanel fica disponível em Customize User Interface).',
  },
  {
    q: 'Funciona se o 3ds Max estiver bloqueado no Firewall do Windows ou sem internet?',
    a: 'Sim. Na ativação, se o processo do 3ds Max estiver bloqueado no Firewall, o plugin utiliza automaticamente o worker Python autônomo do sistema operacional para validar o token. Após ativado, o cache local criptografado (DPAPI) permite trabalhar até 7 dias seguidos totalmente offline.',
  },
  {
    q: 'O que acontece se eu alterar a modelagem depois de criar as cotas?',
    a: 'As cotas criadas sobre objetos e vértices possuem âncoras reativas: ao mover o objeto ou deslocar vértices no Editable Poly / Edit Poly, a linha de cota acompanha o novo ponto e recalcula o valor medido automaticamente.',
  },
  {
    q: 'Se eu digitar um valor manual ou arredondar, como não esquecer que a medida foi alterada?',
    a: 'Na aba Revisar, toda cota com arredondamento ou valor/texto manual exibe a diferença exata entre o valor Medido na cena e o Exibido (ex.: 1803 mm vs. 1800 mm), registra o motivo da alteração e recebe cor âmbar (#F5A623) de auditoria na viewport.',
  },
  {
    q: 'Posso usar em mais de um computador ou formatar a máquina?',
    a: 'A política é de 1 licença vinculada a 1 computador por compra. Caso você troque de computador ou reinstale o Windows, a transferência manual da licença é gratuita mediante solicitação ao suporte.',
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
