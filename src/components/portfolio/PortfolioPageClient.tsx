'use client'

import dynamic from 'next/dynamic'
import type { CarouselProject } from './ProjectCarousel'
import type { Asset3D } from './PortfolioAssets'

const ProjectCarousel = dynamic(() => import('./ProjectCarousel'), { ssr: false })
const KeywordsFlow = dynamic(() => import('./KeywordsFlow'), { ssr: false })
const PortfolioAssets = dynamic(() => import('./PortfolioAssets'), { ssr: false })

const PROJECTS: CarouselProject[] = [
  { slug: 'estudio-bola',      title: 'Estúdio Bola',      category: 'Comercial',    location: 'São Paulo, SP',    year: 2023, cover_url: '/projects/estudio-bola.webp'   },
  { slug: 'central-parque',    title: 'Central Parque',    category: 'Residencial',  location: 'Curitiba, PR',     year: 2024, cover_url: '/projects/central-parque.webp'  },
  { slug: 'raizes',            title: 'Raízes',            category: 'Residencial',  location: 'Capão Bonito, SP', year: 2024, cover_url: '/projects/raizes-manha.webp'    },
  { slug: 'goya',              title: 'Goya',              category: 'Residencial',  location: 'São Paulo, SP',    year: 2024, cover_url: '/projects/goya-gourmet.webp'    },
  { slug: 'moradas-do-bosque', title: 'Moradas do Bosque', category: 'Condomínio',   location: 'Campinas, SP',     year: 2023, cover_url: '/projects/moradas-bosque.webp'  },
]

const ASSETS_3D: Asset3D[] = [
  {
    slug: 'cadeira-raia',
    name: 'Cadeira Raia',
    description: 'Modelagem de alta precisão em 3ds Max. Geometria leve, detalhe de tecido e estrutura fiel ao original — pronta para renderização em SketchUp e Enscape.',
    glbSrc: '/assets/3d/cadeira-raia.glb',
    fallbackImg: '/projects/interior-stair.webp',
  },
]

export default function PortfolioPageClient() {
  return (
    <div className="portfolio-page">
      <header className="portfolio-header">
        <div className="page-topline">
          <span>PORTFÓLIO / AMENO STUDIO</span>
          <span>RECIFE, BRASIL</span>
        </div>
        <h1 className="portfolio-heading">
          Trabalhos que tornam<br /><em className="font-editorial">ideias visíveis.</em>
        </h1>
      </header>

      <section className="portfolio-carousel-section" aria-label="Projetos principais">
        <ProjectCarousel projects={PROJECTS} />
      </section>

      <section className="portfolio-flow-section" aria-label="O que fazemos">
        <div className="portfolio-flow-header">
          <span className="portfolio-section-tag">EM DETALHE</span>
        </div>
        <KeywordsFlow />
      </section>

      <section className="portfolio-assets-section" aria-labelledby="assets-title">
        <div className="portfolio-assets-header">
          <span className="portfolio-section-tag">ASSETS 3D</span>
          <h2 id="assets-title">Modelagens feitas para<br /><em className="font-editorial">quem entrega detalhe.</em></h2>
          <p>Modelos produzidos no 3ds Max com foco em precisão geométrica e leveza de arquivo — prontos para uso em SketchUp e Enscape. Cada peça é detalhada o suficiente para aparecer no primeiro plano de um render.</p>
        </div>
        <PortfolioAssets assets={ASSETS_3D} />
      </section>
    </div>
  )
}
