import Image from 'next/image'
import Link from 'next/link'
import StudioMethod from '@/components/home/StudioMethod'

export const metadata = {
  title: 'Sobre — ameno.studio',
  description: 'Octávio Oliveira — arquitetura, visualização e ferramentas para tornar ideias claras e processos mais inteligentes.',
}

export default function SobrePage() {
  return (
    <>
    <section className="about-page relative overflow-hidden px-6 pb-28 pt-36 sm:pb-40 sm:pt-48">
      <div className="page-grid" aria-hidden="true" />
      <div className="mx-auto max-w-[1440px]">
        <div className="page-topline">
          <p>SOBRE / AMENO.STUDIO</p>
          <p>003 — 001</p>
        </div>

        <div className="about-intro grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:gap-24">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#666666]">Estúdio independente / Recife, Brasil</p>
            <h1 className="max-w-5xl text-display-sm">Arquitetura, visualização e ferramentas<span className="text-red">.</span></h1>
          </div>

          <div className="about-diagram" aria-hidden="true">
            <div className="about-diagram-topline"><span>AMENO / 003</span><span>FIELD NOTE</span></div>
            <svg viewBox="0 0 520 360" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M56 278H464M56 278V72H464V278" stroke="currentColor" strokeOpacity=".52" />
              <path d="M56 212H464M145 72V278M355 72V278" stroke="currentColor" strokeOpacity=".28" />
              <path d="M145 212L250 126L355 212" stroke="currentColor" strokeOpacity=".78" strokeWidth="1.5" />
              <path d="M80 318H440M80 42H440" stroke="#E63B2E" strokeOpacity=".58" />
              <path d="M80 312V324M440 312V324M80 36V48M440 36V48" stroke="#E63B2E" strokeOpacity=".58" />
              <circle cx="250" cy="126" r="5" fill="#E63B2E" />
              <path d="M250 126V78M242 86L250 78L258 86" stroke="#E63B2E" strokeOpacity=".85" />
              <text x="250" y="62" textAnchor="middle" fill="currentColor" fillOpacity=".7" fontSize="10" fontFamily="monospace" letterSpacing="2">ORDEM / INTERFERÊNCIA</text>
            </svg>
            <div className="about-diagram-footer"><span>01.20 / 04.80</span><span>ARCH / IMAGE / TOOLS</span></div>
          </div>
        </div>

        <div className="about-copy-grid mt-20 grid gap-12 border-t border-[#222222] pt-8 sm:mt-28 lg:grid-cols-[1fr_2fr] lg:gap-24">
          <div>
            <figure className="about-portrait">
              <div className="about-portrait-frame">
                <Image
                  src="/about/octavio-oliveira.webp"
                  alt="Retrato de Octávio Oliveira"
                  fill
                  sizes="(max-width: 1023px) calc(100vw - 3rem), 30vw"
                  className="object-cover"
                />
                <div className="about-portrait-wash" aria-hidden="true" />
                <span className="about-portrait-code">AMENO / PROFILE</span>
              </div>
              <figcaption><span>Octávio Oliveira</span><span>Recife / Brasil</span></figcaption>
            </figure>
            <div className="about-portrait-meta">
              <p>Arquitetura · Visualização · Ferramentas</p>
              <p>Disponível para colaborações</p>
            </div>
          </div>
          <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-[#e8e8e0]">
            <p>Eu sou Octávio Oliveira. O ameno.studio é o ponto de encontro entre meu trabalho com arquitetura, visualização e criação de ferramentas. Nasceu da vontade de transformar ideias complexas em imagens claras — e processos repetitivos em soluções mais inteligentes.</p>
            <p className="text-[#a0a09a]">Para mim, visualizar não é apenas apresentar um projeto pronto. É uma forma de pensar: testar atmosferas, perceber relações, antecipar decisões e comunicar com precisão aquilo que ainda não existe.</p>
            <p className="text-[#666666]">A mesma inquietação que conduz os projetos também dá origem aos plugins. Quando uma tarefa consome tempo demais ou interrompe o raciocínio, procuro convertê-la em uma ferramenta simples, direta e útil para quem trabalha criando.</p>
            <p className="text-[#666666]">A partir de Recife, colaboro com pessoas, escritórios e empresas que procuram unir intenção, técnica e uma imagem capaz de contar a história certa.</p>
            <div className="about-disciplines flex flex-wrap gap-x-6 gap-y-2 pt-4 text-sm uppercase tracking-[0.18em] text-[#666666]">
              <span>Arquitetura</span><span>ArchViz</span><span>Interiores</span><span>BIM</span><span>Produtos</span>
            </div>
            <Link href="mailto:contato@ameno.studio" className="about-contact inline-block pt-8 text-sm uppercase tracking-[0.2em] text-[#E63B2E] hover:text-white">
              contato@ameno.studio →
            </Link>
          </div>
        </div>
      </div>
    </section>
    <StudioMethod />
    </>
  )
}
