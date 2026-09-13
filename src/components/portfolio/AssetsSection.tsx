'use client'

import dynamic from 'next/dynamic'

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
}

const ASSETS: Asset3D[] = [
  {
    slug: 'cadeira-raia',
    name: 'Cadeira Raia',
    description: 'Modelagem em 3ds Max com geometria precisa e leveza de arquivo. Pronta para renderização em SketchUp e Enscape — aparece bem até no primeiro plano.',
    glbSrc: '/assets/3d/cadeira-raia.glb',
    fallbackImg: '/projects/interior-stair.webp',
  },
]

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
            <div className="asset-viewer-wrap">
              <AssetViewer src={asset.glbSrc} fallbackImg={asset.fallbackImg} label={asset.name} className="assets-section-viewer" />
            </div>
            <div className="asset-info">
              <span className="asset-num">{String(index + 1).padStart(2, '0')} / MODELO 3D</span>
              <h3>{asset.name}</h3>
              <p>{asset.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
