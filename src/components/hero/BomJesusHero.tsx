'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './BomJesusHero.module.css'

const DESKTOP_SCRUB_SRC = '/experiences/bom-jesus/media/scroll-v9/bom-jesus-scroll-v9-desktop.mp4'
const MOBILE_SCRUB_SRC = '/experiences/bom-jesus/media/scroll-v9/bom-jesus-scroll-v9-mobile.mp4'
const START_POSTER_SRC = '/experiences/bom-jesus/media/scroll-v9/bom-jesus-scroll-v9-start.webp'
const START_POSTER_MOBILE_SRC = '/experiences/bom-jesus/media/scroll-v9/bom-jesus-scroll-v9-start-mobile.webp'
const CABIN_IFRAME_SRC = '/experiences/bom-jesus/index.html?v=topaz-r036-20261109'

const CHAPTERS = [
  { step: '01 / 04 · CABINE PPF', title: 'Chegada · Porsche Taycan no Box 03' },
  { step: '02 / 04 · AUTOMAÇÃO LUMÍNICA', title: 'Onda de dimerização & ignição 100% LED' },
  { step: '03 / 04 · BOX 03 & ACERVO', title: 'Órbita 180° · Porsche Taycan & Senna' },
  { step: '04 / 04 · VISÃO GERAL', title: 'Abertura da cabine interativa 4K' },
] as const

