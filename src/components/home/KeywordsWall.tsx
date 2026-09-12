'use client'

import { useState, useRef, useEffect, useCallback, useId, useSyncExternalStore, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import styles from './KeywordsWall.module.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type KeywordItem = {
  text: string
  cls: string
  img: string
  project: string
  type: string
}

// 22 termos com correspondência 100% EXATA e literal com cada render real
const KEYWORDS: KeywordItem[] = [
  { text: 'ESTÚDIO BOLA', cls: 'font-sans font-black uppercase text-5xl sm:text-7xl md:text-8xl tracking-tight', img: '/renders/estudio-bola-fachada.webp', project: 'Estúdio Bola', type: 'Fachada Comercial' },
  { text: 'Varanda Gourmet', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl', img: '/renders/central-parque-varanda.webp', project: 'Central Parque', type: 'Área Privativa' },
  { text: 'PISCINA & DECK', cls: 'font-sans font-bold uppercase text-4xl sm:text-5xl md:text-6xl', img: '/renders/central-parque-piscina.webp', project: 'Central Parque', type: 'Lazer Aquático' },
  { text: 'Iluminação Noturna', cls: 'font-editorial italic text-6xl sm:text-7xl md:text-8xl', img: '/renders/raizes-fachada-noite.webp', project: 'Raízes Capão Bonito', type: 'Cenografia Lumínica' },
  { text: 'LIVING INTEGRADO', cls: 'font-mono uppercase text-3xl sm:text-4xl md:text-5xl tracking-wider', img: '/renders/central-parque-living.webp', project: 'Central Parque', type: 'Design de Interiores' },
  { text: 'CENTRAL PARQUE', cls: 'font-sans font-black uppercase text-6xl sm:text-8xl md:text-[6.5rem] tracking-tighter', img: '/renders/central-parque-fachada.webp', project: 'Central Parque', type: 'Fachada Residencial' },
  { text: 'Adega & Vinhoteca', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl', img: '/renders/espaco-novo-adega.webp', project: 'Espaço Novo Mercato', type: 'Varejo Especializado' },
  { text: 'BEACH TENNIS', cls: 'font-sans font-black uppercase text-4xl sm:text-5xl md:text-6xl tracking-widest', img: '/renders/moradas-beachtennis.webp', project: 'Moradas do Bosque', type: 'Complexo Esportivo' },
  { text: 'Garden Privativo', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl', img: '/renders/central-parque-garden.webp', project: 'Central Parque', type: 'Apartamento Garden' },
  { text: 'GOLDEN HOUR', cls: 'font-mono uppercase text-3xl sm:text-4xl md:text-5xl', img: '/renders/raizes-fachada-dia.webp', project: 'Raízes Capão Bonito', type: 'Luz Entardecer' },
  { text: 'MERCATO VAREJO', cls: 'font-sans font-bold uppercase text-4xl sm:text-5xl md:text-6xl tracking-tight', img: '/renders/espaco-novo-comercial.webp', project: 'Espaço Novo Mercato', type: 'Espaço Comercial' },
  { text: 'Churrasqueira Gourmet', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl', img: '/renders/raizes-gourmet.webp', project: 'Raízes Gourmet', type: 'Área Social' },
  { text: 'MORADAS DO BOSQUE', cls: 'font-sans font-black uppercase text-5xl sm:text-7xl md:text-8xl tracking-tight', img: '/renders/moradas-piscina.webp', project: 'Moradas do Bosque', type: 'Condomínio Fechado' },
  { text: 'Salão de Jogos', cls: 'font-editorial italic text-4xl sm:text-5xl md:text-6xl', img: '/renders/salao-jogos.webp', project: 'Goya Residencial', type: 'Área de Convivência' },
  { text: 'HOME OFFICE & DETALHE', cls: 'font-mono uppercase text-2xl sm:text-3xl md:text-4xl tracking-widest', img: '/renders/instagram-escritorio.webp', project: 'Escritório Autoral', type: 'Macro Detalhamento' },
  { text: 'ESPAÇO GOURMET', cls: 'font-sans font-bold uppercase text-4xl sm:text-5xl md:text-6xl', img: '/renders/goya-gourmet.webp', project: 'Goya Residencial', type: 'Gourmet & Festas' },
  { text: 'Quadra Poliesportiva', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl', img: '/renders/quadra-esportes.webp', project: 'Central Parque', type: 'Esportes & Lazer' },
  { text: 'PRAÇA EXTERNA', cls: 'font-mono uppercase text-3xl sm:text-4xl md:text-5xl', img: '/renders/praca-externa.webp', project: 'Raízes Capão Bonito', type: 'Paisagismo & Convivência' },
  { text: 'Salão de Festas', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl', img: '/renders/salao-festas.webp', project: 'Goya Residencial', type: 'Social & Eventos' },
  { text: 'BRINQUEDOTECA', cls: 'font-sans font-bold uppercase text-3xl sm:text-4xl md:text-5xl tracking-widest', img: '/renders/brinquedoteca.webp', project: 'Frederico Jacobi', type: 'Espaço Kids' },
  { text: 'Área Externa', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl', img: '/renders/goya-externa.webp', project: 'Goya Residencial', type: 'Deck & Paisagismo' },
  { text: 'BICICLETÁRIO', cls: 'font-mono uppercase text-2xl sm:text-3xl md:text-4xl tracking-widest', img: '/renders/bicicletario.webp', project: 'Central Parque', type: 'Mobilidade Urbana' },
]

const MOBILE_FEATURED_INDEXES = [0, 5, 3, 12, 6, 18]
const MOBILE_ORDER = [...MOBILE_FEATURED_INDEXES, ...KEYWORDS.map((_, index) => index).filter((index) => !MOBILE_FEATURED_INDEXES.includes(index))]
const INPUT_MODE_QUERY = '(max-width: 767px), (hover: none) and (pointer: coarse)'
const subscribeToInputMode = (callback: () => void) => {
  const media = window.matchMedia(INPUT_MODE_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}
const getInputModeSnapshot = () => window.matchMedia(INPUT_MODE_QUERY).matches
const getServerInputModeSnapshot = () => false
const subscribeToClient = () => () => undefined
const getClientSnapshot = () => true
const getServerClientSnapshot = () => false

export default function KeywordsWall() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [railIndex, setRailIndex] = useState(0)
  const isClient = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerClientSnapshot)
  const touchMode = useSyncExternalStore(subscribeToInputMode, getInputModeSnapshot, getServerInputModeSnapshot)
  const sectionRef = useRef<HTMLElement>(null)
  const wordsRef = useRef<(HTMLButtonElement | null)[]>([])
  const floatingBoxRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0 })
  const modeRef = useRef<'pointer' | 'keyboard'>('pointer')
  const activeRef = useRef<number | null>(null)
  const previewId = useId()
  const railId = useId()
  const mobileIndexes = expanded ? MOBILE_ORDER : MOBILE_FEATURED_INDEXES
  const activeItem = activeIndex === null ? null : KEYWORDS[activeIndex]

  const dismissPreview = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    activeRef.current = null
    setActiveIndex(null)
  }, [])

  const placePreview = useCallback((x: number, y: number) => {
    const preview = floatingBoxRef.current
    if (!preview) return
    const margin = 16
    const width = preview.offsetWidth || Math.min(440, window.innerWidth - margin * 2)
    const height = preview.offsetHeight || width * 0.625 + 70
    const preferredX = x + 28 + width <= window.innerWidth - margin ? x + 28 : x - width - 28
    const left = Math.max(margin, Math.min(preferredX, window.innerWidth - width - margin))
    const top = Math.max(margin, Math.min(y - height / 2, window.innerHeight - height - margin))
    preview.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`
  }, [])

  const focusWord = (index: number) => {
    modeRef.current = 'keyboard'
    activeRef.current = index
    setActiveIndex(index)
    const rect = wordsRef.current[index]?.getBoundingClientRect()
    if (rect) placePreview(rect.right, rect.top + rect.height / 2)
  }

  useEffect(() => {
    if (touchMode) return
    const onViewportChange = () => {
      if (modeRef.current === 'keyboard' && activeRef.current !== null) {
        const rect = wordsRef.current[activeRef.current]?.getBoundingClientRect()
        if (rect && rect.bottom > 0 && rect.top < window.innerHeight) placePreview(rect.right, rect.top + rect.height / 2)
        else dismissPreview()
      } else dismissPreview()
    }
    window.addEventListener('scroll', onViewportChange, { passive: true })
    window.addEventListener('resize', onViewportChange, { passive: true })
    return () => {
      window.removeEventListener('scroll', onViewportChange)
      window.removeEventListener('resize', onViewportChange)
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
  }, [touchMode, dismissPreview, placePreview])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || touchMode) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(section.querySelectorAll('[data-keyword-entry]'), {
        y: 24, opacity: 0, duration: 0.7, stagger: 0.015, ease: 'power3.out', clearProps: 'opacity,transform',
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })
    }, section)
    return () => media.revert()
  }, [touchMode])

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (touchMode) return
    modeRef.current = 'pointer'
    pointerRef.current = { x: event.clientX, y: event.clientY }
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      const { x, y } = pointerRef.current
      let closest: number | null = null
      let distance = Infinity
      wordsRef.current.forEach((word, index) => {
        if (!word) return
        // Live bounds remain correct during entrance animation and layout changes.
        const rect = word.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        const dx = Math.max(rect.left - x, 0, x - rect.right)
        const dy = Math.max(rect.top - y, 0, y - rect.bottom)
        const nextDistance = Math.hypot(dx, dy)
        if (nextDistance < distance) { closest = index; distance = nextDistance }
      })
      placePreview(x, y)
      if (activeRef.current !== closest) { activeRef.current = closest; setActiveIndex(closest) }
    })
  }

  const moveRail = (direction: number) => {
    const rail = railRef.current
    const card = rail?.firstElementChild as HTMLElement | null
    if (!rail || !card) return
    const gap = Number.parseFloat(getComputedStyle(rail).gap) || 0
    rail.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  const updateRailIndex = () => {
    const rail = railRef.current
    const card = rail?.firstElementChild as HTMLElement | null
    if (!rail || !card) return
    const gap = Number.parseFloat(getComputedStyle(rail).gap) || 0
    setRailIndex(Math.round(rail.scrollLeft / (card.offsetWidth + gap)))
  }
  const toggleCollection = () => {
    setExpanded((value) => !value)
    setRailIndex(0)
    railRef.current?.scrollTo({ left: 0, behavior: 'instant' })
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }

  return (
    <>
      <section ref={sectionRef} className={styles.wall} onMouseMove={handleMouseMove}
        onMouseLeave={() => { if (modeRef.current === 'pointer') dismissPreview() }}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) dismissPreview() }}
        onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); dismissPreview() } }}>
        <div className={styles.desktop}>
          <div className={styles.cloud}>
            {KEYWORDS.map((item, index) => (
              <span key={item.text} className={styles.entry} data-keyword-entry>
                <button type="button" ref={(element) => { wordsRef.current[index] = element }}
                  className={`${item.cls} ${styles.word}`} data-active={activeIndex === index}
                  data-dimmed={activeIndex !== null && activeIndex !== index}
                  aria-describedby={`${previewId}-${index}`} onFocus={() => focusWord(index)} onClick={() => focusWord(index)}>
                  {item.text}
                </button>
                <span className="sr-only" id={`${previewId}-${index}`}>{item.project} — {item.type}. Prévia do render.</span>
              </span>
            ))}
          </div>
          <div className={styles.footer}>
            <span>AMENO · DISCIPLINAS & RENDERS REAIS</span>
            <span>EXPLORE COM O CURSOR OU TECLADO</span>
            <span>RECIFE / BRASIL</span>
          </div>
        </div>
        <div className={styles.mobile}>
          <div className={styles.mobileHeading}>
            <span>02 / ESPAÇOS EM CENA</span>
            <h2>Do detalhe<br />ao <em className="font-editorial">conjunto.</em></h2>
            <p>Arquitetura visualizada para revelar atmosfera, uso e intenção.</p>
          </div>
          <div ref={railRef} id={railId} className={styles.rail} role="region" aria-label="Ambientes e renders" tabIndex={0}
            onScroll={updateRailIndex} onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); moveRail(event.key === 'ArrowLeft' ? -1 : 1) }
            }}>
            {mobileIndexes.map((itemIndex, index) => {
              const item = KEYWORDS[itemIndex]
              return <article className={styles.mobileCard} key={item.text}>
                <Image src={item.img} alt={`${item.project} — ${item.type}`} fill className="object-cover" sizes="(max-width: 767px) 82vw, 368px" />
                <div className={styles.wash} aria-hidden="true" />
                <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')} / {String(mobileIndexes.length).padStart(2, '0')}</span>
                <div className={styles.caption}><span>{item.type}</span><h3>{item.text}</h3><p>{item.project}</p></div>
              </article>
            })}
          </div>
          <div className={styles.railFooter}>
            <span>DESLIZE PARA EXPLORAR</span>
            <div className={styles.railControls}>
              <button type="button" aria-label="Render anterior" onClick={() => moveRail(-1)} disabled={railIndex <= 0}>←</button>
              <button type="button" aria-label="Próximo render" onClick={() => moveRail(1)} disabled={railIndex >= mobileIndexes.length - 1}>→</button>
            </div>
          </div>
          <button type="button" className={styles.expand} aria-expanded={expanded} aria-controls={railId} onClick={toggleCollection}>
            {expanded ? 'Mostrar seleção' : `Ver todos os ${KEYWORDS.length} renders`}<span aria-hidden="true">{expanded ? '−' : '+'}</span>
          </button>
        </div>
      </section>
      {isClient && !touchMode && createPortal(
        <div ref={floatingBoxRef} className={styles.preview} data-visible={activeItem !== null} aria-hidden="true">
          {activeItem ? <KeywordPreview item={activeItem} /> : null}
        </div>, document.body,
      )}
    </>
  )
}

function KeywordPreview({ item }: { item: KeywordItem }) {
  return (
    <div className={styles.previewCard}>
      <div className={styles.previewMedia}><Image src={item.img} alt={`${item.project} — ${item.type}`} fill className="object-cover" sizes="440px" /></div>
      <div className={styles.previewCaption}><strong>{item.project}</strong><span>{item.type}</span></div>
    </div>
  )
}
