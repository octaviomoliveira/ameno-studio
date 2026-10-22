'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'

export type CaseStudySlide = {
  id: string
  src: string
  label: string
  note: string
  badge: string
  badgeVariant?: 'before' | 'after' | 'default'
  chapter: string
}

export const ALL_DELICIAS_SLIDES: CaseStudySlide[] = [
  // Cap 01 — Levantamento & Antes (04 lâminas)
  {
    id: 'antes-fachada-geral',
    src: '/projects/autorais/delicias-da-ana/antes-fachada-geral.webp',
    label: 'Estado Original da Edificação — Antigo "Recanto do Sabor"',
    note: 'Registro in loco da fachada original de 3 pavimentos antes da unificação volumétrica e criação dos novos pórticos comerciais no térreo.',
    badge: '01 · ANTES (EXTERNO)',
    badgeVariant: 'before',
    chapter: '01 · Levantamento & Antes',
  },
  {
    id: 'antes-fachada-levantamento',
    src: '/projects/autorais/delicias-da-ana/antes-fachada-levantamento.webp',
    label: 'Levantamento Métrico de Fachada — Testada de 9,00m',
    note: 'Conferência de vãos estruturais em campo: módulos frontais de 2,67m, 2,86m e 2,81m com pé-direito comercial de 3,50m no pavimento térreo.',
    badge: '02 · LEVANTAMENTO IN LOCO',
    badgeVariant: 'before',
    chapter: '01 · Levantamento & Antes',
  },
  {
    id: 'antes-salao-interno',
    src: '/projects/autorais/delicias-da-ana/antes-salao-interno.webp',
    label: 'Estado Original do Salão — Corredor Estreito (2,65m) com Arco',
    note: 'Ambiente interno antes da intervenção: vão estreito de 2,65m segmentado por arco de alvenaria, baixa refletância lumínica e revestimentos antigos.',
    badge: '03 · ANTES (SALÃO INTERNO)',
    badgeVariant: 'before',
    chapter: '01 · Levantamento & Antes',
  },
  {
    id: 'antes-fundos-levantamento',
    src: '/projects/autorais/delicias-da-ana/antes-fundos-levantamento.webp',
    label: 'Diagnóstico da Área Úmida Posterior — Levantamento de Fundos',
    note: 'Mapeamento dimensional da antiga área de apoio (cotas 0,92m · 0,95m · 1,28m · 2,36m · 1,02m), substituída pela nova cozinha em inox e antecâmara.',
    badge: '04 · ANTES (FUNDOS)',
    badgeVariant: 'before',
    chapter: '01 · Levantamento & Antes',
  },

  // Cap 02 — Planta Humanizada Cotada (01 lâmina master)
  {
    id: 'planta-humanizada',
    src: '/projects/autorais/delicias-da-ana/planta-humanizada.webp',
    label: 'Planta Humanizada Cotada — Fluxo Linear em Lote 2,65m × 25,00m',
    note: 'Setorização completa (Salão 7,45m · Cozinha 5,65m · Antecâmara e Sanitário 2,75m) com cotas executivas geradas diretamente na cena 3D pelo plugin Ameno Cotas.',
    badge: '05 · PLANTA HUMANIZADA (AMENO COTAS)',
    badgeVariant: 'after',
    chapter: '02 · Planta Humanizada & Fluxo',
  },

  // Cap 03 — Fachada & Conjunto Comercial (03 lâminas)
  {
    id: 'fachada-limpa',
    src: '/projects/autorais/delicias-da-ana/fachada-limpa.webp',
    label: 'Retrofit Integral do Edifício — Vista Arquitetônica Limpa (R01)',
    note: 'Requalificação completa dos 3 pavimentos com brises verticais, caixilharia ritmada, iluminação linear em sanca e embasamento comercial unificado.',
    badge: '06 · FACHADA LIMPA (R01)',
    badgeVariant: 'after',
    chapter: '03 · Fachada & Conjunto Comercial',
  },
  {
    id: 'fachada-cotada',
    src: '/projects/autorais/delicias-da-ana/fachada.webp',
    label: 'Elevação Perspectivada com Cotas Executivas — Ameno Cotas (R02)',
    note: 'Modulação executiva de fachada diretamente sobre o render: pilares de 0,28m e vãos livres de 2,49m, 2,79m e 2,62m (alturas de 1,16m e 2,69m).',
    badge: '07 · FACHADA COTADA (R02)',
    badgeVariant: 'after',
    chapter: '03 · Fachada & Conjunto Comercial',
  },
  {
    id: 'fachada-terreo-zoom',
    src: '/projects/autorais/delicias-da-ana/fachada-terreo-zoom.webp',
    label: 'Close-Up do Embasamento Térreo — Pórtico Delícias da Ana & Vizinhança',
    note: 'Detalhe da testada comercial: pórtico amarelo mostarda em ACM e letreiro caixa para a Delícias da Ana em harmonia com a Barbearia Pais & Filhos.',
    badge: '08 · ZOOM TÉRREO COMERCIAL',
    badgeVariant: 'after',
    chapter: '03 · Fachada & Conjunto Comercial',
  },

  // Cap 04 — Salão de Atendimento & Comunicação Visual (05 lâminas)
  {
    id: 'atendimento-01',
    src: '/projects/autorais/delicias-da-ana/atendimento-01.webp',
    label: 'Salão de Atendimento — Eixo Central & Mesas Laterais (CAM01)',
    note: 'Perspectiva da entrada: mesas bistrô apoiadas junto às paredes liberam a circulação central de 2,65m até o balcão expositor ao fundo, com perfis lineares de LED no forro e pendentes aquecidos.',
    badge: '09 · SALÃO DE ATENDIMENTO (CAM01)',
    badgeVariant: 'after',
    chapter: '04 · Salão de Atendimento & Cardápios',
  },
  {
    id: 'atendimento-02',
    src: '/projects/autorais/delicias-da-ana/atendimento-02.webp',
    label: 'Balcão Ripado, PDV & Vitrine Aquecida (CAM02)',
    note: 'Ponto focal de conversão: balcão em marcenaria ripada preta e amarela, terminal de caixa ergonômico, estufa curva com iluminação dedicada e par de telas de cardápio.',
    badge: '10 · BALCÃO & VITRINE (CAM02)',
    badgeVariant: 'after',
    chapter: '04 · Salão de Atendimento & Cardápios',
  },
  {
    id: 'atendimento-03',
    src: '/projects/autorais/delicias-da-ana/atendimento-03.webp',
    label: 'Contra-Plano do Balcão para a Esquadria Frontal (CAM03)',
    note: 'Visada do operador de caixa em direção à calçada: transparência da esquadria de vidro piso-teto garante iluminação natural abundante e segurança.',
    badge: '11 · CONTRA-PLANO ENTRADA (CAM03)',
    badgeVariant: 'after',
    chapter: '04 · Salão de Atendimento & Cardápios',
  },
  {
    id: 'cardapio-01',
    src: '/projects/autorais/delicias-da-ana/cardapio-01.webp',
    label: 'Design de Menu Board 01 — Linha de Coxinhas & Combos',
    note: 'Comunicação visual de ponto de venda desenvolvida sob medida na paleta da marca para exibição nas telas superiores do balcão.',
    badge: '12 · MENU BOARD 01',
    badgeVariant: 'default',
    chapter: '04 · Salão de Atendimento & Cardápios',
  },
  {
    id: 'cardapio-02',
    src: '/projects/autorais/delicias-da-ana/cardapio-02.webp',
    label: 'Design de Menu Board 02 — Salgados, Bebidas & Sobremesas',
    note: 'Segundo painel digital compondo o par de telas sobre o balcão de atendimento, organizando categorias de produtos para decisão rápida na fila.',
    badge: '13 · MENU BOARD 02',
    badgeVariant: 'default',
    chapter: '04 · Salão de Atendimento & Cardápios',
  },

  // Cap 05 — Cozinha Industrial, Antecâmara & Sanitário (06 lâminas)
  {
    id: 'cozinha-01',
    src: '/projects/autorais/delicias-da-ana/cozinha-01.webp',
    label: 'Cozinha de Produção em Inox — Coifa, Fogão & Linha Fria (CAM02)',
    note: 'Operação gastronômica em pleno funcionamento dentro de 2,65m × 5,65m: revestimentos cerâmicos laváveis até o teto, bancadas e prateleiras em aço inox escovado, coifa industrial e corredor livre.',
    badge: '14 · COZINHA INDUSTRIAL (CAM02)',
    badgeVariant: 'after',
    chapter: '05 · Cozinha Industrial & Apoio',
  },
  {
    id: 'cozinha-02',
    src: '/projects/autorais/delicias-da-ana/cozinha-02.webp',
    label: 'Estação de Fritura, Exaustão & Bancada em L (CAM03)',
    note: 'Posicionamento estratégico da fritadeira de alta tiragem sob a coifa principal, ao lado da bancada em L em aço inox com cuba profunda para higienização.',
    badge: '15 · FRITURA & EXAUSTÃO (CAM03)',
    badgeVariant: 'after',
    chapter: '05 · Cozinha Industrial & Apoio',
  },
  {
    id: 'cozinha-03',
    src: '/projects/autorais/delicias-da-ana/cozinha-03.webp',
    label: 'Linha Fria & Transição para a Antecâmara (CAM04)',
    note: 'Bateria de refrigeração com freezer horizontal Polair de tampa dupla, refrigerador vertical LG Inverter em inox e porta de isolamento para a antecâmara.',
    badge: '16 · LINHA FRIA (CAM04)',
    badgeVariant: 'default',
    chapter: '05 · Cozinha Industrial & Apoio',
  },
  {
    id: 'cozinha-04-eixo',
    src: '/projects/autorais/delicias-da-ana/cozinha-04-eixo.webp',
    label: 'Eixo Operacional — Visada da Cozinha para a Vitrine & Salão (CAM05)',
    note: 'Conexão direta entre produção e venda: a porta de giro posiciona a saída de assadeiras e frituras a dois passos da vitrine aquecida do balcão.',
    badge: '17 · EIXO PRODUÇÃO → VENDA (CAM05)',
    badgeVariant: 'after',
    chapter: '05 · Cozinha Industrial & Apoio',
  },
  {
    id: 'antecamara',
    src: '/projects/autorais/delicias-da-ana/antecamara.webp',
    label: 'Antecâmara Sanitária & Armário Piso-Teto de Insumos (CAM01)',
    note: 'Barreira sanitária obrigatória entre a cozinha e o banheiro, aproveitada com marcenaria piso-teto para armazenamento organizado de embalagens e secos.',
    badge: '18 · ANTECÂMARA & DEPÓSITO',
    badgeVariant: 'default',
    chapter: '05 · Cozinha Industrial & Apoio',
  },
  {
    id: 'banheiro',
    src: '/projects/autorais/delicias-da-ana/banheiro.webp',
    label: 'Sanitário — Bancada Esculpida em Pedra & Luz Indireta (CAM01)',
    note: 'Fechamento do eixo posterior (2,65m × 2,75m): cuba esculpida em pedra escura, espelho retroiluminado em LED quente e revestimento marmorizado.',
    badge: '19 · SANITÁRIO (CAM01)',
    badgeVariant: 'default',
    chapter: '05 · Cozinha Industrial & Apoio',
  },
]

