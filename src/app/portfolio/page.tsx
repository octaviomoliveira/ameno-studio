import ProjectScrollSection from '@/components/portfolio/ProjectScrollSection'
import KeywordsWall from '@/components/home/KeywordsWall'
import AssetsSection from '@/components/portfolio/AssetsSection'
import PortfolioQuickNav from '@/components/portfolio/PortfolioQuickNav'

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
          <span>05 PROJETOS · 22 RENDERS · 29 MODELOS 3D (.GLB)</span>
        </div>
        <div className="portfolio-header-grid">
          <h1 className="portfolio-heading">
            Trabalhos que tornam<br /><em className="font-editorial">ideias visíveis.</em>
          </h1>
          <p className="portfolio-header-lead">
            Navegue pelas cenas completas do estúdio, explore o mural de renders em alta resolução ou pule direto para a biblioteca de 29 modelos 3D interativos abaixo.
          </p>
        </div>
      </header>
      <PortfolioQuickNav />
      <ProjectScrollSection />
      <KeywordsWall />
      <AssetsSection />
    </div>
  )
}
