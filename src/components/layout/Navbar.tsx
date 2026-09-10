'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/#portfolio', label: 'projetos' },
  { href: '/plugins', label: 'plugins' },
  { href: '/sobre', label: 'sobre' },
  { href: '/conta', label: 'conta' },
]

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastY = useRef(0)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY
      const diff = currentY - lastY.current

      if (diff > 8 && currentY > 80) {
        setHidden(true)
      } else if (diff < -8) {
        setHidden(false)
      }

      lastY.current = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className={`site-navbar transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <Link href="/" className="block" aria-label="ameno.studio">
          <Image
            src="/brand/logo.svg"
            alt="ameno"
            width={112}
            height={36}
            className="invert h-auto w-28"
            priority
          />
        </Link>

        <div className="site-nav-links">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = href.startsWith('/#') ? pathname === '/' : pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`nav-link${active ? ' is-active' : ''}`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <button
          type="button"
          className="site-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? 'Fechar' : 'Menu'}</span>
          <i aria-hidden="true" />
        </button>
      </nav>

      {menuOpen ? (
        <div id="site-mobile-menu" className="site-mobile-menu">
          <div className="site-mobile-menu-topline">
            <span>NAVEGAÇÃO</span>
            <span>AMENO / 2026</span>
          </div>
          <div className="site-mobile-menu-links">
            {NAV_ITEMS.map(({ href, label }, index) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{label}</strong>
                <em aria-hidden="true">→</em>
              </Link>
            ))}
          </div>
          <a className="site-mobile-menu-contact" href="mailto:contato@ameno.studio">
            contato@ameno.studio
          </a>
        </div>
      ) : null}
    </>
  )
}
