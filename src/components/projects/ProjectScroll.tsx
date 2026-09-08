'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
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
}

export default function ProjectScroll({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.project-card')

      cards.forEach((card) => {
        const img = card.querySelector('.project-img') as HTMLElement
        const info = card.querySelector('.project-info') as HTMLElement

        // Image reveal: scale in
        gsap.from(img, {
          scale: 1.1,
          opacity: 0,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })

        // Parallax leve na imagem
        gsap.to(img, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })

        // Info desliza de baixo
        gsap.from(info, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-4">
      {projects.map((project) => (
        <div
          key={project.slug}
          className="project-card relative overflow-hidden group"
          style={{ marginBottom: '2px' }}
        >
          {/* Imagem fullwidth */}
          <div className="project-img relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image
              src={project.cover_url ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80'}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="100vw"
            />
          </div>

          {/* Info do projeto */}
          <div
            className="project-info flex items-end justify-between px-6 py-4"
            style={{ borderBottom: '1px solid #222222' }}
          >
            <div>
              <h2 className="text-lg font-bold tracking-tight">{project.title}</h2>
              <p className="text-sm mt-0.5" style={{ color: '#666666' }}>
                {project.category} · {project.location}
              </p>
            </div>
            <span className="text-sm font-mono" style={{ color: '#E63B2E' }}>
              {project.year}
            </span>
          </div>
        </div>
      ))}
    </section>
  )
}
