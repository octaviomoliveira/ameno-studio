'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const AssetViewer = dynamic(() => import('./AssetViewer'), {
  ssr: false,
  loading: () => (
    <div className="asset-viewer-skeleton" role="status">
      <span className="sr-only">Carregando modelo 3D…</span>
    </div>
  ),
})

export type Asset3D = {
  slug: string
  name: string
  description: string
  glbSrc: string
  fallbackImg: string
  renders: { src: string; alt: string }[]
}

const ASSETS: Asset3D[] = [
  {
    slug: 'cadeira-raia',
    name: 'Cadeira Raia',
    description: 'Modelagem em 3ds Max com geometria precisa e leveza de arquivo. Pronta para renderização em SketchUp e Enscape — aparece bem até no primeiro plano.',
    glbSrc: '/assets/3d/cadeira-raia/cadeira-raia.glb',
    fallbackImg: '/projects/interior-stair.webp',
    renders: [
      { src: '/assets/3d/cadeira-raia/cadeira-raia-render-01.webp', alt: 'Cadeira Raia — vista frontal renderizada' },
      { src: '/assets/3d/cadeira-raia/cadeira-raia-render-02.webp', alt: 'Cadeira Raia — vista traseira renderizada' },
    ],
  },
  {
    slug: 'cadeira-axis',
    name: 'Cadeira Axis',
    description: 'Modelagem em 3ds Max com atenção aos detalhes estruturais. Disponível em versão alta e baixa, pronta para SketchUp e Enscape.',
    glbSrc: '/assets/3d/cadeira-axis/cadeira-axis.glb',
    fallbackImg: '/projects/interior-stair.webp',
    renders: [
      { src: '/assets/3d/cadeira-axis/cadeira-axis-render-01.webp', alt: 'Cadeira Axis — vista frontal renderizada' },
      { src: '/assets/3d/cadeira-axis/cadeira-axis-render-02.webp', alt: 'Cadeira Axis — vista traseira renderizada' },
    ],
  },
  {
    slug: 'poltrona-pelicano',
    name: 'Poltrona Pelicano',
    description: 'Espaldar em leque com fusos torneados à mão, braços escultóricos e assento em palhinha. Modelagem fiel ao original brasileiro — cada curva da madeira preservada no arquivo.',
    glbSrc: '/assets/3d/poltrona-pelicano/poltrona-pelicano.glb',
    fallbackImg: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-01.webp', alt: 'Poltrona Pelicano — vista em perspectiva' },
      { src: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-02.webp', alt: 'Poltrona Pelicano — vista frontal' },
      { src: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-03.webp', alt: 'Poltrona Pelicano — vista lateral' },
      { src: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-04.webp', alt: 'Poltrona Pelicano — detalhe do espaldar' },
    ],
  },
  // Para adicionar novo asset: criar public/assets/3d/<slug>/<slug>.glb e <slug>-render-0N.webp
]

/* ── Carrossel de renders dentro de um slide ────────────────────────── */
function RenderCarousel({ renders, name, description }: {
  renders: Asset3D['renders']
  name: string
  description: string
}) {
  const [ri, setRi] = useState(0)
  const total = renders.length
  return (
    <div className="asset-render-panel">
      <div className="asset-render-frame">
        {renders.map((r, i) => (
          <Image
            key={r.src}
            src={r.src}
            alt={r.alt}
            fill
            quality={90}
            className={`object-cover asset-render-img${i === ri ? ' asset-render-img--active' : ''}`}
            sizes="(max-width: 767px) 100vw, 50vw"
            priority={i === 0}
          />
        ))}
        <div className="asset-render-overlay">
          <h3 className="asset-render-name">{name}</h3>
          <p className="asset-render-desc">{description}</p>
        </div>
      </div>

      {total > 1 && (
        <nav className="asset-render-nav" aria-label={`Renders de ${name}`}>
          <button type="button" className="asset-carousel-btn"
            onClick={() => setRi(i => (i - 1 + total) % total)} aria-label="Render anterior">←</button>
          <span className="asset-carousel-count">{String(ri + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          <button type="button" className="asset-carousel-btn"
            onClick={() => setRi(i => (i + 1) % total)} aria-label="Próximo render">→</button>
        </nav>
      )}
    </div>
  )
}

/* ── Seção principal — GSAP horizontal scroll por slide ─────────────── */
export default function AssetsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stripRef  = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(1)
  const total = ASSETS.length

  useEffect(() => {
    if (total <= 1) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      /* Desktop: GSAP pina e move por largura de card */
      mm.add('(min-width: 768px)', () => {
        const section = sectionRef.current
        const strip   = stripRef.current
        if (!section || !strip) return

        // Lê a largura real do primeiro slide (definida via CSS em 75vw)
        const getCardW = () => (strip.children[0] as HTMLElement)?.offsetWidth ?? window.innerWidth

        gsap.to(strip, {
          x: () => -((total - 1) * getCardW()),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${(total - 1) * getCardW()}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setCurrent(Math.round(self.progress * (total - 1)) + 1)
            },
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [total])

  return (
    <section ref={sectionRef} className="assets-section" aria-labelledby="assets-title">

      {/* Header com contador */}
      <div className="assets-section-header">
        <div className="assets-section-header-left">
          <span className="section-tag">ASSETS 3D</span>
          <h2 id="assets-title">
            Modelagens prontas para<br />
            <em className="font-editorial">quem entrega detalhe.</em>
          </h2>
          <p>Produzidas no 3ds Max. Prontas para SketchUp e Enscape.</p>
        </div>
        <span className="assets-slide-counter" aria-live="polite">
          {String(current).padStart(2, '0')}
          <span className="assets-slide-counter-total"> / {String(total).padStart(2, '0')}</span>
        </span>
      </div>

      {/* Clip wrapper — 100vw, escapa o container, oculta overflow horizontal */}
      <div className="assets-strip-clip">
        {/* Strip — GSAP move via translateX */}
        <div ref={stripRef} className="assets-strip">
          {ASSETS.map(asset => (
            <article key={asset.slug} className="asset-slide">
              {/* Esquerda — viewer 3D */}
              <div className="asset-viewer-wrap">
                <AssetViewer
                  src={asset.glbSrc}
                  fallbackImg={asset.fallbackImg}
                  label={asset.name}
                  className="assets-section-viewer"
                />
              </div>
              {/* Direita — render (foto) + descrição */}
              <RenderCarousel
                renders={asset.renders}
                name={asset.name}
                description={asset.description}
              />
            </article>
          ))}
        </div>
      </div>

    </section>
  )
}
