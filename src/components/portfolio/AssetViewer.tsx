'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import Image from 'next/image'
import styles from './AssetViewer.module.css'

type Props = { src: string; fallbackImg: string; label: string; className?: string }

function disposeMaterials(materials: Set<THREE.Material>) {
  const textures = new Set<THREE.Texture>()
  materials.forEach((material) => {
    Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) textures.add(value) })
    material.dispose()
  })
  textures.forEach((texture) => texture.dispose())
}

function disposeModel(model: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      geometries.add(child.geometry)
      const meshMaterials = Array.isArray(child.material) ? child.material : [child.material]
      meshMaterials.forEach((material) => materials.add(material))
    }
  })
  geometries.forEach((geometry) => geometry.dispose())
  disposeMaterials(materials)
}

export default function AssetViewer(props: Props) {
  return <AssetScene key={props.src} {...props} />
}

function AssetScene({ src, fallbackImg, label, className = '' }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [rotating, setRotating] = useState(() => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const container = canvasRef.current
    if (!container) return
    let disposed = false
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      // Keep the image fallback available when WebGL is unavailable.
      queueMicrotask(() => { if (!disposed) setStatus('error') })
      return () => { disposed = true }
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0.7, 4.2)
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
    keyLight.position.set(3, 5, 3)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xcccccc, 0.3)
    fillLight.position.set(-3, 1, -2)
    scene.add(fillLight)
    const controls = new OrbitControls(camera, renderer.domElement)
    controlsRef.current = controls
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enableZoom = false
    controls.enablePan = false
    controls.autoRotateSpeed = 0.6
    controls.minPolarAngle = Math.PI / 4
    controls.maxPolarAngle = Math.PI / 1.8
    const grayMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.75, metalness: 0.05 })
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    const loader = new GLTFLoader().setDRACOLoader(dracoLoader)
    let model: THREE.Object3D | null = null
    let frame = 0
    let visible = true
    let lastTime = 0
    const animate = (time: number) => {
      if (disposed || !visible || document.hidden) { frame = 0; return }
      controls.update(lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0)
      lastTime = time
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    const updatePlayback = () => {
      if (disposed) return
      if (visible && !document.hidden) {
        if (!frame) { lastTime = 0; frame = requestAnimationFrame(animate) }
      } else { cancelAnimationFrame(frame); frame = 0 }
    }
    const resize = () => {
      if (disposed) return
      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      updatePlayback()
    })
    visibilityObserver.observe(container)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = () => { if (motion.matches) setRotating(false) }
    motion.addEventListener('change', onMotionChange)
    document.addEventListener('visibilitychange', updatePlayback)
    const teardown = () => {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      motion.removeEventListener('change', onMotionChange)
      document.removeEventListener('visibilitychange', updatePlayback)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      controls.dispose()
      controlsRef.current = null
      dracoLoader.dispose()
      if (model) disposeModel(model)
      else grayMaterial.dispose()
      scene.clear()
      renderer.dispose()
      renderer.domElement.remove()
    }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      if (!disposed) { setStatus('error'); teardown() }
    }
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    resize()
    updatePlayback()
    loader.load(src, (gltf) => {
      if (disposed) { disposeModel(gltf.scene); return }
      model = gltf.scene
      const originals = new Set<THREE.Material>()
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material) => originals.add(material))
          child.material = grayMaterial
        }
      })
      disposeMaterials(originals)
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDimension = Math.max(size.x, size.y, size.z)
      if (!Number.isFinite(maxDimension) || maxDimension <= 0) { setStatus('error'); teardown(); return }
      const scale = 2.4 / maxDimension
      model.scale.setScalar(scale)
      model.position.sub(center.multiplyScalar(scale))
      scene.add(model)
      setStatus('ready')
    }, undefined, () => {
      if (!disposed) { setStatus('error'); teardown() }
    })
    return teardown
  }, [src])

  useEffect(() => { if (controlsRef.current) controlsRef.current.autoRotate = rotating }, [rotating])

  const rotate = (direction: number) => {
    const controls = controlsRef.current
    if (!controls) return
    setRotating(false)
    controls.autoRotate = false
    controls.rotateLeft(direction * Math.PI / 12)
    controls.update()
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      rotate(event.key === 'ArrowLeft' ? 1 : -1)
    }
  }

  return (
    <div className={`${styles.viewer} ${className}`} role="group" aria-label={`Modelo 3D interativo — ${label}`}>
      <div ref={canvasRef} className={styles.canvas} tabIndex={status === 'ready' ? 0 : -1}
        role="group" aria-label="Arraste ou use as setas esquerda e direita para girar o modelo" onKeyDown={handleKeyDown} />
      {status === 'loading' && <div className={styles.loading} role="status"><span className={styles.loadingMark} aria-hidden="true" />Carregando modelo 3D</div>}
      {status === 'error' && <div className={styles.fallback}>
        <Image src={fallbackImg} alt="Imagem de referência de arquitetura" fill className="object-cover" sizes="(max-width: 767px) 90vw, 55vw" />
        <p>Visualização 3D indisponível<span>Imagem de referência</span></p>
      </div>}
      {status === 'ready' && <>
        <span className={styles.label}>{label}</span>
        <div className={styles.toolbar}>
          <button type="button" onClick={() => rotate(1)} aria-label="Girar modelo para a esquerda">←</button>
          <button type="button" onClick={() => setRotating((value) => !value)} aria-pressed={rotating}>{rotating ? 'Pausar giro' : 'Girar modelo'}</button>
          <button type="button" onClick={() => rotate(-1)} aria-label="Girar modelo para a direita">→</button>
        </div>
      </>}
    </div>
  )
}
