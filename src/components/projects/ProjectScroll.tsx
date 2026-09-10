'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Project = {
  slug: string
  title: string
  category: string | null
  location: string | null
  year: number | null
  cover_url: string | null
  is_provisional?: boolean
}

const TOUCH_LAYOUT_QUERY = '(max-width: 767px), (hover: none) and (pointer: coarse) and (max-width: 1024px)'

function PlaceholderGraphic({ index }: { index: number }) {
  const gridId = `project-grid-${index}`
  return (
    <div className={`project-art project-art-${index % 3}`} aria-label="Imagem demonstrativa pendente">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id={gridId} width="54" height="54" patternUnits="userSpaceOnUse">
            <path d="M54 0H0V54" fill="none" stroke="rgba(232,232,224,0.1)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1200" height="800" fill={`url(#${gridId})`} />
        <path d="M100 620L300 390L540 480L760 210L1090 350" fill="none" stroke="rgba(232,232,224,.72)" strokeWidth="2" />
        <circle cx="760" cy="210" r="7" fill="#E63B2E" />
      </svg>
      <div className="project-art-label"><span>RENDER PENDENTE</span><span>AMENO / {String(index + 1).padStart(2, '0')}</span></div>
    </div>
  )
}

export default function ProjectScroll({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const touchLayout = window.matchMedia(TOUCH_LAYOUT_QUERY)
    let context: gsap.Context | null = null

    const setupAnimations = () => {
      context?.revert()
      const isTouchLayout = touchLayout.matches

      context = gsap.context(() => {
        const panels = gsap.utils.toArray<HTMLElement>('[data-project-panel]')

        panels.forEach((panel) => {
          const frame = panel.querySelector('[data-project-media-frame]')
          const media = panel.querySelector('[data-project-media]')
          const info = panel.querySelector('[data-project-info]')
          if (!frame || !media || !info) return

          if (isTouchLayout) {
            gsap.fromTo(panel,
              { y: 28, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.72,
                ease: 'power3.out',
                scrollTrigger: { trigger: panel, start: 'top 88%', once: true },
              },
            )

            gsap.fromTo(media,
              { scale: 1.04, yPercent: -2.5 },
              {
                scale: 1.04,
                yPercent: 2.5,
                ease: 'none',
                scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.35 },
              },
            )
            return
          }

          gsap.fromTo(frame,
            { clipPath: 'inset(7% 4% 7% 4%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              ease: 'none',
              scrollTrigger: { trigger: panel, start: 'top bottom', end: 'top 22%', scrub: 1 },
            },
          )

          gsap.fromTo(media,
            { scale: 1.12, yPercent: -2 },
            {
              scale: 1,
              yPercent: -7,
              ease: 'none',
              scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: 1 },
            },
          )

          gsap.fromTo(info,
            { y: 44, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: panel,
                start: 'top 60%',
                end: 'top 34%',
                scrub: 1,
              },
            },
          )
        })
      }, section)
      ScrollTrigger.refresh()
    }

    setupAnimations()
    touchLayout.addEventListener('change', setupAnimations)

    return () => {
      touchLayout.removeEventListener('change', setupAnimations)
      context?.revert()
    }
  }, [])

  return (
    <section ref={sectionRef} id="portfolio" className="project-sequence" aria-labelledby="portfolio-title">
      <header className="projects-chapter-header">
        <div className="projects-chapter-inner">
          <div className="projects-chapter-topline">
            <span>03 / TRABALHOS SELECIONADOS</span>
            <span>{String(projects.length).padStart(2, '0')} PROJETOS</span>
          </div>
          <div className="projects-chapter-copy">
            <h2 id="portfolio-title">Projetos que tornam<br /><em className="font-editorial">ideias visíveis.</em></h2>
            <p>Uma seleção de arquitetura e visualização construída para comunicar espaço, atmosfera e intenção.</p>
          </div>
        </div>
      </header>

      {projects.map((project, index) => (
        <article
          id={project.slug}
          key={project.slug}
          data-project-panel
          data-project-index={index}
          className="project-panel"
        >
          <div className="project-sticky">
            <div data-project-media-frame className="project-media-frame">
              <div data-project-media className="project-media">
                {project.cover_url ? (
                  <Image
                    src={project.cover_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                ) : (
                  <PlaceholderGraphic index={index} />
                )}
              </div>
              <div className="project-media-wash" aria-hidden="true" />
              {project.is_provisional ? (
                <span className="project-concept-label">IMAGEM CONCEITUAL / PROVISÓRIA</span>
              ) : null}
            </div>

            <div data-project-info className="project-info">
              <p className="project-kicker">{project.category ?? 'Projeto'} <span>/</span> {project.location ?? 'Local a definir'}</p>
              <h3>{project.title}</h3>
              <div className="project-info-bottom">
                <span>{project.year ?? '—'}</span>
                <span>{String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
