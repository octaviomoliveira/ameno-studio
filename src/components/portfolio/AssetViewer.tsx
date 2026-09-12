'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import Image from 'next/image'

type Props = {
  src: string        // caminho para o .glb
  fallbackImg: string
  label: string
  className?: string
}

export default function AssetViewer({ src, fallbackImg, label, className = '' }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded]   = useState(false)
  const [error, setError]     = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const container = canvasRef.current
    if (!container) return

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // ── Cena ──────────────────────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(0, 1.2, 3.5)

    // Luz ambiente + direcional cinza — visual flat sem textura
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(3, 5, 3)
    scene.add(dirLight)
    const fillLight = new THREE.DirectionalLight(0xcccccc, 0.3)
    fillLight.position.set(-3, 1, -2)
    scene.add(fillLight)

    // ── OrbitControls ─────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping  = true
    controls.dampingFactor  = 0.08
    controls.enableZoom     = false
    controls.enablePan      = false
    controls.autoRotate     = true
    controls.autoRotateSpeed = 0.6
    controls.minPolarAngle  = Math.PI / 4
    controls.maxPolarAngle  = Math.PI / 1.8

    // ── Material cinza ameno ──────────────────────────────────
    const grayMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.75,
      metalness: 0.05,
    })

    // ── Loader com Draco ─────────────────────────────────────
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      src,
      (gltf) => {
        const model = gltf.scene

        // Aplica material cinza em todos os meshes
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).material = grayMaterial
          }
        })

        // Centraliza e normaliza escala
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size   = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale  = 2.5 / maxDim
        model.scale.setScalar(scale)
        model.position.sub(center.multiplyScalar(scale))

        scene.add(model)
        setLoaded(true)
      },
      undefined,
      () => setError(true)
    )

    // ── Loop de renderização ──────────────────────────────────
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ───────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [src])

  if (error) {
    return (
      <div className={`asset-viewer-fallback ${className}`} aria-label={label}>
        <Image src={fallbackImg} alt={label} fill className="object-cover" sizes="(max-width: 768px) 90vw, 400px" />
        <span className="asset-viewer-label">{label}</span>
      </div>
    )
  }

  return (
    <div
      className={`asset-viewer ${className}`}
      aria-label={`Modelo 3D interativo — ${label}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Canvas Three.js */}
      <div ref={canvasRef} className="asset-viewer-canvas" />

      {/* Indicador de loading */}
      {!loaded && (
        <div className="asset-viewer-loading" aria-hidden="true">
          <span className="asset-viewer-loading-dot" />
          <span className="asset-viewer-loading-dot" style={{ animationDelay: '0.2s' }} />
          <span className="asset-viewer-loading-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      )}

      {/* Hint de interação */}
      <div
        className="asset-viewer-hint"
        aria-hidden="true"
        style={{ opacity: loaded && !hovered ? 1 : 0 }}
      >
        <span>Arraste para girar</span>
      </div>

      {/* Label */}
      <span className="asset-viewer-label">{label}</span>
    </div>
  )
}
