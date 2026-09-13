'use client'

import dynamic from 'next/dynamic'

const AssetViewer = dynamic(() => import('./AssetViewer'), {
  ssr: false,
  loading: () => <div className="asset-viewer-skeleton" role="status"><span className="sr-only">Carregando modelo 3D…</span></div>,
})

export type Asset3D = {
  slug: string
  name: string
  description: string
  glbSrc: string
  fallbackImg: string
}

type Props = { assets: Asset3D[] }

export default function PortfolioAssets({ assets }: Props) {
  if (assets.length === 0) return (
    <div className="portfolio-assets-empty">
      <p>Modelos em breve.</p>
    </div>
  )

  return (
    <div className="portfolio-assets-grid">
      {assets.map((asset, index) => (
        <article key={asset.slug} className="portfolio-asset-card">
          <div className="portfolio-asset-viewer">
            <AssetViewer src={asset.glbSrc} fallbackImg={asset.fallbackImg} label={asset.name} />
          </div>
          <div className="portfolio-asset-info">
            <span className="portfolio-asset-num">{String(index + 1).padStart(2, '0')} / MODELO 3D</span>
            <h3 className="portfolio-asset-name">{asset.name}</h3>
            <p className="portfolio-asset-desc">{asset.description}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
