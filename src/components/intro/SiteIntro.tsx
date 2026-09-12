'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import GraffitiWall from './GraffitiWall'

const INTRO_STORAGE_KEY = 'ameno-intro-seen-v1'
let introSeenInMemory = false

export default function SiteIntro() {
  const pathname = usePathname()
  return pathname === '/' ? <HomeIntro /> : null
}

function HomeIntro() {
  const enterButtonRef = useRef<HTMLButtonElement>(null)
  const leaveTimerRef = useRef<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const dismiss = useCallback(() => {
    if (leaveTimerRef.current !== null) return

    introSeenInMemory = true
    try {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, 'true')
    } catch {
      // The in-memory flag still permits entering when browser storage is blocked.
    }
    setLeaving(true)
    document.documentElement.removeAttribute('data-intro-active')
    window.dispatchEvent(new CustomEvent('ameno:intro-dismiss'))

    leaveTimerRef.current = window.setTimeout(() => {
      leaveTimerRef.current = null
      setVisible(false)
      setLeaving(false)
    }, 700)
  }, [])

  useEffect(() => {
    const forceIntro = new URLSearchParams(window.location.search).has('intro')
    let hasSeenIntro = introSeenInMemory
    try {
      hasSeenIntro ||= window.sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true'
    } catch {
      // Session storage can be unavailable in restricted browsing contexts.
    }

    let frame: number | undefined
    if (forceIntro || !hasSeenIntro) {
      document.documentElement.setAttribute('data-intro-active', 'true')
      frame = window.requestAnimationFrame(() => setVisible(true))
    } else {
      document.documentElement.removeAttribute('data-intro-active')
    }

    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      if (leaveTimerRef.current !== null) window.clearTimeout(leaveTimerRef.current)
      document.documentElement.removeAttribute('data-intro-active')
    }
  }, [])

  useEffect(() => {
    if (!visible) return

    const shell = document.querySelector<HTMLElement>('#site-shell')
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const wasInert = shell?.hasAttribute('inert') ?? false
    const previousAriaHidden = shell?.getAttribute('aria-hidden')
    shell?.setAttribute('inert', '')
    shell?.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = 'hidden'
    enterButtonRef.current?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        dismiss()
      } else if (event.key === 'Tab') {
        event.preventDefault()
        enterButtonRef.current?.focus({ preventScroll: true })
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (!wasInert) shell?.removeAttribute('inert')
      if (previousAriaHidden == null) shell?.removeAttribute('aria-hidden')
      else shell?.setAttribute('aria-hidden', previousAriaHidden)
      document.body.style.overflow = previousOverflow
      const focusTarget = previousFocus?.isConnected && previousFocus !== document.body
        ? previousFocus
        : shell?.querySelector<HTMLElement>('.site-navbar a[href="/"]')
      focusTarget?.focus({ preventScroll: true })
    }
  }, [dismiss, visible])

  if (!visible) return null

  return (
    <div
      className={`site-intro${leaving ? ' is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-intro-title"
      data-lenis-prevent
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
