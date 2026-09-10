'use client'
import { useEffect, useRef } from 'react'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const coordsRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor || window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return

    let rafId: number | null = null
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let isVisible = false

    const render = () => {
      const dx = targetX - currentX
      const dy = targetY - currentY
      currentX += dx * 0.4
      currentY += dy * 0.4

      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`

      if (coordsRef.current) {
        coordsRef.current.textContent = `${String(Math.round(targetX)).padStart(4, '0')} · ${String(Math.round(targetY)).padStart(4, '0')}`
      }

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        rafId = requestAnimationFrame(render)
      } else {
        rafId = null
      }
    }

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      if (!isVisible) {
        isVisible = true
        currentX = targetX
        currentY = targetY
        cursor.classList.add('is-visible')
      }
      if (!rafId) {
        rafId = requestAnimationFrame(render)
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={cursorRef} aria-hidden="true" className="cursor fixed top-0 left-0 pointer-events-none z-[9999]"
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
