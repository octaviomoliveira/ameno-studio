'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const coordsRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let mouseX = 0, mouseY = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.08,
        ease: 'none',
      })

      if (coordsRef.current) {
        coordsRef.current.textContent =
          `${String(Math.round(mouseX)).padStart(4, '0')} · ${String(Math.round(mouseY)).padStart(4, '0')}`
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div ref={cursorRef} className="cursor fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'difference' }}>
      {/* Crosshair */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-0 h-0">
          <div className="absolute w-px h-4 bg-white left-0 -top-2" />
          <div className="absolute h-px w-4 bg-white -left-2 top-0" />
        </div>
      </div>
      {/* Coordenadas */}
      <span
        ref={coordsRef}
        className="absolute top-4 left-3 text-[9px] tracking-widest off-white font-mono whitespace-nowrap"
        style={{ color: '#e8e8e0', mixBlendMode: 'normal' }}
      >
        0000 · 0000
      </span>
    </div>
  )
}
