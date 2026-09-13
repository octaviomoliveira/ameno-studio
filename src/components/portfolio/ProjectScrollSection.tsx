'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  { slug: 'estudio-bola', title: 'Estúdio Bola', category: 'Comercial', location: 'São Paulo, SP', year: 2023, cover_url: '/projects/estudio-bola.webp' },
  { slug: 'central-parque', title: 'Central Parque', category: 'Residencial', location: 'Curitiba, PR', year: 2024, cover_url: '/projects/central-parque.webp' },
  { slug: 'raizes', title: 'Raízes', category: 'Residencial', location: 'Capão Bonito, SP', year: 2024, cover_url: '/projects/raizes-manha.webp' },
  { slug: 'goya', title: 'Goya', category: 'Residencial', location: 'São Paulo, SP', year: 2024, cover_url: '/projects/goya-gourmet.webp' },
  { slug: 'moradas-do-bosque', title: 'Moradas do Bosque', category: 'Condomínio', location: 'Campinas, SP', year: 2023, cover_url: '/projects/moradas-bosque.webp' },
]

export default function ProjectScrollSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackWrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const trackWrap = trackWrapRef.current
    const track = trackRef.current
    if (!section || !trackWrap || !track) return

    const getDistance = () => track.scrollWidth - trackWrap.clientWidth
    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
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
      const refresh = () => {
        cancelAnimationFrame(refreshFrame)
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh())
      }
      const observer = new ResizeObserver(refresh)
      observer.observe(track)
      observer.observe(trackWrap)
      void document.fonts.ready.then(() => { if (!disposed) refresh() })

      return () => {
        disposed = true
        observer.disconnect()
        cancelAnimationFrame(refreshFrame)
        st.kill()
        anim.kill()
      }
    }, section)

    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className="project-scroll-section" aria-label="Projetos principais">
      <div ref={trackWrapRef} className="project-scroll-wrap">
        <div ref={trackRef} className="project-scroll-track">
          {PROJECTS.map((project, index) => (
            <article id={project.slug} key={project.slug} className="project-scroll-slide" aria-label={project.title}>
              <Image src={project.cover_url} alt={project.title} fill
                sizes="(max-width: 767px) 100vw, (prefers-reduced-motion: reduce) 100vw, 80vw"
                className="object-cover" preload={index === 0} />
              <div className="project-scroll-wash" aria-hidden="true" />
              <div className="project-scroll-meta">
                <span className="project-scroll-num">{String(index + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}</span>
                <h2 className="project-scroll-title">{project.title}</h2>
                <p className="project-scroll-info">{project.category} · {project.location} · {project.year}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
