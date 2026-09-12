'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Projeto em destaque na home — troque pelo seu projeto autoría quando tiver
const FEATURED = {
  title: 'Portfólio',
  subtitle: 'Arquitetura · Visualização · Assets 3D',
  description: 'Do conceito à entrega — renders que comunicam espaço, atmosfera e intenção.',
  coverUrl: '/projects/interior-stair.webp',
  href: '/portfolio',
  cta: 'Explorar portfólio →',
}

export default function HomePortfolioTeaser() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from('[data-portfolio-teaser-text]', {
        yPercent: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      })
      gsap.from('[data-portfolio-teaser-img]', {
        scale: 1.05,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="home-portfolio-teaser"
      aria-labelledby="home-portfolio-title"
    >
      <div className="home-portfolio-teaser-inner">
        {/* Texto */}
        <div className="home-portfolio-teaser-copy">
          <div className="home-portfolio-topline" data-portfolio-teaser-text>
            <span>03 / PORTFÓLIO</span>
            <span>AUTORAIS · ESTÚDIO · ASSETS 3D</span>
          </div>
          <h2 id="home-portfolio-title" data-portfolio-teaser-text>
            {FEATURED.subtitle}
          </h2>
          <p data-portfolio-teaser-text>{FEATURED.description}</p>
          <Link
            href={FEATURED.href}
            className="ameno-button ameno-button--primary"
            data-portfolio-teaser-text
          >
            {FEATURED.cta}
          </Link>
        </div>

        {/* Imagem de destaque */}
        <Link
          href={FEATURED.href}
          className="home-portfolio-teaser-media"
          data-portfolio-teaser-img
          aria-hidden="true"
          tabIndex={-1}
        >
          <Image
            src={FEATURED.coverUrl}
            alt={`${FEATURED.title} — ameno.studio`}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
          />
          <div className="home-portfolio-teaser-wash" aria-hidden="true" />
          <span className="home-portfolio-teaser-hover-label" aria-hidden="true">
            Ver portfólio →
          </span>
        </Link>
      </div>
    </section>
  )
}