const SLIDE_INDEX_BY_ID: Record<string, number> = Object.fromEntries(
  ALL_DELICIAS_SLIDES.map((s, idx) => [s.id, idx])
)

export default function DeliciasDaAnaCaseStudy() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (lightboxIndex === null) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxIndex(null)
      } else if (event.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % ALL_DELICIAS_SLIDES.length
        )
      } else if (event.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + ALL_DELICIAS_SLIDES.length) % ALL_DELICIAS_SLIDES.length
        )
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxIndex])

  const openSlide = (id: string) => {
    const idx = SLIDE_INDEX_BY_ID[id] ?? 0
    setLightboxIndex(idx)
  }

  const renderMediaCard = (
    id: string,
    aspectClass: string = styles.aspectPortrait
  ) => {
    const slide = ALL_DELICIAS_SLIDES[SLIDE_INDEX_BY_ID[id]]
    if (!slide) return null

    const badgeClass =
      slide.badgeVariant === 'before'
        ? `${styles.mediaBadge} ${styles.mediaBadgeBefore}`
        : slide.badgeVariant === 'after'
        ? `${styles.mediaBadge} ${styles.mediaBadgeAfter}`
        : styles.mediaBadge

    return (
      <article key={slide.id} className={styles.mediaCard}>
        <button
          type="button"
          className={`${styles.mediaButton} ${aspectClass}`}
          onClick={() => openSlide(slide.id)}
          aria-label={`Ampliar lâmina: ${slide.label}`}
        >
          <Image
            src={slide.src}
            alt={slide.label}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          <span className={badgeClass}>{slide.badge}</span>
          <span className={styles.mediaZoomHint}>AMPLIAR ↗</span>
        </button>
        <div className={styles.mediaCaption}>
          <h3 className={styles.mediaCaptionTitle}>{slide.label}</h3>
          <p className={styles.mediaCaptionNote}>{slide.note}</p>
        </div>
      </article>
    )
  }

  const currentSlide =
    lightboxIndex !== null ? ALL_DELICIAS_SLIDES[lightboxIndex] : null

  return (
    <div className={styles.page}>
      {/* HERO DO ESTUDO DE CASO */}
      <header className={styles.hero}>
        <div className={styles.topline}>
          <Link href="/portfolio" className={styles.backLink}>
            <span aria-hidden="true">←</span> VOLTAR AO CATÁLOGO DE PORTFÓLIO
          </Link>
          <span>
            PROJETO AUTORAL #04 · ARQUITETURA COMERCIAL & GASTRONOMIA · DOSSIÊ COMPLETO (19 LÂMINAS)
          </span>
        </div>

        <div className={styles.heroGrid}>
          <div>
            <span className={styles.kicker}>
              ESTUDO DE CASO COMPLETO · ARQUITETURA COMERCIAL, FLUXO & RETROFIT
            </span>
            <h1 className={styles.title}>
              Delícias <em className="font-editorial">da Ana.</em>
            </h1>
            <p className={styles.subtitle}>
              Como transformar um corredor comercial de <strong>2,65m × 25,00m</strong> em uma operação gastronômica de alta conversão — do levantamento in loco à cozinha industrial em inox.
            </p>
          </div>

          <div className={styles.leadBox}>
            <p className={styles.leadText}>
              Em arquitetura comercial gastronômica, estética sem engenharia de fluxo gera fila travada e perda de vendas. Neste dossiê completo, reunimos as <strong>19 lâminas técnicas do projeto</strong>: o diagnóstico fotográfico com medidas de campo, a planta humanizada cotada via <strong>Ameno Cotas</strong>, o retrofit do conjunto de 3 pavimentos, o salão de atendimento e a cozinha industrial em aço inox.
            </p>
            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setLightboxIndex(0)}
              >
                <span>ABRIR ÁLBUM EM TELA CHEIA (19 LÂMINAS)</span>
                <span aria-hidden="true">↗</span>
              </button>
              <a href="#cap-planta" className={styles.secondaryBtn}>
                <span>VER PLANTA HUMANIZADA COTADA</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* FICHA TÉCNICA ESTRUTURADA */}
      <section className={styles.specsBar} aria-label="Ficha Técnica do Projeto">
        <div className={styles.specItem}>
          <span className={styles.specLabel}>01 / TIPOLOGIA</span>
          <strong className={styles.specValue}>
            Arquitetura Comercial & Gastronomia <em>(Loja & Produção)</em>
          </strong>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>02 / GEOMETRIA DO LOTE</span>
          <strong className={styles.specValue}>
            Interno <em>2,65m × 25,00m</em> · Conjunto Frontal <em>9,00m</em>
          </strong>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>03 / SETORIZAÇÃO LINEAR</span>
          <strong className={styles.specValue}>
            Salão <em>7,45m</em> · Cozinha <em>5,65m</em> · Apoio <em>2,75m</em>
          </strong>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>04 / ESCOPO DE PROJETO</span>
          <strong className={styles.specValue}>
            Levantamento, Fachada, Interiores, Cozinha Inox & Menu Boards
          </strong>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>05 / AUTOMAÇÃO & COTAGEM</span>
          <strong className={styles.specValue}>
            3ds Max + Corona + Plugin Autoral <em>Ameno Cotas</em>
          </strong>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>06 / MATERIAL PUBLICADO</span>
          <strong className={styles.specValue}>
            <em>19 Lâminas</em> (Antes, Levantamento, Planta Cotada & Vistas Humanizadas)
          </strong>
        </div>
      </section>

      {/* NAVEGAÇÃO RÁPIDA POR CAPÍTULOS (STICKY) */}
      <div className={styles.chapterNavWrap}>
        <nav className={styles.chapterNav} aria-label="Capítulos do estudo de caso">
          <a href="#cap-levantamento" className={styles.chapterNavLink}>
            <span>01</span> LEVANTAMENTO & ANTES (04)
          </a>
          <a href="#cap-planta" className={styles.chapterNavLink}>
            <span>02</span> PLANTA HUMANIZADA & FLUXO (01)
          </a>
          <a href="#cap-fachada" className={styles.chapterNavLink}>
            <span>03</span> FACHADA & CONJUNTO (03)
          </a>
          <a href="#cap-atendimento" className={styles.chapterNavLink}>
            <span>04</span> SALÃO & CARDÁPIOS (05)
          </a>
          <a href="#cap-cozinha" className={styles.chapterNavLink}>
            <span>05</span> COZINHA INOX & APOIO (06)
          </a>
          <button
            type="button"
            className={styles.chapterNavLink}
            onClick={() => setLightboxIndex(0)}
          >
            <span>↗</span> MODO APRESENTAÇÃO (19)
          </button>
        </nav>
      </div>

      {/* CAPÍTULO 01 — LEVANTAMENTO IN LOCO & ESTADO ORIGINAL (ANTES) */}
      <section id="cap-levantamento" className={styles.chapter}>
        <div className={styles.chapterHeader}>
          <div>
            <span className={styles.chapterTag}>
              CAPÍTULO 01 · DIAGNÓSTICO DE CAMPO & LEVANTAMENTO MÉTRICO
            </span>
            <h2 className={styles.chapterTitle}>
              O ponto de partida real: <em className="font-editorial">antes da intervenção.</em>
            </h2>
          </div>
          <p className={styles.chapterDesc}>
            Todo projeto executivo sólido começa no levantamento rigoroso da preexistência. O imóvel original apresentava fachada sem hierarquia visual (antigo <em>Recanto do Sabor</em>), salão em corredor estreito de <strong>2,65m de largura</strong> interrompido por arco de alvenaria e uma área úmida posterior degradada. As quatro lâminas abaixo documentam o estado encontrado e as medições realizadas in loco.
          </p>
        </div>

        <div className={styles.mediaGrid2}>
          {renderMediaCard('antes-fachada-geral', styles.aspectLandscape)}
          {renderMediaCard('antes-fachada-levantamento', styles.aspectLandscape)}
          {renderMediaCard('antes-salao-interno', styles.aspectPortrait)}
          {renderMediaCard('antes-fundos-levantamento', styles.aspectPortrait)}
        </div>
      </section>

      {/* CAPÍTULO 02 — PLANTA HUMANIZADA COTADA & ENGENHARIA DE FLUXO */}
      <section id="cap-planta" className={styles.chapter}>
        <div className={styles.chapterHeader}>
          <div>
            <span className={styles.chapterTag}>
              CAPÍTULO 02 · IMPLANTAÇÃO, SETORIZAÇÃO & AMENO COTAS
            </span>
            <h2 className={styles.chapterTitle}>
              Planta humanizada cotada: <em className="font-editorial">três setores em linha.</em>
            </h2>
          </div>
          <p className={styles.chapterDesc}>
            Para vencer a geometria linear de <strong>2,65m × 25,00m</strong> sem cruzamento entre clientes, reposição de vitrine e manipulação de alimentos, organizamos a planta em três zonas estancas conectadas por um eixo central contínuo. Todas as cotas foram geradas diretamente na cena 3D com o plugin autoral <strong>Ameno Cotas</strong>.
          </p>
        </div>

        <div className={styles.planShowcase}>
          <div>{renderMediaCard('planta-humanizada', styles.aspectTall)}</div>

          <div className={styles.planDetails}>
            <div className={styles.zoneCard}>
              <div className={styles.zoneHeader}>
                <span className={styles.zoneNum}>ZONA 01 · FRENTE DE LOJA</span>
                <span className={styles.zoneDim}>2,65m × 7,45m</span>
              </div>
              <h3 className={styles.zoneTitle}>
                Salão de Atendimento, Mesas Rápidas & Vitrine Aquecida
              </h3>
              <p className={styles.zoneDesc}>
                Acesso franco pela esquadria de vidro frontal. As mesas bistrô para consumo rápido ficam encostadas nas laterais, liberando um corredor visual e físico desimpedido até o balcão ripado com terminal de caixa (PDV) e vitrine aquecida iluminada.
              </p>
            </div>

            <div className={styles.zoneCard}>
              <div className={styles.zoneHeader}>
                <span className={styles.zoneNum}>ZONA 02 · RETAGUARDA PRODUTIVA</span>
                <span className={styles.zoneDim}>2,65m × 5,65m</span>
              </div>
              <h3 className={styles.zoneTitle}>
                Cozinha Industrial em Aço Inox (Linha Quente, Fria & Lavagem)
              </h3>
              <p className={styles.zoneDesc}>
                Posicionada imediatamente atrás do balcão para reabastecimento em segundos. Contempla bancada em L com cuba profunda, estação de fritura e fogão industrial sob coifa de exaustão em inox, além de bateria fria com freezer horizontal duplo e refrigerador vertical.
              </p>
            </div>

            <div className={styles.zoneCard}>
              <div className={styles.zoneHeader}>
                <span className={styles.zoneNum}>ZONA 03 · ISOLAMENTO SANITÁRIO</span>
                <span className={styles.zoneDim}>2,65m × 2,75m</span>
              </div>
              <h3 className={styles.zoneTitle}>
                Antecâmara com Depósito Piso-Teto & Sanitário
              </h3>
              <p className={styles.zoneDesc}>
                Atendendo às normas sanitárias para áreas de manipulação de alimentos, o sanitário ao fundo é isolado da cozinha por uma antecâmara ventilada que abriga o armário piso-teto de insumos secos e embalagens.
              </p>
            </div>

            <div className={styles.pluginCallout}>
              <span className={styles.pluginCalloutTitle}>
                TECNOLOGIA PROPRIETÁRIA · PLUGIN AMENO COTAS (3DS MAX)
              </span>
              <p className={styles.pluginCalloutText}>
                Tanto as cotas desta planta humanizada quanto o dimensionamento executivo da fachada foram gerados dentro do próprio 3ds Max com o <strong>Ameno Cotas</strong> — eliminando retrabalho pós-render e garantindo precisão milimétrica na apresentação ao cliente e à obra.
              </p>
              <Link href="/plugins" className={styles.pluginCalloutLink}>
                CONHECER OS PLUGINS DO ESTÚDIO PARA 3DS MAX ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CAPÍTULO 03 — RETROFIT DE FACHADA & CONJUNTO COMERCIAL */}
      <section id="cap-fachada" className={styles.chapter}>
        <div className={styles.chapterHeader}>
          <div>
            <span className={styles.chapterTag}>
              CAPÍTULO 03 · RETROFIT URBANO & FACHADA COMERCIAL (9,00m)
            </span>
            <h2 className={styles.chapterTitle}>
              Presença urbana: <em className="font-editorial">do edifício inteiro ao pórtico térreo.</em>
            </h2>
          </div>
          <p className={styles.chapterDesc}>
            A intervenção externa foi além da porta da loja: requalificamos a fachada completa do edifício de três pavimentos (testada total de <strong>9,00m</strong>), organizando a paginação superior com brises e iluminação linear e criando pórticos independentes de forte identidade para a <strong>Delícias da Ana</strong> (vão de <strong>2,49m</strong>) e para os comércios vizinhos, incluindo a <em>Barbearia Pais & Filhos</em>.
          </p>
        </div>

        <div className={styles.mediaGrid2}>
          {renderMediaCard('fachada-limpa', styles.aspectLandscape)}
          {renderMediaCard('fachada-cotada', styles.aspectLandscape)}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          {renderMediaCard('fachada-terreo-zoom', styles.aspectWide)}
        </div>
      </section>

      {/* CAPÍTULO 04 — SALÃO DE ATENDIMENTO & CARDÁPIOS */}
      <section id="cap-atendimento" className={styles.chapter}>
        <div className={styles.chapterHeader}>
          <div>
            <span className={styles.chapterTag}>
              CAPÍTULO 04 · ARQUITETURA DE INTERIORES, MARCENARIA & PDV
            </span>
            <h2 className={styles.chapterTitle}>
              Salão de atendimento: <em className="font-editorial">ergonomia e ponto de venda.</em>
            </h2>
          </div>
          <p className={styles.chapterDesc}>
            Três enquadramentos complementares do salão humanizado (<strong>CAM01</strong> a partir da entrada, <strong>CAM02</strong> focado no balcão ripado e vitrine aquecida, e <strong>CAM03</strong> em contra-plano para a rua), acompanhados dos dois <strong>Menu Boards digitais</strong> desenhados sob medida pelo estúdio.
          </p>
        </div>

        <div className={styles.mediaGrid3}>
          {renderMediaCard('atendimento-01', styles.aspectPortrait)}
          {renderMediaCard('atendimento-02', styles.aspectPortrait)}
          {renderMediaCard('atendimento-03', styles.aspectPortrait)}
        </div>

        <div className={styles.mediaGrid2} style={{ marginTop: '1.5rem' }}>
          {renderMediaCard('cardapio-01', styles.aspectWide)}
          {renderMediaCard('cardapio-02', styles.aspectWide)}
        </div>
      </section>

      {/* CAPÍTULO 05 — COZINHA INDUSTRIAL, EIXO OPERACIONAL, ANTECÂMARA & SANITÁRIO */}
      <section id="cap-cozinha" className={styles.chapter}>
        <div className={styles.chapterHeader}>
          <div>
            <span className={styles.chapterTag}>
              CAPÍTULO 05 · BASTIDORES DE PRODUÇÃO & NORMAS SANITÁRIAS
            </span>
            <h2 className={styles.chapterTitle}>
              Cozinha em aço inox, <em className="font-editorial">antecâmara e apoio.</em>
            </h2>
          </div>
          <p className={styles.chapterDesc}>
            Onde o projeto se paga todos os dias: uma cozinha de <strong>2,65m × 5,65m</strong> revestida integralmente em cerâmica clara lavável, com bancada em L, coifa industrial sobre o bloco de cocção e fritura, linha fria dedicada e eixo direto de reposição para a vitrine do salão — finalizando na antecâmara com armário piso-teto e no sanitário com bancada esculpida.
          </p>
        </div>

        <div className={styles.mediaGrid3}>
          {renderMediaCard('cozinha-01', styles.aspectPortrait)}
          {renderMediaCard('cozinha-02', styles.aspectPortrait)}
          {renderMediaCard('cozinha-03', styles.aspectPortrait)}
          {renderMediaCard('cozinha-04-eixo', styles.aspectPortrait)}
          {renderMediaCard('antecamara', styles.aspectPortrait)}
          {renderMediaCard('banheiro', styles.aspectPortrait)}
        </div>
      </section>

      {/* LIGHTBOX EM TELA CHEIA PARA AS 19 LÂMINAS */}
      {currentSlide && lightboxIndex !== null && (
        <div
          className="project-album-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Dossiê completo Delícias da Ana"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxIndex(null)
          }}
        >
          <div className="project-album-dialog">
            <div className="project-album-header">
              <div className="project-album-header-left">
                <span className="project-album-kicker">
                  DELÍCIAS DA ANA · {currentSlide.chapter.toUpperCase()} · {currentSlide.badge}
                </span>
                <h3 className="project-album-title">
                  {currentSlide.label}
                  <span> — {currentSlide.note}</span>
                </h3>
              </div>

              <div className="project-album-actions">
                <span className="project-album-counter">
                  {String(lightboxIndex + 1).padStart(2, '0')} /{' '}
                  {String(ALL_DELICIAS_SLIDES.length).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  className="asset-carousel-btn"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + ALL_DELICIAS_SLIDES.length) %
                        ALL_DELICIAS_SLIDES.length
                    )
                  }
                  aria-label="Lâmina anterior"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="asset-carousel-btn"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % ALL_DELICIAS_SLIDES.length)
                  }
                  aria-label="Próxima lâmina"
                >
                  →
                </button>
                <button
                  type="button"
                  className="assets-modal-close"
                  onClick={() => setLightboxIndex(null)}
                >
                  FECHAR [ESC]
                </button>
              </div>
            </div>

            <div className="project-album-stage">
              <Image
                key={currentSlide.src}
                src={currentSlide.src}
                alt={currentSlide.label}
                fill
                sizes="94vw"
                className="object-contain"
                priority
              />
            </div>

            <div
              className="project-album-thumbs"
              role="tablist"
              aria-label="Miniaturas das 19 lâminas de Delícias da Ana"
            >
              {ALL_DELICIAS_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === lightboxIndex}
                  className={`project-album-thumb${
                    idx === lightboxIndex ? ' is-active' : ''
                  }`}
                  onClick={() => setLightboxIndex(idx)}
                >
                  <div className="project-album-thumb-media">
                    <Image
                      src={slide.src}
                      alt={slide.label}
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  </div>
                  <span>
                    {String(idx + 1).padStart(2, '0')} · {slide.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
