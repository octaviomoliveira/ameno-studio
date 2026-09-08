'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import GraffitiWall from './GraffitiWall'

const INTRO_STORAGE_KEY = 'ameno-intro-seen-v1'

export default function SiteIntro() {
  const pathname = usePathname()
  const enterButtonRef = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const dismiss = useCallback(() => {
    setLeaving((isAlreadyLeaving) => {
      if (isAlreadyLeaving) return isAlreadyLeaving

      window.sessionStorage.setItem(INTRO_STORAGE_KEY, 'true')
      window.setTimeout(() => {
        setVisible(false)
        setLeaving(false)
      }, 700)
      return true
    })
  }, [])

  useEffect(() => {
    if (pathname !== '/') return

    const forceIntro = new URLSearchParams(window.location.search).has('intro')
    const hasSeenIntro = window.sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true'

    const revealFrame = window.requestAnimationFrame(() => {
      if (forceIntro || !hasSeenIntro) setVisible(true)
    })

    return () => window.cancelAnimationFrame(revealFrame)
  }, [pathname])

  useEffect(() => {
    if (!visible) return

    const shell = document.querySelector<HTMLElement>('#site-shell')
    const previousOverflow = document.body.style.overflow
    shell?.setAttribute('inert', '')
    shell?.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = 'hidden'
    enterButtonRef.current?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      shell?.removeAttribute('inert')
      shell?.removeAttribute('aria-hidden')
      document.body.style.overflow = previousOverflow
    }
  }, [dismiss, visible])

  if (!visible || pathname !== '/') return null

  return (
    <div
      className={`site-intro${leaving ? ' is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-intro-title"
    >
      <GraffitiWall />
      <div className="site-intro-vignette" aria-hidden="true" />

      <button
        ref={enterButtonRef}
        type="button"
        className="site-intro-action"
        onClick={dismiss}
        aria-label="Entrar no ameno.studio"
      >
        <span className="site-intro-kicker">AMENO.STUDIO / CAPÍTULO 00</span>
        <span id="site-intro-title" className="site-intro-title">
          <span>DA IDEIA</span>
          <span>À <em>FORMA</em></span>
        </span>
        <span className="site-intro-hint">
          <i aria-hidden="true" />
          <span className="site-intro-hint-desktop">Mova para grafitar · clique para entrar</span>
          <span className="site-intro-hint-mobile">Toque para entrar</span>
          <i aria-hidden="true" />
        </span>
      </button>

      <Image
        src="/brand/symbol.svg"
        alt=""
        width={44}
        height={44}
        className="site-intro-symbol"
        aria-hidden="true"
      />
    </div>
  )
}
