'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HOME_PROJECTS = [
  {
    slug: 'delicias-da-ana',
    num: '01',
    title: 'Delícias da Ana',
    category: 'Arquitetura Comercial · 23 Lâminas',
    location: 'Retrofit, Fluxo & Cozinha Inox (2,65m × 25,00m)',
    year: '2025',
    coverUrl: '/projects/autorais/delicias-da-ana/fachada-limpa.webp',
    href: '/portfolio/delicias-da-ana',
    featured: true,
  },
  {
    slug: 'estudio-bola',
    num: '02',
    title: 'Estúdio Bola',
    category: 'Comercial',
    location: 'São Paulo, SP',
    year: '2023',
    coverUrl: '/projects/estudio-bola.webp',
  },
  {
    slug: 'central-parque',
    num: '03',
    title: 'Central Parque',
    category: 'Residencial',
    location: 'Curitiba, PR',
    year: '2024',
    coverUrl: '/projects/central-parque.webp',
  },
  {
    slug: 'raizes',
    num: '04',
    title: 'Raízes',
    category: 'Residencial',
    location: 'Capão Bonito, SP',
    year: '2024',
    coverUrl: '/projects/raizes-manha.webp',
  },
  {
    slug: 'goya',
    num: '05',
    title: 'Goya',
    category: 'Residencial',
    location: 'São Paulo, SP',
    year: '2024',
    coverUrl: '/projects/goya-gourmet.webp',
  },
]

const HOME_ASSETS_PREVIEW = [
  {
    name: 'Poltrona Pelicano',
    tag: 'Mobiliário Brasileiro',
    img: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-01.webp',
  },
  {
    name: 'Cadeira Raia',
    tag: 'Assento Assinado',
    img: '/assets/3d/cadeira-raia/cadeira-raia-render-01.webp',
  },
  {
    name: 'Cadeira Axis',
    tag: 'Madeira & Estrutura',
    img: '/assets/3d/cadeira-axis/cadeira-axis-render-01.webp',
  },
  {
    name: 'Cadeira Archi',
    tag: 'Corporativo & Couro',
    img: '/assets/3d/cadeira-archi/cadeira-archi-render-01.webp',
  },
  {
    name: 'Fechadura DLock 4800',
    tag: 'Hardware & Detalhe',
    img: '/assets/3d/dlock-dl-4800-2022/dlock-dl-4800-2022-render-01.webp',
  },
  {
    name: 'LG Inverter 48k BTU',
    tag: 'Equipamento Técnico',
    img: '/assets/3d/lg-zvnq48gm2aa/lg-zvnq48gm2aa-render-01.webp',
  },
]

export default function HomePortfolioTeaser() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo('[data-portfolio-teaser-text]', { y: 24, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: section, start: 'top 76%', once: true },
      })
      gsap.fromTo('[data-portfolio-card]', { y: 28, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: '[data-portfolio-grid]', start: 'top 82%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="home-portfolio-teaser"
      aria-labelledby="home-portfolio-title"
    >
      <div className="home-portfolio-topline">
        <span>03 / PORTFÓLIO & ACERVO 3D</span>
        <span>08 PROJETOS AUTORAIS · 07 EMPREENDIMENTOS ARCHVIZ · 29 MODELOS 3D INTERATIVOS</span>
      </div>

      <div className="home-showcase-wrap">
        {/* Cabeçalho + Placas de salto rápido */}
        <div className="home-showcase-header">
          <div className="home-portfolio-teaser-copy">
            <h2 id="home-portfolio-title" data-portfolio-teaser-text>
              <span>Arquitetura.</span>
              <em className="font-editorial">Visualização.</em>
              <span>Assets 3D.</span>
            </h2>
            <p data-portfolio-teaser-text>
              Do estudo de luz à marcenaria em close-up — explore os projetos completos do estúdio, o mural de renders e a biblioteca de blocos 3D interativos.
            </p>
          </div>

          <div className="home-showcase-stats" data-portfolio-teaser-text>
            <Link href="/portfolio#projetos" className="home-stat-card">
              <span className="home-stat-num">08</span>
              <strong className="home-stat-label">Projetos Autorais</strong>
              <span className="home-stat-Action">Ver projetos →</span>
            </Link>
            <Link href="/portfolio#galeria-renders" className="home-stat-card">
              <span className="home-stat-num">07</span>
              <strong className="home-stat-label">Empreendimentos ArchViz</strong>
              <span className="home-stat-Action">Abrir mural →</span>
            </Link>
            <Link href="/portfolio#assets-3d" className="home-stat-card home-stat-card--accent">
              <span className="home-stat-num">29</span>
              <strong className="home-stat-label">Modelos 3D (.GLB)</strong>
              <span className="home-stat-Action">Girar em 3D →</span>
            </Link>
          </div>
        </div>

        {/* Grid com os 5 Projetos Reais */}
        <div className="home-projects-grid" data-portfolio-grid>
          {HOME_PROJECTS.map((project, idx) => (
            <Link
              key={project.slug}
              href={project.href ?? `/portfolio#${project.slug}`}
              className={`home-project-card${project.featured ? ' home-project-card--featured' : ''}`}
              data-portfolio-card
            >
              <div className="home-project-card-media">
                <Image
                  src={project.coverUrl}
                  alt={`${project.title} — ${project.category} (${project.location})`}
                  fill
                  sizes={
                    project.featured
                      ? '(max-width: 1024px) 100vw, 60vw'
                      : '(max-width: 768px) 100vw, 38vw'
                  }
                  className="object-cover"
                  preload={idx === 0}
                />
                <div className="home-project-card-wash" aria-hidden="true" />
                <div className="home-project-card-top">
                  <span className="home-project-card-num">
                    <strong>{project.num}</strong> / 05
                  </span>
                  <span className="home-project-card-badge">
                    {project.category} · {project.year}
                  </span>
                </div>
                <div className="home-project-card-bottom">
                  <div>
                    <h3 className="home-project-card-title">{project.title}</h3>
                    <p className="home-project-card-loc">{project.location}</p>
                  </div>
                  <span className="home-project-card-cta" aria-hidden="true">
                    {project.href ? 'Ler dossiê completo ↗' : 'Abrir projeto ↗'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Vitrine de Destaque: 29 Modelos 3D Interativos */}
        <div className="home-assets-band">
          <div className="home-assets-band-head">
            <div>
              <span className="home-assets-band-kicker">
                BIBLIOTECA 3D INTERATIVA · 3DS MAX, SKETCHUP & ENSCAPE
              </span>
              <h3 className="home-assets-band-title">
                29 modelos 3D prontos para girar <em className="font-editorial">direto no navegador.</em>
              </h3>
            </div>
            <Link href="/portfolio#assets-3d" className="ameno-button ameno-button--primary">
              Explorar os 29 Modelos 3D <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="home-assets-band-grid">
            {HOME_ASSETS_PREVIEW.map((asset, index) => (
              <Link
                key={asset.name}
                href="/portfolio#assets-3d"
                className="home-asset-mini-card"
              >
                <div className="home-asset-mini-media">
                  <Image
                    src={asset.img}
                    alt={asset.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover"
                  />
                  <span className="home-asset-mini-badge">
                    #{String(index + 1).padStart(2, '0')} · 3D .GLB
                  </span>
                </div>
                <div className="home-asset-mini-info">
                  <strong>{asset.name}</strong>
                  <span>{asset.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
