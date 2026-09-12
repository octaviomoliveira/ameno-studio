'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Layer = {
  text: string
  sub?: string
  progress: number // 0–1 quando aparece no scroll
}

const LAYERS: Layer[] = [
  { text: 'Arquitetura.', progress: 0 },
  { text: 'Visualização.', progress: 0.28 },
  { text: 'Ferramentas.', progress: 0.56 },
  { text: 'ameno.studio', sub: 'Recife · Brasil', progress: 0.84 },
]

type Props = {
  videoSrc?: string   // /hero/hero.webm — se existir
  posterSrc: string   // /hero/hero-poster.jpg — sempre necessário
  alt?: string
}

export default function HeroVideo({ videoSrc, posterSrc, alt = 'Cena de projeto ameno.studio' }: Props) {
  const sectionRef  = useRef<HTMLElement>(null)
  const videoRef    = useRef<HTMLVideoElement>(null)
  const layersRef   = useRef<(HTMLDivElement | null)[]>([])
  const subtitlesRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      // ── Parallax no poster/video ──────────────────────────────
      gsap.to('[data-hero-media]', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
      })

      if (!reduced) {
        // ── Texto em camadas aparece conforme o scroll ─────────
        LAYERS.forEach((layer, i) => {
          const el = layersRef.current[i]
          const sub = subtitlesRef.current[i]
          if (!el) return

          const startProgress = layer.progress
          const endProgress = Math.min(layer.progress + 0.18, 1)

          gsap.fromTo(
            el,
            { yPercent: 20, opacity: 0, filter: 'blur(8px)' },
            {
              yPercent: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: `${startProgress * 100}% top`,
                end: `${endProgress * 100}% top`,
                scrub: 0.6,
              },
            }
          )

          // subtítulo entra um pouco depois
          if (sub) {
            gsap.fromTo(
              sub,
              { opacity: 0, y: 8 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: section,
                  start: `${(startProgress + 0.1) * 100}% top`,
                  end: `${(endProgress + 0.1) * 100}% top`,
                  scrub: 0.5,
                },
              }
            )
          }
        })

        // ── Sincroniza currentTime do vídeo com scroll ─────────
        const video = videoRef.current
        if (video && videoSrc) {
          video.pause()
          ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              if (!video.duration) return
              const target = self.progress * video.duration
              if (Math.abs(video.currentTime - target) > 0.05) {
                video.currentTime = target
              }
            },
          })
        }
      }

      // ── Scroll indicator fade-out ─────────────────────────────
      gsap.to('[data-hero-scroll]', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: '15% top', scrub: true },
      })
    }, section)

    return () => ctx.revert()
  }, [videoSrc])

  return (
    <section
      ref={sectionRef}
      className="hero-video-section"
      aria-label="Introdução — ameno.studio"
      // deixa altura de 200vh para o scroll cinemático ter espaço
      style={{ height: '200vh' }}
    >
      {/* Mídia de fundo — sticky */}
      <div className="hero-video-sticky">
        <div data-hero-media className="hero-video-media">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="hero-video-el"
            />
          ) : (
            <Image
              src={posterSrc}
              alt={alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="hero-video-wash" aria-hidden="true" />
        </div>

        {/* Camadas de texto */}
        <div className="hero-video-layers" aria-label="Sobre o estúdio">
          {LAYERS.map((layer, i) => {
            const isSignature = i === LAYERS.length - 1
            return (
              <div
                key={layer.text}
                ref={el => { layersRef.current[i] = el }}
                className={`hero-video-layer ${isSignature ? 'hero-video-layer--signature' : ''}`}
                aria-hidden="true"
              >
                <span className="hero-video-layer-text">
                  {layer.text}
                </span>
                {layer.sub && (
                  <span
                    ref={el => { subtitlesRef.current[i] = el }}
                    className="hero-video-layer-sub"
                  >
                    {layer.sub}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Acessibilidade — texto visível a leitores de tela */}
        <p className="sr-only">
          ameno.studio — Arquitetura, Visualização e Ferramentas. Recife, Brasil.
        </p>

        {/* Indicador de scroll */}
        <div data-hero-scroll className="hero-video-scroll" aria-hidden="true">
          <span>ROLE</span>
          <i />
        </div>
      </div>
    </section>
  )
}
