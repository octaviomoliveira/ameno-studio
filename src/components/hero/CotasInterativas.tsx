'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

type Cota = {
  x: number
  y: number
  baseLength: number
  direction: 'h' | 'v'
  baseValue: number
}

const COTAS: Cota[] = [
  { x: 0.12, y: 0.18, baseLength: 160, direction: 'h', baseValue: 3.45 },
  { x: 0.72, y: 0.12, baseLength: 120, direction: 'h', baseValue: 1.20 },
  { x: 0.85, y: 0.35, baseLength: 140, direction: 'v', baseValue: 2.80 },
  { x: 0.05, y: 0.55, baseLength: 100, direction: 'v', baseValue: 1.20 },
  { x: 0.45, y: 0.80, baseLength: 180, direction: 'h', baseValue: 4.80 },
  { x: 0.65, y: 0.65, baseLength: 110, direction: 'h', baseValue: 2.10 },
  { x: 0.25, y: 0.70, baseLength: 90,  direction: 'v', baseValue: 0.90 },
  { x: 0.88, y: 0.72, baseLength: 130, direction: 'h', baseValue: 3.45 },
]

export default function CotasInterativas() {
  const svgRef = useRef<SVGSVGElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }

    window.addEventListener('mousemove', onMouse)

    // Animação frame-a-frame
    let raf: number
    const tick = () => {
      const { x: mx, y: my } = mouseRef.current
      const w = window.innerWidth
      const h = window.innerHeight

      COTAS.forEach((cota, i) => {
        const el = svg.querySelector(`[data-cota="${i}"]`) as SVGGElement
        if (!el) return

        const dx = mx - cota.x
        const dy = my - cota.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const influence = Math.max(0, 1 - dist / 0.5)
        const scale = 1 + influence * 0.8
        const len = cota.baseLength * scale
        const val = (cota.baseValue * scale).toFixed(2)

        const cx = cota.x * w
        const cy = cota.y * h

        if (cota.direction === 'h') {
          const line = el.querySelector('.cota-line') as SVGLineElement
          const arrow1 = el.querySelector('.arrow1') as SVGLineElement
          const arrow2 = el.querySelector('.arrow2') as SVGLineElement
          const text = el.querySelector('.cota-text') as SVGTextElement

          if (line) {
            line.setAttribute('x1', String(cx - len / 2))
            line.setAttribute('y1', String(cy))
            line.setAttribute('x2', String(cx + len / 2))
            line.setAttribute('y2', String(cy))
          }
          if (arrow1) {
            arrow1.setAttribute('x1', String(cx - len / 2 + 8))
            arrow1.setAttribute('y1', String(cy - 5))
            arrow1.setAttribute('x2', String(cx - len / 2))
            arrow1.setAttribute('y2', String(cy))
          }
          if (arrow2) {
            arrow2.setAttribute('x1', String(cx + len / 2 - 8))
            arrow2.setAttribute('y1', String(cy - 5))
            arrow2.setAttribute('x2', String(cx + len / 2))
            arrow2.setAttribute('y2', String(cy))
          }
          if (text) {
            text.setAttribute('x', String(cx))
            text.setAttribute('y', String(cy - 8))
            text.textContent = `${val}m`
          }
        } else {
          const line = el.querySelector('.cota-line') as SVGLineElement
          const arrow1 = el.querySelector('.arrow1') as SVGLineElement
          const arrow2 = el.querySelector('.arrow2') as SVGLineElement
          const text = el.querySelector('.cota-text') as SVGTextElement

          if (line) {
            line.setAttribute('x1', String(cx))
            line.setAttribute('y1', String(cy - len / 2))
            line.setAttribute('x2', String(cx))
            line.setAttribute('y2', String(cy + len / 2))
          }
          if (arrow1) {
            arrow1.setAttribute('x1', String(cx - 5))
            arrow1.setAttribute('y1', String(cy - len / 2 + 8))
            arrow1.setAttribute('x2', String(cx))
            arrow1.setAttribute('y2', String(cy - len / 2))
          }
          if (arrow2) {
            arrow2.setAttribute('x1', String(cx - 5))
            arrow2.setAttribute('y1', String(cy + len / 2 - 8))
            arrow2.setAttribute('x2', String(cx))
            arrow2.setAttribute('y2', String(cy + len / 2))
          }
          if (text) {
            text.setAttribute('x', String(cx + 8))
            text.setAttribute('y', String(cy))
            text.textContent = `${val}m`
          }
        }

        // Opacidade baseada na distância
        const opacity = 0.15 + influence * 0.55
        el.style.opacity = String(opacity)
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouse)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {COTAS.map((cota, i) => (
        <g key={i} data-cota={i} style={{ opacity: 0.15 }}>
          <line className="cota-line" stroke="white" strokeWidth="0.5" x1="0" y1="0" x2="0" y2="0" />
          <line className="arrow1" stroke="white" strokeWidth="0.5" x1="0" y1="0" x2="0" y2="0" />
          <line className="arrow2" stroke="white" strokeWidth="0.5" x1="0" y1="0" x2="0" y2="0" />
          <text
            className="cota-text"
            fill="white"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {cota.baseValue.toFixed(2)}m
          </text>
        </g>
      ))}
    </svg>
  )
}
