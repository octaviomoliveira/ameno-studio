'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CotasInterativas from './CotasInterativas'
import InterferenceField from './InterferenceField'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const media = mediaRef.current
    const copy = copyRef.current
    if (!section || !media || !copy || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const isMobile = window.matchMedia('(max-width: 767px)').matches

    const context = gsap.context(() => {
      gsap.to(media, {
        scale: isMobile ? 1.035 : 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to(copy, {
        yPercent: isMobile ? -4 : -12,
        opacity: isMobile ? 0.42 : 0.18,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom 20%',
          scrub: true,
        },
      })
    }, section)

    return () => context.revert()
  }, [])

  return (
    <section ref={sectionRef} className="narrative-hero" aria-labelledby="hero-title">
      <div ref={mediaRef} className="narrative-hero-media">
        <Image
          src="/hero/ameno-hero-concept-v1.webp"
          alt="Pavilhão monumental de concreto ao entardecer — imagem conceitual"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="narrative-hero-wash" aria-hidden="true" />
      <CotasInterativas />
      <InterferenceField />

      <div className="narrative-hero-meta" aria-hidden="true">
        <span>STUDIO INDEPENDENTE / RECIFE</span>
        <span>IMAGEM CONCEITUAL / PROVISÓRIA</span>
      </div>

      <div ref={copyRef} className="narrative-hero-copy">
        <p>ARQUITETURA · VISUALIZAÇÃO · FERRAMENTAS</p>
        <h1 id="hero-title">
          <span>IMAGINAMOS</span>
          <span>O QUE AINDA</span>
          <span className="font-editorial">não existe.</span>
        </h1>
        <div className="narrative-hero-actions">
          <Link href="#portfolio" className="ameno-button ameno-button--primary">Ver projetos <span aria-hidden="true">→</span></Link>
          <Link href="/plugins" className="ameno-button ameno-button--secondary">Conhecer ferramentas <span aria-hidden="true">→</span></Link>
        </div>
      </div>

      <div className="narrative-hero-scroll" aria-hidden="true">
        <span>SCROLL</span>
        <i />
      </div>
    </section>
  )
}
