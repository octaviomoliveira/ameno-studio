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

function AssetCard({ asset, index }: { asset: Asset3D; index: number }) {
  const [ri, setRi] = useState(0)
  const total = asset.renders.length
  const prev = () => setRi((i) => (i - 1 + total) % total)
  const next = () => setRi((i) => (i + 1) % total)

  return (
    <article className="asset-card">

      {/* ── Esquerda: viewer 3D interativo ── */}
      <div className="asset-viewer-wrap">
        <AssetViewer
          src={asset.glbSrc}
          fallbackImg={asset.fallbackImg}
          label={asset.name}
          className="assets-section-viewer"
        />
        <span className="asset-viewer-tag">
          {String(index + 1).padStart(2, '0')} / MODELO 3D — EXPLORE COM O CURSOR
        </span>
      </div>

      {/* ── Direita: render com texto overlay + nav ── */}
      <div className="asset-render-panel">
        <div className="asset-render-frame">
          {asset.renders.map((r, i) => (
            <Image
              key={r.src}
              src={r.src}
              alt={r.alt}
              fill
              className={`object-cover asset-render-img${i === ri ? ' asset-render-img--active' : ''}`}
              sizes="(max-width: 767px) 100vw, 50vw"
              priority={i === 0}
            />
          ))}
          <div className="asset-render-overlay">
            <h3 className="asset-render-name">{asset.name}</h3>
            <p className="asset-render-desc">{asset.description}</p>
          </div>
        </div>

        {total > 1 && (
          <nav className="asset-render-nav" aria-label={`Renders de ${asset.name}`}>
            <button type="button" className="asset-carousel-btn" onClick={prev} aria-label="Render anterior">←</button>
            <span className="asset-carousel-count">{String(ri + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            <button type="button" className="asset-carousel-btn" onClick={next} aria-label="Próximo render">→</button>
          </nav>
        )}
      </div>

    </article>
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
        {ASSETS.map((asset, i) => <AssetCard key={asset.slug} asset={asset} index={i} />)}
      </div>
    </section>
  )
}
