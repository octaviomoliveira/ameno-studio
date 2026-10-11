'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LAYERS = ['Arquitetura.', 'Visualização.', 'Ferramentas.']

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
      const signature = section.querySelector('[data-hero-signature]')
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
      gsap.set([...Array.from(layers).slice(1), signature], { autoAlpha: 0, y: 24 })

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
        .to(layers[1], { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power1.out' }, 0.12)
        .to(layers[2], { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power1.out' }, 0.38)
        .to(signature, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power1.out' }, 0.7)
        .to('[data-hero-scroll]', { opacity: 0, duration: 0.12 }, 0)

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
