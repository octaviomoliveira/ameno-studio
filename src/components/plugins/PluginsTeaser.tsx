'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function PluginsTeaser() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.from('[data-tool-line]', {
        yPercent: 50,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 64%', once: true },
      })
      gsap.from('[data-tool-rule]', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: section, start: 'top 58%', once: true },
      })
    }, section)

    return () => context.revert()
  }, [])

  return (
    <section ref={sectionRef} id="plugins-teaser" className="plugins-teaser" aria-labelledby="plugins-teaser-title">
      <div className="plugins-teaser-mark" aria-hidden="true">O</div>
      <div className="plugins-teaser-inner">
        <div className="plugins-teaser-topline">
          <span>04 / FERRAMENTAS</span>
          <span>AMENO TOOLS / 001</span>
        </div>

        <h2 id="plugins-teaser-title" className="plugins-teaser-title">
          <span data-tool-line>Ferramentas que</span>
          <span data-tool-line>devolvem <em className="font-editorial">tempo.</em></span>
        </h2>

        <div data-tool-rule className="plugins-teaser-rule" />

        <div className="plugins-teaser-bottom">
          <div>
            <p className="plugins-teaser-product">Ameno Cotas</p>
            <p className="plugins-teaser-description">Cotas automáticas no 3ds Max para reduzir trabalho repetitivo e manter o foco na imagem.</p>
          </div>
          <Link href="/plugins" className="plugins-teaser-cta">
            Conhecer o Ameno Cotas <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
