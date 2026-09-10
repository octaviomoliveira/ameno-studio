import { supabase } from '@/lib/supabase'
import HeroSection from '@/components/hero/HeroSection'
import Marquee from '@/components/shared/Marquee'
import ProjectScroll from '@/components/projects/ProjectScroll'
import PluginsTeaser from '@/components/plugins/PluginsTeaser'
import KeywordsWall from '@/components/home/KeywordsWall'

type Project = {
  slug: string
  title: string
  category: string | null
  location: string | null
  year: number | null
  cover_url: string | null
}

export const revalidate = 3600

const PLACEHOLDER_PROJECTS: Project[] = [
  { slug: 'estudio-bola', title: 'Estúdio Bola', category: 'Comercial', location: 'São Paulo, SP', year: 2023, cover_url: '/projects/estudio-bola.webp' },
  { slug: 'central-parque', title: 'Central Parque', category: 'Residencial', location: 'Curitiba, PR', year: 2024, cover_url: '/projects/central-parque.webp' },
  { slug: 'raizes', title: 'Raízes', category: 'Residencial', location: 'Capão Bonito, SP', year: 2024, cover_url: '/projects/raizes-manha.webp' },
  { slug: 'goya', title: 'Goya', category: 'Residencial', location: 'São Paulo, SP', year: 2024, cover_url: '/projects/goya-gourmet.webp' },
  { slug: 'moradas-do-bosque', title: 'Moradas do Bosque', category: 'Condomínio', location: 'Campinas, SP', year: 2023, cover_url: '/projects/moradas-bosque.webp' },
]

async function getProjects(): Promise<Project[]> {
  try {
    const { data } = await supabase
      .from('projects')
      .select('slug, title, category, location, year, cover_url')
      .eq('published', true)
      .order('order_index', { ascending: true })

    return ((data ?? []) as Project[]).filter((project) => !project.cover_url?.includes('images.unsplash.com'))
  } catch {
    return []
  }
}

export default async function Home() {
  const projects = (await getProjects())
  const visibleProjects = projects.length > 0 ? projects : PLACEHOLDER_PROJECTS

  return (
    <>
      <HeroSection />
      <Marquee />
      <KeywordsWall />
      <ProjectScroll projects={visibleProjects} />
      <PluginsTeaser />
    </>
  )
}
