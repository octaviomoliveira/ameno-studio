'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProjectScroll from '@/components/projects/ProjectScroll'
import KeywordsWall from '@/components/home/KeywordsWall'

gsap.registerPlugin(ScrollTrigger)

// Lazy-load do viewer 3D — só carrega quando a aba for acessada
const AssetViewer = dynamic(() => import('./AssetViewer'), {
  ssr: false,
  loading: () => (
    <div className="asset-viewer-skeleton" aria-busy="true">
      <span className="sr-only">Carregando modelo 3D…</span>
    </div>
  ),
})

type Project = {
  slug: string
  title: string
  category: string | null
  location: string | null
  year: number | null
  cover_url: string | null
  is_provisional?: boolean
}

type Asset3D = {
  slug: string
  name: string
  description: string
  glbSrc: string
  fallbackImg: string
}

type Props = {
  studioprojects: Project[]
  autoraisProjects: Project[]
  assets: Asset3D[]
}

type Tab = 'studio' | 'autorais' | 'assets'

const TAB_LABELS: Record<Tab, string> = {
  autorais: '01 — Autorais',
  studio:   '02 — Estúdio',
  assets:   '03 — Assets 3D',
}

export default function PortfolioTabs({ studioprojects, autoraisProjects, assets }: Props) {
  const [active, setActive] = useState<Tab>('autorais')
  const contentRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    autorais: null,
    studio: null,
    assets: null,
  })

  // Anima o indicador de aba
  useEffect(() => {
    const btn = tabRefs.current[active]
    const indicator = indicatorRef.current
    if (!btn || !indicator) return
    const rect = btn.getBoundingClientRect()
    const parentRect = btn.parentElement!.getBoundingClientRect()
    gsap.to(indicator, {
      x: rect.left - parentRect.left,
      width: rect.width,
      duration: 0.35,
      ease: 'power2.inOut',
    })
  }, [active])

  // Anima a troca de conteúdo
  const switchTab = (tab: Tab) => {
    if (tab === active) return
    const content = contentRef.current
    if (!content) { setActive(tab); return }
    gsap.to(content, {
      opacity: 0,
      y: 12,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActive(tab)
        gsap.fromTo(content,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
        )
      },
    })
  }

  return (
    <section className="portfolio-tabs-section" aria-labelledby="portfolio-tabs-title">
      {/* Cabeçalho */}
      <div className="portfolio-tabs-header">
        <div className="portfolio-tabs-topline">
          <span>02 / PORTFÓLIO</span>
          <span>AMENO STUDIO</span>
        </div>
        <h2 id="portfolio-tabs-title" className="portfolio-tabs-title">
          Trabalhos que tornam<br /><em className="font-editorial">ideias visíveis.</em>
        </h2>
      </div>

      {/* Navegação de abas */}
      <div className="portfolio-tabs-nav" role="tablist" aria-label="Categorias do portfólio">
        <div className="portfolio-tabs-nav-inner">
          {/* Indicador deslizante */}
          <span ref={indicatorRef} className="portfolio-tabs-indicator" aria-hidden="true" />

          {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
            <button
              key={tab}
              ref={el => { tabRefs.current[tab] = el }}
              role="tab"
              aria-selected={active === tab}
              aria-controls={`tabpanel-${tab}`}
              className={`portfolio-tab-btn ${active === tab ? 'is-active' : ''}`}
              onClick={() => switchTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div ref={contentRef} className="portfolio-tabs-content">
        {/* Aba Autorais */}
        {active === 'autorais' && (
          <div
            id="tabpanel-autorais"
            role="tabpanel"
            aria-labelledby="tab-autorais"
            className="portfolio-panel"
          >
            {autoraisProjects.length > 0 ? (
              <ProjectScroll projects={autoraisProjects} />
            ) : (
              <EmptyState message="Projetos autorais em breve." />
            )}
          </div>
        )}

        {/* Aba Estúdio — KeywordsWall */}
        {active === 'studio' && (
          <div
            id="tabpanel-studio"
            role="tabpanel"
            aria-labelledby="tab-studio"
            className="portfolio-panel"
          >
            {studioprojects.length > 0 ? (
              <KeywordsWall />
            ) : (
              <EmptyState message="Projetos do estúdio em breve." />
            )}
          </div>
        )}

        {/* Aba Assets 3D */}
        {active === 'assets' && (
          <div
            id="tabpanel-assets"
            role="tabpanel"
            aria-labelledby="tab-assets"
            className="portfolio-panel portfolio-panel--assets"
          >
            {assets.length > 0 ? (
              <div className="assets-grid">
                {assets.map((asset) => (
                  <article key={asset.slug} className="asset-card">
                    <AssetViewer
                      src={asset.glbSrc}
                      fallbackImg={asset.fallbackImg}
                      label={asset.name}
                      className="asset-card-viewer"
                    />
                    <div className="asset-card-info">
                      <h3>{asset.name}</h3>
                      <p>{asset.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState message="Modelagens 3D em breve — arquivo .glb ainda não adicionado." />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="portfolio-empty">
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="portfolio-empty-icon">
        <rect x="4" y="4" width="40" height="40" stroke="currentColor" strokeWidth="1" />
        <line x1="4" y1="4" x2="44" y2="44" stroke="#E63B2E" strokeWidth="1" />
      </svg>
      <p>{message}</p>
    </div>
  )
}
