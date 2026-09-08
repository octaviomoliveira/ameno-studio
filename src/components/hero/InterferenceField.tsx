'use client'

import { useEffect, useRef } from 'react'

type Point = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  decay: number
  ambient: boolean
}

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export default function InterferenceField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const pointer = { x: -1000, y: -1000, active: false }
    let points: Point[] = []
    let frame = 0
    let width = 0
    let height = 0

    const createPoints = () => {
      const count = coarsePointer ? 18 : 34
      points = Array.from({ length: count }, (_, index) => ({
        x: pseudoRandom(index + 4) * width,
        y: pseudoRandom(index + 19) * height,
        vx: (pseudoRandom(index + 41) - 0.5) * 0.05,
        vy: -0.015 - pseudoRandom(index + 73) * 0.035,
        size: 0.65 + pseudoRandom(index + 101) * 1.25,
        life: 0.16 + pseudoRandom(index + 137) * 0.2,
        decay: 0,
        ambient: true,
      }))
    }

    const addSpray = (x: number, y: number) => {
      for (let index = 0; index < 5; index += 1) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.08 + Math.random() * 0.34
        points.push({
          x: x + (Math.random() - 0.5) * 24,
          y: y + (Math.random() - 0.5) * 24,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.12,
          size: 0.8 + Math.random() * 2.5,
          life: 0.34 + Math.random() * 0.54,
          decay: 0.009 + Math.random() * 0.014,
          ambient: false,
        })
      }

      if (points.length > 150) points.splice(34, points.length - 150)
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = bounds.width
      height = bounds.height
      canvas.width = Math.max(1, Math.round(width * pixelRatio))
      canvas.height = Math.max(1, Math.round(height * pixelRatio))
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      createPoints()
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      for (let index = points.length - 1; index >= 0; index -= 1) {
        const point = points[index]
        point.x += point.vx
        point.y += point.vy
        if (!point.ambient) point.life -= point.decay

        if (!point.ambient && point.life <= 0) {
          points.splice(index, 1)
          continue
        }

        const alpha = point.ambient ? point.life : point.life * 0.5
        context.beginPath()
        context.fillStyle = `rgba(230, 59, 46, ${alpha})`
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2)
        context.fill()

        if (point.ambient && point.y < -8) point.y = height + 8
      }

      if (pointer.active && !coarsePointer && !reducedMotion) {
        const halo = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 42)
        halo.addColorStop(0, 'rgba(230, 59, 46, 0.12)')
        halo.addColorStop(1, 'rgba(230, 59, 46, 0)')
        context.fillStyle = halo
        context.fillRect(pointer.x - 42, pointer.y - 42, 84, 84)
      }

      if (!reducedMotion) frame = requestAnimationFrame(draw)
    }

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      const isInside = x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height

      pointer.x = x
      pointer.y = y
      pointer.active = isInside
      if (isInside && !coarsePointer && !reducedMotion) addSpray(x, y)
    }

    const onPointerLeave = () => {
      pointer.active = false
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    if (!coarsePointer && !reducedMotion) window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="interference-field" aria-hidden="true" />
}
