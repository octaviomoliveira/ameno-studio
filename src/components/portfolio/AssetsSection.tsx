'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useState } from 'react'

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
    glbSrc: '/assets/3d/cadeira-raia.glb',
    fallbackImg: '/projects/interior-stair.webp',
    renders: [
      { src: '/assets/3d/cadeira-raia-render-front.jpg', alt: 'Cadeira Raia — vista frontal renderizada' },
      { src: '/assets/3d/cadeira-raia-render-back.jpg',  alt: 'Cadeira Raia — vista traseira renderizada' },
    ],
  },
]

function RenderCarousel({ renders, name }: { renders: Asset3D['renders']; name: string }) {
  const [index, setIndex] = useState(0)
  const total = renders.length
  const prev = () => setIndex((i) => (i - 1 + total) % total)
  const next = () => setIndex((i) => (i + 1) % total)

  return (
    <div className="asset-carousel" aria-label={`Renders de ${name}`}>
      <div className="asset-carousel-frame">
        <Image
          key={renders[index].src}
          src={renders[index].src}
          alt={renders[index].alt}
          fill
          className="object-cover asset-carousel-img"
          sizes="(max-width: 767px) 100vw, 50vw"
        />
      </div>

      <div className="asset-carousel-controls">
        <button
          type="button"
          className="asset-carousel-btn"
          onClick={prev}
          aria-label="Render anterior"
        >
          ←
        </button>

        <span className="asset-carousel-count">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>

        <button
          type="button"
          className="asset-carousel-btn"
          onClick={next}
          aria-label="Próximo render"
        >
          →
        </button>
      </div>

      <p className="asset-carousel-hint">RENDERS DO MODELO</p>
    </div>
  )
}

export default function AssetsSection() {
  return (
    <section className="assets-section" aria-labelledby="assets-title">
      <div className="assets-section-header">
        <span className="section-tag">ASSETS 3D</span>
        <h2 id="assets-title">
          Modelagens prontas para<br />
          <em className="font-editorial">quem entrega detalhe.</em>
        </h2>
        <p>Produzidas no 3ds Max. Prontas para SketchUp e Enscape.</p>
      </div>

      <div className="assets-grid">
        {ASSETS.map((asset, index) => (
          <article key={asset.slug} className="asset-card">

            {/* Coluna esquerda — viewer 3D interativo */}
            <div className="asset-viewer-wrap">
              <AssetViewer src={asset.glbSrc} fallbackImg={asset.fallbackImg} label={asset.name} className="assets-section-viewer" />
            </div>

            {/* Coluna direita — info + carrossel de renders */}
            <div className="asset-right">
              <div className="asset-info">
                <span className="asset-num">{String(index + 1).padStart(2, '0')} / MODELO 3D</span>
                <h3>{asset.name}</h3>
                <p>{asset.description}</p>
              </div>

              {asset.renders.length > 0 && (
                <RenderCarousel renders={asset.renders} name={asset.name} />
              )}
            </div>

          </article>
        ))}
      </div>
    </section>
  )
}