export default function BomJesusHero() {
  const trackRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [overview, setOverview] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [introVisible, setIntroVisible] = useState(true)
  const [handoffActive, setHandoffActive] = useState(false)
  const [iframeActive, setIframeActive] = useState(false)
  const [atStart, setAtStart] = useState(true)
  const [chapterIdx, setChapterIdx] = useState(0)

  const jumpToInteractive = useCallback((triggerExplore: boolean) => {
    setIframeActive(true)
    const track = trackRef.current
    if (track && !reducedMotion) {
      const rect = track.getBoundingClientRect()
      const trackTop = window.scrollY + rect.top
      const maxScroll = Math.max(0, track.offsetHeight - window.innerHeight)
      const targetY = trackTop + maxScroll * 0.96
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }
    if (triggerExplore) {
      const sendExplore = () => {
        frameRef.current?.contentWindow?.postMessage({ type: 'ameno:explore' }, window.location.origin)
      }
      if (handoffActive || reducedMotion) {
        sendExplore()
      } else {
        window.setTimeout(sendExplore, 420)
      }
    }
  }, [handoffActive, reducedMotion])

  useEffect(() => {
    const element = frameRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        element.contentWindow?.postMessage({ type: 'ameno:experience-hidden' }, window.location.origin)
      }
    })
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== element.contentWindow) return
      if (event.data?.type === 'ameno:view-state') {
        setOverview(event.data.overview === true)
      }
    }
    window.addEventListener('message', receive)
    observer.observe(element)
    return () => {
      observer.disconnect()
      window.removeEventListener('message', receive)
    }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    const video = videoRef.current
    if (!track || !video) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobileQuery = window.matchMedia('(max-width: 768px)')

    let isReduced = motionQuery.matches
    let rafId = 0
    let targetRawP = 0
    let targetFilmP = 0
    let smoothFilmP = 0
    let pendingTime: number | null = null
    let prevIntro = true
    let prevHandoff = false
    let prevAtStart = true
    let prevChapter = 0

    const applyReducedState = (reduced: boolean) => {
      isReduced = reduced
      setReducedMotion(reduced)
      if (reduced) {
        setIframeActive(true)
        setHandoffActive(true)
        setIntroVisible(true)
        track.style.setProperty('--film-layer-opacity', '0')
        track.style.setProperty('--hud-opacity', '0')
        track.style.setProperty('--intro-opacity', '1')
        track.style.setProperty('--intro-shift', '0px')
      }
    }

    let videoInitialized = false
    const ensureVideoLoaded = () => {
      if (videoInitialized || isReduced) return
      videoInitialized = true
      const desiredSrc = mobileQuery.matches ? MOBILE_SCRUB_SRC : DESKTOP_SCRUB_SRC
      if (!video.getAttribute('src')) {
        video.src = desiredSrc
        video.load()
      }
    }

    const commitSeek = (timeSec: number) => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return
      const clamped = Math.max(0, Math.min(video.duration - 0.02, timeSec))
      if (Math.abs(video.currentTime - clamped) < 0.008) return
      if (video.seeking) {
        pendingTime = clamped
        return
      }
      pendingTime = null
      try {
        video.currentTime = clamped
      } catch {
        // Ignore transient decoder state errors prior to readiness
      }
    }

    const onSeeked = () => {
      if (pendingTime !== null) {
        const next = pendingTime
        pendingTime = null
        commitSeek(next)
      }
    }

    const computeChapter = (filmP: number) => {
      const sec = filmP * 18.467
      if (sec < 3.59) return 0
      if (sec < 6.86) return 1
      if (sec < 14.39) return 2
      return 3
    }

    const measureScroll = () => {
      const rect = track.getBoundingClientRect()
      const maxScroll = Math.max(1, track.offsetHeight - window.innerHeight)
      const scrolled = Math.max(0, Math.min(maxScroll, -rect.top))
      targetRawP = scrolled / maxScroll
      targetFilmP = Math.min(1, Math.max(0, targetRawP / 0.88))
    }

    const renderTick = () => {
      rafId = 0
      if (isReduced) return

      const delta = targetFilmP - smoothFilmP
      if (Math.abs(delta) > 0.0004) {
        smoothFilmP += delta * 0.24
        rafId = window.requestAnimationFrame(renderTick)
      } else {
        smoothFilmP = targetFilmP
      }

      if (Number.isFinite(video.duration) && video.duration > 0) {
        commitSeek(smoothFilmP * video.duration)
      }

      const introOp = Math.max(0, Math.min(1, 1 - targetRawP / 0.095))
      const introShift = -Math.min(1, targetRawP / 0.12) * 18
      const filmOp = targetRawP <= 0.875 ? 1 : Math.max(0, 1 - (targetRawP - 0.875) / 0.055)
      const hudOp = targetRawP >= 0.855 ? Math.max(0, 1 - (targetRawP - 0.855) / 0.05) : 1

      track.style.setProperty('--film-progress', smoothFilmP.toFixed(4))
      track.style.setProperty('--intro-opacity', introOp.toFixed(3))
      track.style.setProperty('--intro-shift', `${introShift.toFixed(1)}px`)
      track.style.setProperty('--film-layer-opacity', filmOp.toFixed(3))
      track.style.setProperty('--hud-opacity', hudOp.toFixed(3))

      const nextIntro = targetRawP < 0.095
      if (nextIntro !== prevIntro) {
        prevIntro = nextIntro
        setIntroVisible(nextIntro)
      }

      if (targetRawP >= 0.35) {
        setIframeActive(true)
      }

      const nextHandoff = targetRawP >= 0.905
      if (nextHandoff !== prevHandoff) {
        prevHandoff = nextHandoff
        setHandoffActive(nextHandoff)
        if (nextHandoff) setIframeActive(true)
        if (!nextHandoff) {
          frameRef.current?.contentWindow?.postMessage({ type: 'ameno:experience-hidden' }, window.location.origin)
        }
      }

      const nextAtStart = targetRawP < 0.045
      if (nextAtStart !== prevAtStart) {
        prevAtStart = nextAtStart
        setAtStart(nextAtStart)
      }

      const nextChap = computeChapter(smoothFilmP)
      if (nextChap !== prevChapter) {
        prevChapter = nextChap
        setChapterIdx(nextChap)
      }
    }

    const scheduleUpdate = () => {
      if (isReduced) return
      measureScroll()
      if (targetRawP > 0.002) {
        ensureVideoLoaded()
      }
      if (!rafId) {
        rafId = window.requestAnimationFrame(renderTick)
      }
    }

    const onFirstIntent = () => {
      ensureVideoLoaded()
    }

    const onLoadedMetadata = () => {
      measureScroll()
      smoothFilmP = targetFilmP
      commitSeek(Math.max(0.001, smoothFilmP * video.duration))
      scheduleUpdate()
    }

    const onMotionChange = (e: MediaQueryListEvent) => {
      applyReducedState(e.matches)
      if (!e.matches) scheduleUpdate()
    }

    video.addEventListener('seeked', onSeeked)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('wheel', onFirstIntent, { passive: true, once: true })
    window.addEventListener('touchstart', onFirstIntent, { passive: true, once: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    motionQuery.addEventListener('change', onMotionChange)

    const initFrame = window.requestAnimationFrame(() => {
      applyReducedState(motionQuery.matches)
      if (!motionQuery.matches) {
        measureScroll()
        if (targetRawP > 0.002) ensureVideoLoaded()
        smoothFilmP = targetFilmP
        renderTick()
      }
    })

    return () => {
      window.cancelAnimationFrame(initFrame)
      if (rafId) window.cancelAnimationFrame(rafId)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('wheel', onFirstIntent)
      window.removeEventListener('touchstart', onFirstIntent)
      window.removeEventListener('resize', scheduleUpdate)
      motionQuery.removeEventListener('change', onMotionChange)
    }
  }, [])

  const showIntro = reducedMotion ? overview : introVisible
  const currentChapter = CHAPTERS[chapterIdx] ?? CHAPTERS[0]

  return (
    <section
      ref={trackRef}
      className={styles.scrollTrack}
      data-reduced-motion={reducedMotion}
      aria-label="Explore a cabine Bom Jesus"
    >
      <div className={styles.stickyViewport}>
        <div className={styles.stageContainer}>
          <iframe
            ref={frameRef}
            className={styles.frame}
            data-interactive={handoffActive || reducedMotion}
            src={iframeActive ? CABIN_IFRAME_SRC : undefined}
            title="Cabine Bom Jesus — ambientes, materiais e iluminação"
            loading="lazy"
            allow="fullscreen"
            allowFullScreen
          />

          {!reducedMotion && (
            <div
              className={styles.filmLayer}
              data-handoff={handoffActive}
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Instant responsive WebP LCP poster before scrub video loads */}
              <img
                src={START_POSTER_SRC}
                srcSet={`${START_POSTER_MOBILE_SRC} 800w, ${START_POSTER_SRC} 1920w`}
                sizes="100vw"
                alt=""
                fetchPriority="high"
                decoding="sync"
                className={styles.posterImage}
              />
              <video
                ref={videoRef}
                className={styles.scrollVideo}
                poster={START_POSTER_SRC}
                muted
                playsInline
                preload="none"
              />
              <div className={styles.filmVignette} />
            </div>
          )}

          {!reducedMotion && (
            <div
              className={styles.scrollHud}
              data-hidden={handoffActive}
            >
              <div className={styles.chapterMeta} aria-live="off">
                <span className={styles.chapterStep}>{currentChapter.step}</span>
                <strong className={styles.chapterTitle}>{currentChapter.title}</strong>
              </div>

              <div className={styles.hudRight}>
                {atStart ? (
                  <span className={styles.scrollPrompt}>
                    <i className={styles.scrollDot} aria-hidden="true" />
                    Role para percorrer a cabine ↓
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.skipInteractiveBtn}
                    onClick={() => jumpToInteractive(false)}
                  >
                    Ir para cabine interativa ↓
                  </button>
                )}
              </div>

              <div className={styles.progressTrack} aria-hidden="true">
                <div className={styles.progressFill} />
              </div>
            </div>
          )}
        </div>

        <section
          className={styles.introduction}
          data-visible={showIntro}
          aria-labelledby="studio-title"
        >
          <p className={styles.kicker}>Ameno Studio · Recife, Brasil</p>
          <h1 id="studio-title">
            Arquitetura, visualização<br />
            e <em className="font-editorial">ferramentas.</em>
          </h1>
          <p className={styles.caption}>
            Projetos executivos em BIM, visualização para incorporadoras e plugins para 3ds Max.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className="ameno-button ameno-button--primary"
              onClick={() => jumpToInteractive(true)}
            >
              Explore a cabine <span aria-hidden="true">↗</span>
            </button>
            <Link href="/portfolio#arquitetura" className="ameno-button ameno-button--secondary">
              Portfólio <span aria-hidden="true">→</span>
            </Link>
            <Link href="/portfolio#modelagem-3d" className="ameno-button ameno-button--secondary">
              Biblioteca 3D <span aria-hidden="true">→</span>
            </Link>
            <Link href="/plugins" className="ameno-button ameno-button--secondary">
              Plugins <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </section>
  )
}
