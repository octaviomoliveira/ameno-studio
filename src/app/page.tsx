import BomJesusHero from '@/components/hero/BomJesusHero'
import Marquee from '@/components/shared/Marquee'
import PluginsTeaser from '@/components/plugins/PluginsTeaser'
import HomePortfolioTeaser from '@/components/home/HomePortfolioTeaser'

export const revalidate = 3600

export default function Home() {
  return (
    <>
      {/* Cabine interativa, com carregamento de vídeos sob demanda. */}
      <BomJesusHero />


      <Marquee />


      <HomePortfolioTeaser />


      <PluginsTeaser />
    </>
  )
}
