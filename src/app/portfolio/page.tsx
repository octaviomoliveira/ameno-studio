import PortfolioCatalogHub from '@/components/portfolio/PortfolioCatalogHub'

export const metadata = {
  title: 'Portfólio — ameno.studio',
  description: 'Projetos autorais de arquitetura, visualização arquitetônica (ArchViz) e biblioteca de assets 3D interativos.',
}

export default function PortfolioPage() {
  return (
    <div className="portfolio-page">
      <header className="portfolio-header">
        <div className="page-topline">
          <span>PORTFÓLIO / AMENO STUDIO</span>
          <span>08 PROJETOS DE ARQUITETURA · 07 EMPREENDIMENTOS ARCHVIZ · 29 MODELOS 3D (.GLB)</span>
        </div>
        <div className="portfolio-header-grid">
          <h1 className="portfolio-heading">
            Trabalhos que tornam<br /><em className="font-editorial">ideias visíveis.</em>
          </h1>
          <p className="portfolio-header-lead">
            Navegue pelas três frentes do estúdio: projetos autorais de arquitetura e executivo BIM, catálogo de visualização por empreendimento e biblioteca de 29 ativos 3D interativos.
          </p>
        </div>
      </header>
      <PortfolioCatalogHub />
    </div>
  )
}
