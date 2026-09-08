'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ApproachStatement() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.from('[data-approach-line]', {
        yPercent: 42,
        opacity: 0,
        duration: 0.95,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 68%', once: true },
      })
    }, section)

    return () => context.revert()
  }, [])

  return (
    <section ref={sectionRef} className="approach-statement" aria-labelledby="approach-title">
      <div className="approach-statement-inner">
        <div className="approach-statement-topline">
          <span>02 / ABORDAGEM</span>
          <span>CLAREZA ANTES DO RUÍDO</span>
        </div>

        <h2 id="approach-title" className="approach-statement-title">
          <span data-approach-line>Uma imagem só funciona</span>
          <span data-approach-line>quando torna uma decisão</span>
          <span data-approach-line className="font-editorial">mais clara.</span>
        </h2>

        <div className="approach-statement-bottom">
          <p>Arquitetura, visualização e ferramentas organizadas ao redor de uma ideia precisa.</p>
          <strong>FORMA SEM INTENÇÃO<br />É SÓ <em>RUÍDO.</em></strong>
        </div>
      </div>
    </section>
  )
}
