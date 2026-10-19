'use client'

import Link from 'next/link'
import Image from 'next/image'
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
        yPercent: 40,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      })
      gsap.from('[data-tool-rule]', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: section, start: 'top 64%', once: true },
      })
    }, section)

    return () => context.revert()
  }, [])

  return (
    <section ref={sectionRef} id="plugins-teaser" className="plugins-teaser" aria-labelledby="plugins-teaser-title">
      <div className="plugins-teaser-inner">
        <div className="plugins-teaser-topline">
          <span>04 / FERRAMENTAS PROPRIETÁRIAS</span>
          <span>AMENO TOOLS / 001 · 3DS MAX 2021–2026</span>
        </div>

        <div className="plugins-teaser-showcase">
          <div className="plugins-teaser-copy">
            <h2 id="plugins-teaser-title" className="plugins-teaser-title">
              <span data-tool-line>Ferramentas que</span>
              <span data-tool-line>devolvem <em className="font-editorial">tempo.</em></span>
            </h2>

            <div data-tool-rule className="plugins-teaser-rule" />

            <div className="plugins-teaser-meta">
              <span className="plugins-teaser-badge">PLUGIN PARA 3DS MAX 2021 A 2026 · CORONA & V-RAY</span>
              <p className="plugins-teaser-product">Ameno Cotas</p>
              <p className="plugins-teaser-description">
                Cotas técnicas em 3 cliques direto no 3ds Max. Ficam presas nos cantos do móvel, mudam de cor/seta na hora e exportam um PNG sem fundo pronto para soltar por cima do seu render no Photoshop.
              </p>

              <ul className="plugins-teaser-pills" aria-label="Destaques do plugin">
                <li>1 · Cota em 3 cliques</li>
                <li>2 · Atualiza se mover o móvel</li>
                <li>3 · Exporta PNG transparente</li>
              </ul>

              <div className="plugins-teaser-actions">
                <Link href="/plugins" className="ameno-button ameno-button--primary">
                  Conhecer o Ameno Cotas <span aria-hidden="true">→</span>
                </Link>
                <Link href="/plugins#tutorial" className="ameno-button ameno-button--secondary">
                  Ver Tutorial em Fotos <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/plugins#tutorial" className="plugins-teaser-visual" aria-label="Ver tutorial interativo do Ameno Cotas no 3ds Max 2026">
            <div className="plugins-teaser-visual-top">
              <span>CAPTURA REAL · 3DS MAX 2026</span>
              <span>VER TUTORIAL PASSO A PASSO ↗</span>
            </div>
            <div className="plugins-teaser-visual-frame">
              <Image
                src="/images/plugins/cotas/tutorial_01_cotar_uma_medida.png"
                alt="Interface real do plugin Ameno Cotas aberto no 3ds Max 2026 cotando marcenaria em 3 cliques"
                width={1600}
                height={1020}
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="plugins-teaser-visual-img"
              />
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
