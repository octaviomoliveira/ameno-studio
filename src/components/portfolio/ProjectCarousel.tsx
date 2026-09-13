'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'

gsap.registerPlugin(Draggable)

export type CarouselProject = {
  slug: string
  title: string
  category: string
  location: string
  year: number
  cover_url: string
}

type Props = { projects: CarouselProject[] }

export default function ProjectCarousel({ projects }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    const wrap = wrapRef.current
    if (!track || !wrap || projects.length === 0) return

    const getWidth = () => wrap.offsetWidth

    const goTo = (index: number, animate = true) => {
      activeRef.current = Math.max(0, Math.min(index, projects.length - 1))
      gsap.to(track, { x: -activeRef.current * getWidth(), duration: animate ? 0.65 : 0, ease: 'power3.out' })
      wrap.querySelectorAll<HTMLElement>('[data-carousel-dot]').forEach((dot, i) => {
        dot.setAttribute('aria-selected', i === activeRef.current ? 'true' : 'false')
        dot.classList.toggle('is-active', i === activeRef.current)
      })
    }

    const draggable = Draggable.create(track, {
      type: 'x',
      bounds: { minX: -(projects.length - 1) * getWidth(), maxX: 0 },
      onDragEnd() {
        const x = gsap.getProperty(track, 'x') as number
        goTo(Math.round(-x / getWidth()))
      },
    })[0]

    const onResize = () => goTo(activeRef.current, false)
    window.addEventListener('resize', onResize)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(activeRef.current + 1)
      if (e.key === 'ArrowLeft') goTo(activeRef.current - 1)
    }
    wrap.addEventListener('keydown', onKey)

    goTo(0, false)
    return () => {
      window.removeEventListener('resize', onResize)
      wrap.removeEventListener('keydown', onKey)
      draggable.kill()
    }
  }, [projects])

  const handleDotClick = (i: number) => {
    const track = trackRef.current
    const wrap = wrapRef.current
    if (!track || !wrap) return
    activeRef.current = i
    gsap.to(track, { x: -i * wrap.offsetWidth, duration: 0.65, ease: 'power3.out' })
    wrap.querySelectorAll<HTMLElement>('[data-carousel-dot]').forEach((dot, j) => {
      dot.setAttribute('aria-selected', j === i ? 'true' : 'false')
      dot.classList.toggle('is-active', j === i)
    })
  }

  return (
    <div ref={wrapRef} className="project-carousel" aria-label="Projetos" tabIndex={0}>
      <div className="project-carousel-overflow">
        <div ref={trackRef} className="project-carousel-track">
          {projects.map((p, i) => (
            <article key={p.slug} className="project-carousel-slide">
              <div className="project-carousel-media">
                <Image src={p.cover_url} alt={p.title} fill sizes="(max-width: 768px) 100vw, 90vw" className="object-cover" priority={i === 0} />
                <div className="project-carousel-wash" aria-hidden="true" />
              </div>
              <div className="project-carousel-meta">
                <span className="project-carousel-num">{String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
                <h2 className="project-carousel-title">{p.title}</h2>
                <p className="project-carousel-info">{p.category} &middot; {p.location} &middot; {p.year}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="project-carousel-dots" role="tablist">
        {projects.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            role="tab"
            data-carousel-dot
            aria-selected={i === 0 ? 'true' : 'false'}
            aria-label={p.title}
            className={'project-carousel-dot' + (i === 0 ? ' is-active' : '')}
            onClick={() => handleDotClick(i)}
          />
        ))}
      </div>
    </div>
  )
}