import ProjectScrollSection from '@/components/portfolio/ProjectScrollSection'
import KeywordsWall from '@/components/home/KeywordsWall'
import AssetsSection from '@/components/portfolio/AssetsSection'

export const metadata = {
  title: 'Portfólio — ameno.studio',
  description: 'Arquitetura, visualização e assets 3D — trabalhos autorais e projetos do estúdio.',
}

export default function PortfolioPage() {
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
      <ProjectScrollSection />
      <KeywordsWall />
      <AssetsSection />
    </div>
  )
}
