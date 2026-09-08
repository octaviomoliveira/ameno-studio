'use client'

import { useEffect, useRef } from 'react'

type VaporParticle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  decay: number
  ambient: boolean
}

const RED = '230, 59, 46'

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum)
}

export default function GraffitiWall() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const maskCanvas = document.createElement('canvas')
    const maskContext = maskCanvas.getContext('2d')
    if (!maskContext) return

    const symbol = new window.Image()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const autoReveal = coarsePointer || window.matchMedia('(max-width: 767px)').matches
    const pointer = { x: 0, y: 0, active: false }
    const vapor: VaporParticle[] = []
    let symbolReady = false
    let frame = 0
    let width = 0
    let height = 0
    let pixelRatio = 1
    let symbolSize = 0
    let symbolX = 0
    let symbolY = 0
    let lastTime = 0

    const addVapor = (x: number, y: number, amount: number, ambient = false) => {
      for (let index = 0; index < amount; index += 1) {
        vapor.push({
          x: x + randomBetween(-32, 32),
          y: y + randomBetween(-28, 28),
          vx: randomBetween(-0.22, 0.22),
          vy: randomBetween(-0.5, -0.08),
          size: randomBetween(0.7, ambient ? 2.3 : 3.5),
          life: randomBetween(0.36, 1),
          decay: ambient ? randomBetween(0.0007, 0.0016) : randomBetween(0.008, 0.018),
          ambient,
        })
      }
    }

    const sprayMask = (x: number, y: number, radius: number) => {
      const gradient = maskContext.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
      gradient.addColorStop(0.56, 'rgba(255, 255, 255, 0.72)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      maskContext.fillStyle = gradient
      maskContext.fillRect(x - radius, y - radius, radius * 2, radius * 2)

      for (let index = 0; index < 10; index += 1) {
        const angle = Math.random() * Math.PI * 2
        const distance = randomBetween(radius * 0.45, radius * 1.35)
        const dotSize = randomBetween(0.8, 3.8)
        maskContext.beginPath()
        maskContext.fillStyle = `rgba(255, 255, 255, ${randomBetween(0.16, 0.68)})`
        maskContext.arc(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, dotSize, 0, Math.PI * 2)
        maskContext.fill()
      }
    }

    const seedAmbientVapor = () => {
      vapor.length = 0
      for (let index = 0; index < (autoReveal ? 68 : 96); index += 1) {
        addVapor(
          width * 0.5 + randomBetween(-symbolSize * 0.48, symbolSize * 0.48),
          height * 0.48 + randomBetween(-symbolSize * 0.48, symbolSize * 0.48),
          1,
          true,
        )
      }
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = bounds.width
      height = bounds.height
      symbolSize = autoReveal
        ? Math.min(width * 1.1, height * 0.78)
        : Math.min(width * 0.78, height * 0.9)
      symbolX = (width - symbolSize) * 0.5
      symbolY = height * 0.48 - symbolSize * 0.5

      canvas.width = Math.max(1, Math.round(width * pixelRatio))
      canvas.height = Math.max(1, Math.round(height * pixelRatio))
      maskCanvas.width = canvas.width
      maskCanvas.height = canvas.height
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      maskContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      if (reducedMotion) {
        maskContext.fillStyle = '#ffffff'
        maskContext.fillRect(0, 0, width, height)
      } else {
        sprayMask(width * 0.5 - symbolSize * 0.34, height * 0.48, symbolSize * 0.1)
        sprayMask(width * 0.5 + symbolSize * 0.28, height * 0.48 + symbolSize * 0.24, symbolSize * 0.07)
      }

      seedAmbientVapor()
    }

    const paintSymbol = () => {
      if (!symbolReady) return

      context.save()
      context.drawImage(symbol, symbolX, symbolY, symbolSize, symbolSize)
      context.globalCompositeOperation = 'destination-in'
      context.drawImage(maskCanvas, 0, 0, width, height)
      context.globalCompositeOperation = 'source-in'
      const paintGradient = context.createLinearGradient(symbolX, symbolY, symbolX + symbolSize, symbolY + symbolSize)
      paintGradient.addColorStop(0, `rgba(${RED}, 0.18)`)
      paintGradient.addColorStop(0.48, `rgba(${RED}, 0.46)`)
      paintGradient.addColorStop(1, `rgba(${RED}, 0.24)`)
      context.fillStyle = paintGradient
      context.fillRect(symbolX, symbolY, symbolSize, symbolSize)
      context.restore()
    }

    const paintVapor = (time: number, delta: number) => {
      for (let index = vapor.length - 1; index >= 0; index -= 1) {
        const particle = vapor[index]
        particle.x += particle.vx * delta
        particle.y += particle.vy * delta
        particle.life -= particle.decay * delta

        if (particle.life <= 0) {
          if (particle.ambient) {
            particle.x = width * 0.5 + randomBetween(-symbolSize * 0.5, symbolSize * 0.5)
            particle.y = height * 0.48 + randomBetween(-symbolSize * 0.45, symbolSize * 0.45)
            particle.life = randomBetween(0.35, 0.8)
          } else {
            vapor.splice(index, 1)
            continue
          }
        }

        const pulse = 0.7 + Math.sin(time * 0.001 + index) * 0.3
        context.beginPath()
        context.fillStyle = `rgba(${RED}, ${Math.max(0, particle.life) * (particle.ambient ? 0.23 : 0.4) * pulse})`
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        context.fill()
      }
    }

    const draw = (time = 0) => {
      const delta = Math.min((time - lastTime) / 16.67 || 1, 2)
      lastTime = time
      context.clearRect(0, 0, width, height)

      if (autoReveal && !reducedMotion) {
        const angle = time * 0.0014 - Math.PI * 0.72
        for (let offset = 0; offset < 3; offset += 1) {
          const brushAngle = angle - offset * 0.42
          sprayMask(
            width * 0.5 + Math.cos(brushAngle) * symbolSize * 0.33,
            height * 0.48 + Math.sin(brushAngle) * symbolSize * 0.33,
            symbolSize * 0.095,
          )
        }
      }

      paintSymbol()
      paintVapor(time, delta)

      if (pointer.active && !coarsePointer) {
        context.beginPath()
        context.strokeStyle = `rgba(${RED}, 0.26)`
        context.lineWidth = 1
        context.arc(pointer.x, pointer.y, 20, 0, Math.PI * 2)
        context.stroke()
      }

      if (!reducedMotion) frame = window.requestAnimationFrame(draw)
    }

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      pointer.x = x
      pointer.y = y
      pointer.active = true

      if (!coarsePointer && !reducedMotion) {
        sprayMask(x, y, Math.max(42, symbolSize * 0.085))
        addVapor(x, y, 5)
        if (vapor.length > 180) vapor.splice(0, vapor.length - 180)
      }
    }

    const onPointerLeave = () => {
      pointer.active = false
    }

    symbol.addEventListener('load', () => {
      symbolReady = true
      if (reducedMotion) draw()
    })
    symbol.src = '/brand/symbol.svg'

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <div className="graffiti-wall" aria-hidden="true">
      <div className="graffiti-wall-ghost" />
      <canvas ref={canvasRef} className="graffiti-wall-canvas" />
      <svg className="graffiti-wall-cotas" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
        <g>
          <line x1="255" y1="92" x2="745" y2="92" />
          <line x1="255" y1="77" x2="255" y2="108" />
          <line x1="745" y1="77" x2="745" y2="108" />
          <text x="500" y="78" textAnchor="middle">5.40 m</text>
        </g>
        <g>
          <line x1="830" y1="175" x2="830" y2="525" />
          <line x1="814" y1="175" x2="846" y2="175" />
          <line x1="814" y1="525" x2="846" y2="525" />
          <text x="850" y="350" transform="rotate(90 850 350)" textAnchor="middle">3.60 m</text>
        </g>
        <g>
          <line x1="555" y1="350" x2="785" y2="208" />
          <line x1="548" y1="338" x2="562" y2="362" />
          <line x1="778" y1="196" x2="792" y2="220" />
          <text x="686" y="264" transform="rotate(-31 686 264)" textAnchor="middle">R 1.80</text>
        </g>
        <g>
          <line x1="220" y1="615" x2="780" y2="615" />
          <line x1="220" y1="599" x2="220" y2="631" />
          <line x1="780" y1="599" x2="780" y2="631" />
          <text x="500" y="642" textAnchor="middle">Ø 4.20 m / EIXO 00</text>
        </g>
      </svg>
    </div>
  )
}
