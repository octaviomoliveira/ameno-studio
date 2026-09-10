'use client'

import { useEffect, useRef } from 'react'

type Cota = {
  x: number
  y: number
  baseLength: number
  direction: 'h' | 'v'
  baseValue: number
}

const VIEWBOX_WIDTH = 1000
const VIEWBOX_HEIGHT = 700

const COTAS: Cota[] = [
  { x: 0.12, y: 0.24, baseLength: 150, direction: 'h', baseValue: 3.45 },
  { x: 0.72, y: 0.12, baseLength: 118, direction: 'h', baseValue: 1.20 },
  { x: 0.85, y: 0.35, baseLength: 132, direction: 'v', baseValue: 2.80 },
  { x: 0.05, y: 0.55, baseLength: 98, direction: 'v', baseValue: 1.20 },
  { x: 0.45, y: 0.80, baseLength: 176, direction: 'h', baseValue: 4.80 },
  { x: 0.65, y: 0.65, baseLength: 108, direction: 'h', baseValue: 2.10 },
  { x: 0.25, y: 0.70, baseLength: 88, direction: 'v', baseValue: 0.90 },
  { x: 0.88, y: 0.72, baseLength: 128, direction: 'h', baseValue: 3.45 },
]

function geometry(cota: Cota, scale = 1) {
  const cx = cota.x * VIEWBOX_WIDTH
  const cy = cota.y * VIEWBOX_HEIGHT
  const length = cota.baseLength * scale

  if (cota.direction === 'h') {
    return {
      line: { x1: cx - length / 2, y1: cy, x2: cx + length / 2, y2: cy },
      arrow1: { x1: cx - length / 2 + 10, y1: cy - 5, x2: cx - length / 2, y2: cy },
      arrow2: { x1: cx + length / 2 - 10, y1: cy - 5, x2: cx + length / 2, y2: cy },
      text: { x: cx, y: cy - 10 },
    }
  }

  return {
    line: { x1: cx, y1: cy - length / 2, x2: cx, y2: cy + length / 2 },
    arrow1: { x1: cx - 5, y1: cy - length / 2 + 10, x2: cx, y2: cy - length / 2 },
    arrow2: { x1: cx - 5, y1: cy + length / 2 - 10, x2: cx, y2: cy + length / 2 },
    text: { x: cx + 11, y: cy },
  }
}

function setLine(line: SVGLineElement | null, values: { x1: number; y1: number; x2: number; y2: number }) {
  if (!line) return
  line.setAttribute('x1', String(values.x1))
  line.setAttribute('y1', String(values.y1))
  line.setAttribute('x2', String(values.x2))
  line.setAttribute('y2', String(values.y2))
}

export default function CotasInterativas() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (reducedMotion || coarsePointer) return

    // Cache element lookups once on mount — eliminates 32 querySelector calls per frame
    const elements = COTAS.map((_, index) => {
      const group = svg.querySelector(`[data-cota="${index}"]`) as SVGGElement | null
      return {
        group,
        line: group?.querySelector('.cota-line') as SVGLineElement | null,
        arrow1: group?.querySelector('.arrow1') as SVGLineElement | null,
        arrow2: group?.querySelector('.arrow2') as SVGLineElement | null,
        text: group?.querySelector('.cota-text') as SVGTextElement | null,
      }
    })

    let rafId: number | null = null
    let isIntersecting = false
    const mouse = { x: 0.5, y: 0.5 }

    const updateCotas = () => {
      elements.forEach(({ group, line, arrow1, arrow2, text }, index) => {
        if (!group) return
        const cota = COTAS[index]
        const distance = Math.hypot(mouse.x - cota.x, mouse.y - cota.y)
        const influence = Math.max(0, 1 - distance / 0.52)
        const values = geometry(cota, 1 + influence * 0.72)

        setLine(line, values.line)
        setLine(arrow1, values.arrow1)
        setLine(arrow2, values.arrow2)
        if (text) {
          text.setAttribute('x', String(values.text.x))
          text.setAttribute('y', String(values.text.y))
          text.textContent = `${(cota.baseValue * (1 + influence * 0.72)).toFixed(2)}m`
        }
        group.style.opacity = String(0.26 + influence * 0.54)
      })
      rafId = null
    }

    const scheduleUpdate = () => {
      if (!isIntersecting || rafId !== null) return
      if (document.documentElement.hasAttribute('data-intro-active')) return
      rafId = requestAnimationFrame(updateCotas)
    }

    const onMouse = (event: MouseEvent) => {
      if (!isIntersecting) return
      const bounds = svg.getBoundingClientRect()
      mouse.x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
      mouse.y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
      scheduleUpdate()
    }

    const onScroll = () => {
      if (!isIntersecting) return
      const progress = Math.min(1, window.scrollY / Math.max(1, window.innerHeight))
      svg.style.transform = `translate3d(0, ${progress * -72}px, 0)`
      svg.style.opacity = String(0.24 - progress * 0.1)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting
        if (isIntersecting) scheduleUpdate()
      },
      { threshold: 0.05 }
    )
    observer.observe(svg)

    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    scheduleUpdate()

    return () => {
      observer.disconnect()
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      className="cotas-svg absolute inset-0 z-[1] h-full w-full pointer-events-none"
    >
      {COTAS.map((cota, index) => {
        const values = geometry(cota)
        return (
          <g key={index} data-cota={index} className="cota-group" style={{ opacity: 0.3 }}>
            <line className="cota-line" {...values.line} />
            <line className="arrow1" {...values.arrow1} />
            <line className="arrow2" {...values.arrow2} />
            <text
              className="cota-text"
              x={values.text.x}
              y={values.text.y}
              fill="white"
              fontSize="12"
              fontFamily="monospace"
              textAnchor={cota.direction === 'h' ? 'middle' : 'start'}
              dominantBaseline="middle"
            >
              {cota.baseValue.toFixed(2)}m
            </text>
          </g>
        )
      })}
    </svg>
  )
}
