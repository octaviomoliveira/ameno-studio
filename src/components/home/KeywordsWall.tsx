'use client'

import { useState, useRef, useEffect, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
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
  { text: 'Varanda Gourmet', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl text-[#E63B2E]', img: '/renders/central-parque-varanda.webp', project: 'Central Parque', type: 'Área Privativa' },
  { text: 'PISCINA & DECK', cls: 'font-sans font-bold uppercase text-4xl sm:text-5xl md:text-6xl text-neutral-100', img: '/renders/central-parque-piscina.webp', project: 'Central Parque', type: 'Lazer Aquático' },
  { text: 'Iluminação Noturna', cls: 'font-editorial italic text-6xl sm:text-7xl md:text-8xl', img: '/renders/raizes-fachada-noite.webp', project: 'Raízes Capão Bonito', type: 'Cenografia Lumínica' },
  { text: 'LIVING INTEGRADO', cls: 'font-mono uppercase text-3xl sm:text-4xl md:text-5xl tracking-wider text-neutral-300', img: '/renders/central-parque-living.webp', project: 'Central Parque', type: 'Design de Interiores' },
  { text: 'CENTRAL PARQUE', cls: 'font-sans font-black uppercase text-6xl sm:text-8xl md:text-[6.5rem] tracking-tighter', img: '/renders/central-parque-fachada.webp', project: 'Central Parque', type: 'Fachada Residencial' },
  { text: 'Adega & Vinhoteca', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl text-[#E63B2E]', img: '/renders/espaco-novo-adega.webp', project: 'Espaço Novo Mercato', type: 'Varejo Especializado' },
  { text: 'BEACH TENNIS', cls: 'font-sans font-black uppercase text-4xl sm:text-5xl md:text-6xl tracking-widest text-neutral-200', img: '/renders/moradas-beachtennis.webp', project: 'Moradas do Bosque', type: 'Complexo Esportivo' },
  { text: 'Garden Privativo', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl', img: '/renders/central-parque-garden.webp', project: 'Central Parque', type: 'Apartamento Garden' },
  { text: 'GOLDEN HOUR', cls: 'font-mono uppercase text-3xl sm:text-4xl md:text-5xl text-neutral-300', img: '/renders/raizes-fachada-dia.webp', project: 'Raízes Capão Bonito', type: 'Luz Entardecer' },
  { text: 'MERCATO VAREJO', cls: 'font-sans font-bold uppercase text-4xl sm:text-5xl md:text-6xl tracking-tight', img: '/renders/espaco-novo-comercial.webp', project: 'Espaço Novo Mercato', type: 'Espaço Comercial' },
  { text: 'Churrasqueira Gourmet', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl text-[#E63B2E]', img: '/renders/raizes-gourmet.webp', project: 'Raízes Gourmet', type: 'Área Social' },
  { text: 'MORADAS DO BOSQUE', cls: 'font-sans font-black uppercase text-5xl sm:text-7xl md:text-8xl tracking-tight', img: '/renders/moradas-piscina.webp', project: 'Moradas do Bosque', type: 'Condomínio Fechado' },
  { text: 'Salão de Jogos', cls: 'font-editorial italic text-4xl sm:text-5xl md:text-6xl text-neutral-200', img: '/renders/salao-jogos.webp', project: 'Goya Residencial', type: 'Área de Convivência' },
  { text: 'HOME OFFICE & DETALHE', cls: 'font-mono uppercase text-2xl sm:text-3xl md:text-4xl tracking-widest text-neutral-400', img: '/renders/instagram-escritorio.webp', project: 'Escritório Autoral', type: 'Macro Detalhamento' },
  { text: 'ESPAÇO GOURMET', cls: 'font-sans font-bold uppercase text-4xl sm:text-5xl md:text-6xl', img: '/renders/goya-gourmet.webp', project: 'Goya Residencial', type: 'Gourmet & Festas' },
  { text: 'Quadra Poliesportiva', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl text-neutral-300', img: '/renders/quadra-esportes.webp', project: 'Central Parque', type: 'Esportes & Lazer' },
  { text: 'PRAÇA EXTERNA', cls: 'font-mono uppercase text-3xl sm:text-4xl md:text-5xl text-neutral-300', img: '/renders/praca-externa.webp', project: 'Raízes Capão Bonito', type: 'Paisagismo & Convivência' },
  { text: 'Salão de Festas', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl text-[#E63B2E]', img: '/renders/salao-festas.webp', project: 'Goya Residencial', type: 'Social & Eventos' },
  { text: 'BRINQUEDOTECA', cls: 'font-sans font-bold uppercase text-3xl sm:text-4xl md:text-5xl tracking-widest text-neutral-300', img: '/renders/brinquedoteca.webp', project: 'Frederico Jacobi', type: 'Espaço Kids' },
  { text: 'Área Externa', cls: 'font-editorial italic text-5xl sm:text-6xl md:text-7xl text-neutral-200', img: '/renders/goya-externa.webp', project: 'Goya Residencial', type: 'Deck & Paisagismo' },
  { text: 'BICICLETÁRIO', cls: 'font-mono uppercase text-2xl sm:text-3xl md:text-4xl tracking-widest text-neutral-400', img: '/renders/bicicletario.webp', project: 'Central Parque', type: 'Mobilidade Urbana' },
]

const MOBILE_FEATURED_INDEXES = [0, 5, 3, 12, 6, 18]
const MOBILE_FEATURED = MOBILE_FEATURED_INDEXES.map((index) => KEYWORDS[index])

const INPUT_MODE_QUERY = '(max-width: 767px), (hover: none), (pointer: coarse)'
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
  const isClient = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerClientSnapshot)
  const touchMode = useSyncExternalStore(subscribeToInputMode, getInputModeSnapshot, getServerInputModeSnapshot)
  const sectionRef = useRef<HTMLElement>(null)
  const wordsRef = useRef<(HTMLButtonElement | null)[]>([])
  const floatingBoxRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ curX: -9999, curY: -9999, tgtX: -9999, tgtY: -9999 })
  const rafRef = useRef<number | null>(null)

  // Entrada no scroll
  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from(wordsRef.current.filter(Boolean), {
        yPercent: 35,
        opacity: 0,
        duration: 0.75,
        stagger: 0.015,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  // Atualização direta e imediata do cursor para 120fps sem lag
  function tick() {
    const p = posRef.current
    // interpolação bem rápida e responsiva para não dessincronizar do mouse
    p.curX += (p.tgtX - p.curX) * 0.35
    p.curY += (p.tgtY - p.curY) * 0.35

    if (floatingBoxRef.current) {
      floatingBoxRef.current.style.transform = `translate3d(calc(${Math.round(p.curX)}px - 50%), calc(${Math.round(p.curY)}px - 50%), 0)`
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  // Onde o mouse passar na seção inteira, acha a palavra mais próxima instantaneamente
  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchMode) return
    const mouseX = e.clientX
    const mouseY = e.clientY
    posRef.current.tgtX = mouseX
    posRef.current.tgtY = mouseY

    if (posRef.current.curX === -9999) {
      posRef.current.curX = mouseX
      posRef.current.curY = mouseY
    }

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(tick)
    }

    // Acha a palavra mais próxima ou diretamente sob o cursor
    let bestIndex = 0
    let minDistance = Infinity

    for (let i = 0; i < wordsRef.current.length; i++) {
      const el = wordsRef.current[i]
      if (!el) continue
      const rect = el.getBoundingClientRect()

      // Se o mouse está diretamente dentro dos limites da palavra
      if (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      ) {
        bestIndex = i
        minDistance = 0
        break
      }

      // Senão, calcula a distância do centro da palavra
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dist = Math.hypot(mouseX - centerX, mouseY - centerY)

      if (dist < minDistance) {
        minDistance = dist
        bestIndex = i
      }
    }

    setActiveIndex(bestIndex)
  }

  const handleMouseLeave = () => {
    if (touchMode) return
    setActiveIndex(null)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const resolvedActiveIndex = activeIndex ?? (touchMode ? 0 : null)
  const activeItem = resolvedActiveIndex !== null ? KEYWORDS[resolvedActiveIndex] : null

  return (
    <>
      <section
        ref={sectionRef}
        className="keywords-wall"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="keywords-wall-desktop">
          <div className="keywords-wall-inner">
            {KEYWORDS.map((item, idx) => {
              const isActive = resolvedActiveIndex === idx
              const isDimmed = resolvedActiveIndex !== null && !isActive

              return (
                <button
                  type="button"
                  key={item.text + idx}
                  ref={el => { wordsRef.current[idx] = el }}
                  className={`${item.cls} keywords-wall-word`}
                  onClick={() => setActiveIndex(idx)}
                  onFocus={() => setActiveIndex(idx)}
                  style={{
                    display: 'inline-block',
                    lineHeight: 0.9,
                    opacity: isDimmed ? 0.12 : 1,
                    filter: isDimmed ? 'blur(1px)' : 'none',
                    color: isActive ? '#E63B2E' : undefined,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'opacity 0.2s ease, filter 0.2s ease, color 0.15s ease, transform 0.15s ease',
                    cursor: 'crosshair',
                  }}
                >
                  {item.text}
                </button>
              )
            })}
          </div>

          <div className="keywords-wall-footer">
            <span>AMENO · DISCIPLINAS & RENDERS REAIS</span>
            <span>ONDE O MOUSE PASSAR, PUXA O RENDER</span>
            <span>RECIFE / BRASIL</span>
          </div>
        </div>

        <div className="keywords-wall-mobile">
          <div className="keywords-mobile-heading">
            <span>02 / ESPAÇOS EM CENA</span>
            <h2>Do detalhe<br />ao <em>conjunto.</em></h2>
            <p>Arquitetura visualizada para revelar atmosfera, uso e intenção.</p>
          </div>

          <div className="keywords-mobile-rail" aria-label="Seleção de ambientes e renders">
            {MOBILE_FEATURED.map((item, index) => (
              <article className="keyword-mobile-card" key={item.text}>
                <Image
                  src={item.img}
                  alt={`${item.project} — ${item.type}`}
                  fill
                  className="object-cover"
                  sizes="86vw"
                />
                <div className="keyword-mobile-card-wash" aria-hidden="true" />
                <span className="keyword-mobile-index">{String(index + 1).padStart(2, '0')} / {String(MOBILE_FEATURED.length).padStart(2, '0')}</span>
                <div className="keyword-mobile-caption">
                  <span>{item.type}</span>
                  <h3>{item.text}</h3>
                  <p>{item.project}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="keywords-mobile-hint">
            <span>DESLIZE PARA EXPLORAR</span>
            <span aria-hidden="true">→</span>
          </div>
        </div>
      </section>

      {/* Render Flutuante Interativo no Body */}
      {isClient && !touchMode && createPortal(
        <div
          ref={floatingBoxRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 440,
            maxWidth: '85vw',
            pointerEvents: 'none',
            zIndex: 99999,
            opacity: activeItem ? 1 : 0,
            transition: 'opacity 0.2s ease-out',
            willChange: 'transform',
          }}
        >
          {activeItem ? <KeywordPreview item={activeItem} /> : null}
        </div>,
        document.body
      )}
    </>
  )
}

function KeywordPreview({ item }: { item: KeywordItem }) {
  return (
    <div className="keyword-preview-card">
      <div className="keyword-preview-media">
        <Image
          src={item.img}
          alt={`${item.project} — ${item.type}`}
          fill
          className="object-cover"
          sizes="(max-width: 767px) 86vw, 440px"
        />
      </div>
      <div className="keyword-preview-caption">
        <div>
          <strong>{item.text}</strong>
          <span>{item.project} · {item.type}</span>
        </div>
        <div>
          <strong>AMENO</strong>
          <span>RENDER REAL</span>
        </div>
      </div>
    </div>
  )
}
