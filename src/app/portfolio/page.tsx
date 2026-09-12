import PortfolioTabs from '@/components/portfolio/PortfolioTabs'

export const metadata = {
  title: 'Portfólio — ameno.studio',
  description: 'Arquitetura, visualização e assets 3D — trabalhos autorais e projetos do estúdio.',
}

// Projetos autorais (100% do Octávio)
// PENDENTE: adicionar renders em public/projects/autorais/ e descomentar abaixo
const AUTORAIS_PROJECTS: Project[] = [
  // {
  //   slug: 'meu-projeto-autoural',
  //   title: 'Nome do Projeto',
  //   category: 'Residencial',
  //   location: 'Recife, PE',
  //   year: 2025,
  //   cover_url: '/projects/autorais/cover.webp',
  // },
]

// Projetos do estúdio — usando a pasta /projects existente
const STUDIO_PROJECTS: Project[] = [
  { slug: 'estudio-bola', title: 'Estúdio Bola', category: 'Comercial', location: 'São Paulo, SP', year: 2023, cover_url: '/projects/estudio-bola.webp' },
  { slug: 'central-parque', title: 'Central Parque', category: 'Residencial', location: 'Curitiba, PR', year: 2024, cover_url: '/projects/central-parque.webp' },
  { slug: 'raizes', title: 'Raízes', category: 'Residencial', location: 'Capão Bonito, SP', year: 2024, cover_url: '/projects/raizes-manha.webp' },
  { slug: 'goya', title: 'Goya', category: 'Residencial', location: 'São Paulo, SP', year: 2024, cover_url: '/projects/goya-gourmet.webp' },
  { slug: 'moradas-do-bosque', title: 'Moradas do Bosque', category: 'Condomínio', location: 'Campinas, SP', year: 2023, cover_url: '/projects/moradas-bosque.webp' },
]

// Assets 3D — cadeira-raia.fbx em public/assets/3d/
// PENDENTE: converter cadeira-raia.fbx → cadeira-raia.glb via Blender
// (File → Export → glTF 2.0 → marcar "Draco mesh compression")
const ASSETS_3D: Asset3D[] = [
  {
    slug: 'cadeira-raia',
    name: 'Cadeira Raia',
    description: 'Modelagem de alta precisão para uso em renders de interiores.',
    glbSrc: '/assets/3d/cadeira-raia.glb',         // ← disponível após conversão
    fallbackImg: '/projects/interior-stair.webp',   // ← imagem temporária até ter preview
  },
]

export default function PortfolioPage() {
  return (
    <main className="portfolio-page">
      <PortfolioTabs
        autoraisProjects={[...AUTORAIS_PROJECTS]}
        studioprojects={[...STUDIO_PROJECTS]}
        assets={[...ASSETS_3D]}
      />
    </main>
  )
}
