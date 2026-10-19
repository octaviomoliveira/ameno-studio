'use client'

import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SECTIONS = [
  { id: 'projetos', num: '01', label: 'Projetos em Cena', count: '05' },
  { id: 'galeria-renders', num: '02', label: 'Mural de Renders', count: '22' },
  { id: 'assets-3d', num: '03', label: 'Destaques 3D', count: '05' },
  { id: 'catalogo-3d', num: '04', label: 'Catálogo 3D Completo', count: '29' },
]

export default function PortfolioQuickNav() {
  const [activeId, setActiveId] = useState<string>('projetos')

  const scrollToSection = (id: string) => {
    ScrollTrigger.refresh()
    const target = document.getElementById(id)
    if (!target) return
    const navOffset = 112
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navOffset)
    window.history.replaceState(null, '', `#${id}`)
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
  }

  useEffect(() => {
    const handleInitialHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (!hash) return
      const isSection = SECTIONS.some((s) => s.id === hash)
      if (isSection) {
        window.setTimeout(() => {
          ScrollTrigger.refresh()
          const target = document.getElementById(hash)
          if (!target) return
          const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 112)
          window.scrollTo({ top, behavior: 'smooth' })
          setActiveId(hash)
        }, 180)
      }
    }

    handleInitialHash()
    window.addEventListener('hashchange', handleInitialHash)
    return () => window.removeEventListener('hashchange', handleInitialHash)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.36
      let current = SECTIONS[0].id
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= threshold) {
          current = section.id
        }
      }
      setActiveId(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="portfolio-quicknav" aria-label="Atalhos das seções do portfólio">
      <div className="portfolio-quicknav-inner">
        <span className="portfolio-quicknav-tag">IR DIRETO PARA:</span>
        <div className="portfolio-quicknav-links">
          {SECTIONS.map((item) => {
            const isActive = activeId === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`portfolio-quicknav-btn${isActive ? ' is-active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="portfolio-quicknav-num">{item.num}</span>
                <strong className="portfolio-quicknav-label">{item.label}</strong>
                <span className="portfolio-quicknav-count">{item.count}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
