import PortfolioCatalogHub from '@/components/portfolio/PortfolioCatalogHub'

export const metadata = {
  title: 'Portfólio — ameno.studio',
  description: 'Projetos autorais de arquitetura, visualização arquitetônica (ArchViz) e biblioteca de assets 3D interativos.',
}

export default function PortfolioPage() {
  return (
    <div className="portfolio-page">
      <header className="portfolio-header">
        <div className="portfolio-header-grid">
          <h1 className="portfolio-heading">
            Arquitetura, visualização<br />e <em className="font-editorial">ativos 3D.</em>
          </h1>
          <p className="portfolio-header-lead">
            Projetos autorais e executivo em BIM, catálogo de empreendimentos ArchViz e biblioteca de 29 modelos 3D interativos prontos para girar no navegador.
          </p>
        </div>
      </header>
      <PortfolioCatalogHub />
    </div>
  )
}
