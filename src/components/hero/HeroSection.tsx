'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import CotasInterativas from './CotasInterativas'

const WORDS = ['arquitetura.', 'visualização.', 'ferramentas.']

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wordsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(wordsRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col justify-center min-h-screen px-6 overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >
      {/* Cotas interativas */}
      <CotasInterativas />

      {/* Texto hero */}
      <div className="relative z-10">
        {WORDS.map((word, i) => (
          <div
            key={word}
            ref={el => { if (el) wordsRef.current[i] = el }}
            className="text-display overflow-hidden"
          >
            <span style={{ color: '#ffffff' }}>{word}</span>
          </div>
        ))}
      </div>

      {/* ameno.studio centralizado embaixo */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-xs tracking-[0.4em] uppercase"
        style={{ color: '#666666' }}
      >
        ameno.studio
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 right-6 z-10 flex flex-col items-center gap-2">
        <div
          className="w-px h-12 origin-top"
          style={{
            background: 'linear-gradient(to bottom, #E63B2E, transparent)',
            animation: 'scrollPulse 2s ease-in-out infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.3); }
        }
      `}</style>
    </section>
  )
}
