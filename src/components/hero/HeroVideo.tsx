'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Props = {
  videoSrc?: string
  touchVideoSrc?: string
  posterSrc: string
  alt?: string
}

export default function HeroVideo({ videoSrc, touchVideoSrc, posterSrc, alt = 'Cena de projeto ameno.studio' }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const media = gsap.matchMedia()
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      compact: '(max-width: 768px), (pointer: coarse)',
    }, (context) => {
      if (!context.conditions?.motion) return
      const compact = context.conditions.compact
      const layers = section.querySelectorAll<HTMLElement>('[data-hero-layer]')
      const actions = section.querySelector<HTMLElement>('[data-hero-actions]')
      const signature = section.querySelector<HTMLElement>('[data-hero-signature]')
      const video = videoRef.current
      const playhead = { progress: 0 }
      let disposed = false
      let unlockAttempted = false

      // Seek only after the previous frame is decoded. Text and video share
      // the same smoothed playhead, including native touch scrolling.
      const seek = () => {
        if (disposed || !video || video.seeking || video.readyState < 2 || !Number.isFinite(video.duration)) return
        const time = playhead.progress * Math.max(0, video.duration - 1 / 24)
        if (Math.abs(video.currentTime - time) > 1 / 48) video.currentTime = time
      }

      // Reveal complete identity and quick-jump CTAs right on entry
      gsap.fromTo(
        [...Array.from(layers), actions, signature],
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      )

      // Fit the complete story inside the distance travelled by the sticky frame.
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: compact ? 0.3 : 0.65,
          invalidateOnRefresh: true,
        },
      })
      timeline
        .to(playhead, { progress: 1, duration: 1, ease: 'none', onUpdate: seek }, 0)
        .to('[data-hero-media]', { scale: compact ? 1.025 : 1.045, duration: 1, ease: 'none' }, 0)
        .to('[data-hero-scroll]', { opacity: 0, duration: 0.15 }, 0)

      if (!video || !videoSrc) return
      const onReady = () => { video.dataset.ready = 'true'; seek() }
      const onError = () => { delete video.dataset.ready }
      // iOS may require a user gesture before it will decode scrubbed frames.
      const unlock = () => {
        if (unlockAttempted || disposed) return
        unlockAttempted = true
        void video.play().then(() => { if (!disposed) { video.pause(); seek() } }).catch(() => { unlockAttempted = false })
      }

      video.addEventListener('loadeddata', onReady)
      video.addEventListener('canplay', onReady)
      video.addEventListener('seeked', seek)
      video.addEventListener('error', onError)
      section.addEventListener('touchstart', unlock, { passive: true })
      window.addEventListener('ameno:intro-dismiss', unlock)
      const supportsWebm = video.canPlayType('video/webm; codecs="vp9"') !== ''
      video.src = touchVideoSrc && (compact || !supportsWebm) ? touchVideoSrc : videoSrc
      video.load()

      return () => {
        disposed = true
        video.removeEventListener('loadeddata', onReady)
        video.removeEventListener('canplay', onReady)
        video.removeEventListener('seeked', seek)
        video.removeEventListener('error', onError)
        section.removeEventListener('touchstart', unlock)
        window.removeEventListener('ameno:intro-dismiss', unlock)
        video.pause()
        video.removeAttribute('src')
        delete video.dataset.ready
        video.load()
      }
    }, section)

    return () => media.revert()
  }, [videoSrc, touchVideoSrc])

  return (
    <section ref={sectionRef} className="hero-video-section" aria-labelledby="hero-video-title">
      <div className="hero-video-sticky">
        <div data-hero-media className="hero-video-media">
          <Image src={posterSrc} alt={alt} fill preload sizes="100vw" className="object-cover" />
          {videoSrc && (
            <video ref={videoRef} muted playsInline preload="auto" aria-hidden="true" className="hero-video-el" />
          )}
          <div className="hero-video-wash" aria-hidden="true" />
        </div>

        <div className="hero-video-layers">
          <p className="hero-video-kicker">AMENO.STUDIO / RECIFE · BRASIL — ARCHVIZ · ASSETS 3D · PLUGINS</p>
          <h1 id="hero-video-title">
            <span data-hero-layer className="hero-video-layer">Arquitetura.</span>
            <span data-hero-layer className="hero-video-layer hero-video-layer--accent">
              <em className="font-editorial">Visualização.</em>
            </span>
            <span data-hero-layer className="hero-video-layer">Ferramentas.</span>
          </h1>

          <div data-hero-actions className="hero-video-actions">
            <Link href="/portfolio#projetos" className="ameno-button ameno-button--primary">
              Ver Portfólio · 05 Projetos <span aria-hidden="true">→</span>
            </Link>
            <Link href="/portfolio#assets-3d" className="ameno-button ameno-button--secondary">
              Biblioteca 3D · 29 Modelos <span aria-hidden="true">→</span>
            </Link>
            <Link href="/plugins" className="ameno-button ameno-button--secondary">
              Plugin Ameno Cotas <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div data-hero-signature className="hero-video-signature">
            <span>05 PROJETOS AUTORAIS · 22 RENDERS · 29 MODELOS .GLB · 01 PLUGIN 3DS MAX</span>
            <span>RECIFE · BRASIL</span>
          </div>
        </div>

        <div data-hero-scroll className="hero-video-scroll" aria-hidden="true">
          <span>ROLE PARA EXPLORAR</span><i />
        </div>
      </div>
    </section>
  )
}
