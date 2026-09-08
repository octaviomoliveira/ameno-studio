import { supabase } from '@/lib/supabase'
import HeroSection from '@/components/hero/HeroSection'
import Marquee from '@/components/shared/Marquee'
import ProjectScroll from '@/components/projects/ProjectScroll'
import PluginsTeaser from '@/components/plugins/PluginsTeaser'
import ApproachStatement from '@/components/home/ApproachStatement'

type Project = {
  slug: string
  title: string
  category: string | null
  location: string | null
  year: number | null
  cover_url: string | null
}

const PLACEHOLDER_PROJECTS: Project[] = [
  { slug: 'projeto-01', title: 'Casa-pátio', category: 'Residencial', location: 'Imagem conceitual', year: 2026, cover_url: '/projects/residencia-courtyard.png' },
  { slug: 'projeto-02', title: 'Entre planos', category: 'Interiores', location: 'Imagem conceitual', year: 2026, cover_url: '/projects/interior-stair.png' },
  { slug: 'projeto-03', title: 'Pavilhão norte', category: 'Comercial', location: 'Imagem conceitual', year: 2026, cover_url: '/projects/pavilhao-creative.png' },
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
      <ApproachStatement />
      <ProjectScroll projects={visibleProjects} />
      <PluginsTeaser />
    </>
  )
}
