'use client'

import { useLayoutEffect, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type ProjectRender = {
  src: string
  label: string
}

type ProjectItem = {
  slug: string
  title: string
  category: string
  location: string
  year: number
  cover_url: string
  renders: ProjectRender[]
}

const PROJECTS: ProjectItem[] = [
  {
    slug: 'estudio-bola',
    title: 'Estúdio Bola',
    category: 'Comercial',
    location: 'São Paulo, SP',
    year: 2023,
    cover_url: '/projects/estudio-bola.webp',
    renders: [
      { src: '/projects/estudio-bola.webp', label: 'Fachada Noturna & Vitrine Principal' },
      { src: '/renders/estudio-bola-fachada.webp', label: 'Fachada Comercial — Vista Urbana' },
    ],
  },
  {
    slug: 'central-parque',
    title: 'Central Parque',
    category: 'Residencial',
    location: 'Curitiba, PR',
    year: 2024,
    cover_url: '/projects/central-parque.webp',
    renders: [
      { src: '/projects/central-parque.webp', label: 'Implantação & Embasamento Residencial' },
      { src: '/renders/central-parque-fachada.webp', label: 'Fachada Principal Residencial' },
      { src: '/renders/central-parque-varanda.webp', label: 'Varanda Gourmet Integrada' },
      { src: '/renders/central-parque-piscina.webp', label: 'Piscina & Deck Solarium' },
      { src: '/renders/central-parque-living.webp', label: 'Living Integrado — Interiores' },
      { src: '/renders/central-parque-garden.webp', label: 'Apartamento Garden Privativo' },
      { src: '/renders/quadra-esportes.webp', label: 'Quadra Poliesportiva' },
      { src: '/renders/bicicletario.webp', label: 'Bicicletário & Mobilidade' },
    ],
  },
  {
    slug: 'raizes',
    title: 'Raízes',
    category: 'Residencial',
    location: 'Capão Bonito, SP',
    year: 2024,
    cover_url: '/projects/raizes-manha.webp',
    renders: [
      { src: '/projects/raizes-manha.webp', label: 'Luz da Manhã — Fachada Principal' },
      { src: '/renders/raizes-fachada-dia.webp', label: 'Golden Hour — Fachada Entardecer' },
      { src: '/renders/raizes-fachada-noite.webp', label: 'Cenografia Lumínica Noturna' },
      { src: '/renders/raizes-gourmet.webp', label: 'Churrasqueira & Espaço Gourmet' },
      { src: '/renders/praca-externa.webp', label: 'Praça Externa & Convivência' },
    ],
  },
  {
    slug: 'goya',
    title: 'Goya',
    category: 'Residencial',
    location: 'São Paulo, SP',
    year: 2024,
    cover_url: '/projects/goya-gourmet.webp',
    renders: [
      { src: '/projects/goya-gourmet.webp', label: 'Espaço Gourmet & Ilha Central' },
      { src: '/renders/goya-externa.webp', label: 'Área Externa & Paisagismo' },
      { src: '/renders/salao-festas.webp', label: 'Salão de Festas & Eventos' },
      { src: '/renders/salao-jogos.webp', label: 'Salão de Jogos & Convivência' },
    ],
  },
  {
    slug: 'moradas-do-bosque',
    title: 'Moradas do Bosque',
    category: 'Condomínio',
    location: 'Campinas, SP',
    year: 2023,
    cover_url: '/projects/moradas-bosque.webp',
    renders: [
      { src: '/projects/moradas-bosque.webp', label: 'Alameda & Implantação do Condomínio' },
      { src: '/renders/moradas-piscina.webp', label: 'Piscina & Lazer do Condomínio' },
      { src: '/renders/moradas-beachtennis.webp', label: 'Complexo Esportivo Beach Tennis' },
    ],
  },
]

export default function ProjectScrollSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackWrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null)
  const [activeRenderIndex, setActiveRenderIndex] = useState(0)

  const openAlbum = (projectIndex: number, renderIndex = 0) => {
    setActiveProjectIndex(projectIndex)
    setActiveRenderIndex(renderIndex)
  }

  const closeAlbum = () => {
    setActiveProjectIndex(null)
    setActiveRenderIndex(0)
  }

  useEffect(() => {
    if (activeProjectIndex === null) return
    const project = PROJECTS[activeProjectIndex]
    if (!project) return
    const total = project.renders.length
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeAlbum()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setActiveRenderIndex((prev) => (prev + 1) % total)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setActiveRenderIndex((prev) => (prev - 1 + total) % total)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeProjectIndex])

  useLayoutEffect(() => {
    const section = sectionRef.current
    const trackWrap = trackWrapRef.current
    const track = trackRef.current
    if (!section || !trackWrap || !track) return

    const getDistance = () => track.scrollWidth - trackWrap.clientWidth
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1025px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const anim = gsap.to(track, { x: () => -getDistance(), ease: 'none' })
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${getDistance()}`,
        pin: trackWrap,
        scrub: 1.2,
        animation: anim,
        invalidateOnRefresh: true,
      })

      let disposed = false
      let refreshFrame = 0
      const scrollToHashIfProject = () => {
        const hash = window.location.hash.replace('#', '')
        if (!hash) return
        const idx = PROJECTS.findIndex((p) => p.slug === hash)
        if (idx >= 0 && PROJECTS.length > 1) {
          const targetY = st.start + (idx / (PROJECTS.length - 1)) * (st.end - st.start)
          window.scrollTo({ top: targetY, behavior: 'smooth' })
        }
      }
      const refresh = () => {
        cancelAnimationFrame(refreshFrame)
        refreshFrame = requestAnimationFrame(() => {
          ScrollTrigger.refresh()
          scrollToHashIfProject()
        })
      }
      const observer = new ResizeObserver(refresh)
      observer.observe(track)
      observer.observe(trackWrap)
      window.addEventListener('hashchange', scrollToHashIfProject)
      void document.fonts.ready.then(() => { if (!disposed) refresh() })

      return () => {
        disposed = true
        observer.disconnect()
        window.removeEventListener('hashchange', scrollToHashIfProject)
        cancelAnimationFrame(refreshFrame)
        st.kill()
        anim.kill()
      }
    }, section)

    mm.add({
      narrow: '(max-width: 1024px)',
      touch: '(pointer: coarse), (hover: none)',
      motion: '(prefers-reduced-motion: no-preference)',
    }, (context) => {
      if (!context.conditions?.motion || !(context.conditions.narrow || context.conditions.touch)) return
      section.querySelectorAll<HTMLElement>('.project-scroll-slide').forEach(slide => {
        gsap.fromTo(slide.querySelector('img'), { scale: 1.08, yPercent: -3 }, {
          scale: 1.08, yPercent: 3, ease: 'none',
          scrollTrigger: { trigger: slide, start: 'top bottom', end: 'bottom top', scrub: .3 },
        })
      })
    }, section)

    return () => mm.revert()
  }, [])

  const activeProject = activeProjectIndex !== null ? PROJECTS[activeProjectIndex] : null
  const activeRender = activeProject ? activeProject.renders[activeRenderIndex] ?? activeProject.renders[0] : null

  return (
    <section id="projetos" ref={sectionRef} className="project-scroll-section" aria-label="Projetos principais">
      <div ref={trackWrapRef} className="project-scroll-wrap">
        <div ref={trackRef} className="project-scroll-track">
          {PROJECTS.map((project, index) => (
            <article
              id={project.slug}
              key={project.slug}
              className="project-scroll-slide is-interactive"
              aria-label={project.title}
              onClick={() => openAlbum(index, 0)}
            >
              <Image src={project.cover_url} alt={project.title} fill
                sizes="(max-width: 1024px) 100vw, (prefers-reduced-motion: reduce) 100vw, 80vw"
                className="object-cover" preload={index === 0} />
              <div className="project-scroll-wash" aria-hidden="true" />
              <div className="project-scroll-meta">
                <span className="project-scroll-num">
                  <strong>{String(index + 1).padStart(2, '0')}</strong> <em>/</em> {String(PROJECTS.length).padStart(2, '0')}
                </span>
                <h2 className="project-scroll-title">{project.title}</h2>
                <p className="project-scroll-info">
                  {project.category} · {project.location} · <span className="project-scroll-year">{project.year}</span>
                </p>
                <button
                  type="button"
                  className="project-scroll-album-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    openAlbum(index, 0)
                  }}
                >
                  <span>VER ÁLBUM COMPLETO · {String(project.renders.length).padStart(2, '0')} RENDERS</span>
                  <em aria-hidden="true">↗</em>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeProject && activeRender && activeProjectIndex !== null && (
        <div
          className="project-album-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Álbum do projeto ${activeProject.title}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAlbum()
          }}
        >
          <div className="project-album-dialog">
            <div className="project-album-header">
              <div className="project-album-header-left">
                <span className="project-album-kicker">
                  PROJETO {String(activeProjectIndex + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')} · {activeProject.category} · {activeProject.location}
                </span>
                <h3 className="project-album-title">
                  {activeProject.title}
                  <span> — {activeRender.label}</span>
                </h3>
              </div>

              <div className="project-album-actions">
                <span className="project-album-counter">
                  {String(activeRenderIndex + 1).padStart(2, '0')} / {String(activeProject.renders.length).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  className="asset-carousel-btn"
                  onClick={() => setActiveRenderIndex((prev) => (prev - 1 + activeProject.renders.length) % activeProject.renders.length)}
                  aria-label="Render anterior do projeto"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="asset-carousel-btn"
                  onClick={() => setActiveRenderIndex((prev) => (prev + 1) % activeProject.renders.length)}
                  aria-label="Próximo render do projeto"
                >
                  →
                </button>
                <button
                  type="button"
                  className="assets-modal-close"
                  onClick={closeAlbum}
                >
                  FECHAR [ESC]
                </button>
              </div>
            </div>

            <div className="project-album-stage">
              <Image
                key={activeRender.src}
                src={activeRender.src}
                alt={`${activeProject.title} — ${activeRender.label}`}
                fill
                sizes="94vw"
                className="object-contain"
                priority
              />
            </div>

            <div className="project-album-thumbs" role="tablist" aria-label={`Renders de ${activeProject.title}`}>
              {activeProject.renders.map((render, rIdx) => (
                <button
                  key={render.src}
                  type="button"
                  role="tab"
                  aria-selected={rIdx === activeRenderIndex}
                  className={`project-album-thumb${rIdx === activeRenderIndex ? ' is-active' : ''}`}
                  onClick={() => setActiveRenderIndex(rIdx)}
                >
                  <div className="project-album-thumb-media">
                    <Image src={render.src} alt={render.label} fill sizes="140px" className="object-cover" />
                  </div>
                  <span>{String(rIdx + 1).padStart(2, '0')} · {render.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

