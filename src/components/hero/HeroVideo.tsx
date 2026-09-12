'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LAYERS = ['Arquitetura.', 'Visualização.', 'Ferramentas.']

type Props = {
  videoSrc?: string
  posterSrc: string
  alt?: string
}

export default function HeroVideo({ videoSrc, posterSrc, alt = 'Cena de projeto ameno.studio' }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const media = gsap.matchMedia()
    media.add('(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const layers = section.querySelectorAll<HTMLElement>('[data-hero-layer]')
      const signature = section.querySelector('[data-hero-signature]')
      gsap.set([...Array.from(layers).slice(1), signature], { autoAlpha: 0, y: 24 })

      // Fit the complete story inside the distance travelled by the sticky frame.
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      })
      timeline
        .to('[data-hero-media]', { scale: 1.06, duration: 1, ease: 'none' }, 0)
        .to(layers[1], { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.12)
        .to(layers[2], { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.4)
        .to(signature, { autoAlpha: 1, y: 0, duration: 0.18 }, 0.7)
        .to('[data-hero-scroll]', { opacity: 0, duration: 0.12 }, 0)

      const video = videoRef.current
      if (!video || !videoSrc) return

      let targetTime = 0
      const seek = () => {
        if (!Number.isFinite(video.duration) || video.seeking || video.readyState < 1) return
        const time = Math.min(targetTime, Math.max(0, video.duration - 0.05))
        if (Math.abs(video.currentTime - time) > 0.04) video.currentTime = time
      }
      const sync = (progress: number) => {
        if (!Number.isFinite(video.duration)) return
        targetTime = progress * video.duration
        seek()
      }
      const videoTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: self => sync(self.progress),
        onRefresh: self => sync(self.progress),
      })
      const onMetadata = () => sync(videoTrigger.progress)
      const onReady = () => { video.dataset.ready = 'true' }
      const onError = () => { delete video.dataset.ready }

      video.addEventListener('loadedmetadata', onMetadata)
      video.addEventListener('loadeddata', onReady)
      video.addEventListener('seeked', seek)
      video.addEventListener('error', onError)
      video.src = videoSrc
      video.load()

      return () => {
        video.removeEventListener('loadedmetadata', onMetadata)
        video.removeEventListener('loadeddata', onReady)
        video.removeEventListener('seeked', seek)
        video.removeEventListener('error', onError)
        video.pause()
        video.removeAttribute('src')
        delete video.dataset.ready
        video.load()
      }
    }, section)

    return () => media.revert()
  }, [videoSrc])

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
          <p className="hero-video-kicker">AMENO.STUDIO / RECIFE · BRASIL</p>
          <h1 id="hero-video-title">
            {LAYERS.map(text => <span key={text} data-hero-layer className="hero-video-layer">{text}</span>)}
          </h1>
          <div data-hero-signature className="hero-video-signature">
            <span>ameno.studio</span>
            <span>Recife · Brasil</span>
          </div>
        </div>

        <div data-hero-scroll className="hero-video-scroll" aria-hidden="true">
          <span>ROLE</span><i />
        </div>
      </div>
    </section>
  )
}
