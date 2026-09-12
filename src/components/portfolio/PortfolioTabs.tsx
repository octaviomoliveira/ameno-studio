'use client'

import { useState, useRef, useLayoutEffect, type KeyboardEvent } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProjectScroll from '@/components/projects/ProjectScroll'
import KeywordsWall from '@/components/home/KeywordsWall'
import styles from './PortfolioTabs.module.css'

gsap.registerPlugin(ScrollTrigger)

const AssetViewer = dynamic(() => import('./AssetViewer'), {
  ssr: false,
  loading: () => <div className="asset-viewer-skeleton" role="status"><span className="sr-only">Carregando modelo 3D…</span></div>,
})

export type Project = {
  slug: string
  title: string
  category: string | null
  location: string | null
  year: number | null
  cover_url: string | null
  is_provisional?: boolean
}
export type Asset3D = { slug: string; name: string; description: string; glbSrc: string; fallbackImg: string }
type Props = { studioprojects: Project[]; autoraisProjects: Project[]; assets: Asset3D[] }
const TABS = [
  { id: 'autorais', number: '01', label: 'Autorais' },
  { id: 'studio', number: '02', label: 'Estúdio' },
  { id: 'assets', number: '03', label: 'Assets 3D' },
] as const
type Tab = typeof TABS[number]['id']

export default function PortfolioTabs({ studioprojects, autoraisProjects, assets }: Props) {
  const [active, setActive] = useState<Tab>('autorais')
  const contentRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ autorais: null, studio: null, assets: null })
  const hasAnimated = useRef(false)

  useLayoutEffect(() => {
    const button = tabRefs.current[active]
    const indicator = indicatorRef.current
    const nav = navRef.current
    const content = contentRef.current
    if (!button || !indicator || !nav || !content) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let cancelled = false
    let refreshFrame = 0
    const positionIndicator = (animate = false) => {
      gsap.to(indicator, { x: button.offsetLeft, width: button.offsetWidth, duration: animate && !motion.matches ? 0.35 : 0, ease: 'power3.out', overwrite: true })
    }
    const refreshLayout = () => {
      cancelAnimationFrame(refreshFrame)
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh())
    }
    const onMotionChange = () => {
      positionIndicator()
      gsap.killTweensOf(content)
      gsap.set(content, { clearProps: 'opacity,transform' })
    }
    positionIndicator(hasAnimated.current)
    if (hasAnimated.current && !motion.matches) {
      gsap.fromTo(content, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', overwrite: true, clearProps: 'opacity,transform', onComplete: refreshLayout })
    }
    hasAnimated.current = true
    const navObserver = new ResizeObserver(() => positionIndicator())
    navObserver.observe(nav)
    navObserver.observe(button)
    const contentObserver = new ResizeObserver(refreshLayout)
    contentObserver.observe(content)
    motion.addEventListener('change', onMotionChange)
    void document.fonts.ready.then(() => { if (!cancelled) positionIndicator() })
    refreshLayout()
    return () => {
      cancelled = true
      navObserver.disconnect()
      contentObserver.disconnect()
      motion.removeEventListener('change', onMotionChange)
      cancelAnimationFrame(refreshFrame)
      gsap.killTweensOf([indicator, content])
      gsap.set(content, { clearProps: 'opacity,transform' })
    }
  }, [active])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tab: Tab) => {
    const index = TABS.findIndex((item) => item.id === tab)
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (event.key === 'ArrowLeft') next = (index + TABS.length - 1) % TABS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = TABS.length - 1
    else return
    event.preventDefault()
    setActive(TABS[next].id)
    tabRefs.current[TABS[next].id]?.focus({ preventScroll: true })
  }
  const openStudio = () => {
    setActive('studio')
    tabRefs.current.studio?.focus({ preventScroll: true })
  }

  return (
    <section className={styles.section} aria-labelledby="portfolio-tabs-title">
      <header className={styles.header}>
        <div className={styles.topline}><span>02 / PORTFÓLIO</span><span>AMENO STUDIO</span></div>
        <h1 id="portfolio-tabs-title" className={styles.title}>Trabalhos que tornam<br /><em className="font-editorial">ideias visíveis.</em></h1>
      </header>
      <div className={styles.nav}>
        <div ref={navRef} className={styles.navInner} role="tablist" aria-label="Categorias do portfólio">
          <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
          {TABS.map((tab) => (
            <button key={tab.id} type="button" id={`tab-${tab.id}`} ref={(el) => { tabRefs.current[tab.id] = el }}
              role="tab" aria-selected={active === tab.id} aria-controls={`tabpanel-${tab.id}`} tabIndex={active === tab.id ? 0 : -1}
              className={styles.tab} onClick={() => setActive(tab.id)} onKeyDown={(event) => handleKeyDown(event, tab.id)}>
              <span className={styles.tabNumber}>{tab.number}</span><span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div ref={contentRef} className={styles.content}>
        <div id="tabpanel-autorais" role="tabpanel" aria-labelledby="tab-autorais" tabIndex={0} hidden={active !== 'autorais'}>
          {active === 'autorais' && (autoraisProjects.length > 0 ? <ProjectScroll projects={autoraisProjects} /> : (
            <div className={styles.empty}>
              <div className={styles.emptyDrawing} aria-hidden="true"><span>01</span><i /></div>
              <div className={styles.emptyCopy}>
                <span className={styles.eyebrow}>PROJETOS AUTORAIS</span>
                <h2>Em <em className="font-editorial">breve.</em></h2>
                <button type="button" className={styles.emptyLink} onClick={openStudio}>Explorar o estúdio <span aria-hidden="true">↗</span></button>
              </div>
            </div>
          ))}
        </div>
        <div id="tabpanel-studio" role="tabpanel" aria-labelledby="tab-studio" tabIndex={0} hidden={active !== 'studio'}>
          {active === 'studio' && (studioprojects.length > 0 ? <KeywordsWall /> : <EmptyState message="Projetos do estúdio em breve." />)}
        </div>
        <div id="tabpanel-assets" role="tabpanel" aria-labelledby="tab-assets" tabIndex={0} hidden={active !== 'assets'}>
          {active === 'assets' && (assets.length > 0 ? (
            <div className={styles.assetsGrid}>
              {assets.map((asset, index) => (
                <article key={asset.slug} className={styles.assetCard}>
                  <AssetViewer src={asset.glbSrc} fallbackImg={asset.fallbackImg} label={asset.name} className={styles.assetViewer} />
                  <div className={styles.assetInfo}><span className={styles.assetNumber}>{String(index + 1).padStart(2, '0')} / MODELO 3D</span><h2>{asset.name}</h2><p>{asset.description}</p></div>
                </article>
              ))}
            </div>
          ) : <EmptyState message="Modelagens 3D em breve." />)}
        </div>
      </div>
    </section>
  )
}
function EmptyState({ message }: { message: string }) { return <div className={styles.simpleEmpty}><p>{message}</p></div> }
