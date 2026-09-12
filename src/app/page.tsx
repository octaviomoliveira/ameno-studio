import HeroVideo from '@/components/hero/HeroVideo'
import Marquee from '@/components/shared/Marquee'
import PluginsTeaser from '@/components/plugins/PluginsTeaser'
import HomePortfolioTeaser from '@/components/home/HomePortfolioTeaser'

export const revalidate = 3600

export default function Home() {
  return (
    <>
      {/* Cap. 1 — Hero 3D com scroll sincronizado */}
      <HeroVideo
        videoSrc="/hero/hero-central-parque.webm"
        posterSrc="/hero/ameno-hero-concept-v1.webp"
        alt="Vista aérea do Central Parque — ameno.studio"
      />

      {/* Cap. 2 — Marquee de disciplinas (transição) */}
      <Marquee />

      {/* Cap. 3 — Teaser do portfólio (1 projeto em destaque + link) */}
      <HomePortfolioTeaser />

      {/* Cap. 4 — Teaser de plugins */}
      <PluginsTeaser />
    </>
  )
}
