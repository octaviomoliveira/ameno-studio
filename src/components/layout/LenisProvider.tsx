'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Mobile browser chrome resizes the viewport while scrolling. Avoid
    // recalculating all pinned scenes on every address-bar movement.
    ScrollTrigger.config({ ignoreMobileResize: true })
    const media = gsap.matchMedia()
    media.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({
        duration: 0.85,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        anchors: true,
      })
      const syncLock = () => {
        if (document.body.style.overflow === 'hidden') lenis.stop()
        else lenis.start()
      }
      const observer = new MutationObserver(syncLock)
      observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
      syncLock()

      // Conecta Lenis ao ScrollTrigger do GSAP
      lenis.on('scroll', ScrollTrigger.update)

      const onFrame = (time: number) => {
        lenis.raf(time * 1000)
      }
      gsap.ticker.add(onFrame)

      gsap.ticker.lagSmoothing(0)

      return () => {
        observer.disconnect()
        lenis.destroy()
        gsap.ticker.remove(onFrame)
      }
    })
    return () => media.revert()
  }, [])

  return <>{children}</>
}
