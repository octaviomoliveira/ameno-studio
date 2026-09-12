'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/portfolio', label: 'portfólio' },
  { href: '/plugins', label: 'plugins' },
  { href: '/sobre', label: 'sobre' },
  { href: '/conta', label: 'conta' },
]

const MOBILE_MENU_QUERY = '(max-width: 767px), (hover: none) and (pointer: coarse) and (max-width: 1024px)'
const FOCUSABLE_ELEMENTS = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [openPathname, setOpenPathname] = useState<string | null>(null)
  const navigationRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const lastY = useRef(0)
  const pathname = usePathname()
  const menuOpen = openPathname === pathname

  // Layouts persist between routes; a menu belongs only to the route that opened it.
  if (openPathname !== null && openPathname !== pathname) {
    setOpenPathname(null)
  }

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY
      const diff = currentY - lastY.current

      if (currentY <= 80) {
        setHidden(false)
      } else if (diff > 8) {
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

    const navigation = navigationRef.current
    const toggle = toggleRef.current
    if (!navigation) return

    const mobileQuery = window.matchMedia(MOBILE_MENU_QUERY)
    const previousOverflow = document.body.style.overflow
    const background = Array.from(navigation.parentElement?.children ?? [])
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== navigation)
      .map((element) => ({ element, wasInert: element.inert }))
    const focusableElements = () => Array.from(navigation.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS))
      .filter((element) => element.getClientRects().length > 0)
    const focusMenu = () => menuRef.current?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpenPathname(null)
        return
      }

      if (event.key !== 'Tab') return
      const elements = focusableElements()
      const first = elements[0]
      const last = elements.at(-1)

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && !navigation.contains(event.target)) focusMenu()
    }
    const onBreakpointChange = () => {
      if (!mobileQuery.matches) setOpenPathname(null)
    }

    background.forEach(({ element }) => { element.inert = true })
    document.body.style.overflow = 'hidden'
    focusMenu()
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', onFocusIn)
    mobileQuery.addEventListener('change', onBreakpointChange)

    return () => {
      document.body.style.overflow = previousOverflow
      background.forEach(({ element, wasInert }) => { element.inert = wasInert })
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', onFocusIn)
      mobileQuery.removeEventListener('change', onBreakpointChange)
      if (toggle?.getClientRects().length) toggle.focus({ preventScroll: true })
    }
  }, [menuOpen])

  return (
    <div
      ref={navigationRef}
      role={menuOpen ? 'dialog' : undefined}
      aria-modal={menuOpen ? true : undefined}
      aria-label={menuOpen ? 'Menu de navegação' : undefined}
      data-lenis-prevent={menuOpen ? '' : undefined}
    >
      <nav
        aria-label="Navegação principal"
        onFocusCapture={() => setHidden(false)}
        className={`site-navbar transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <Link href="/" className="block" aria-label="ameno.studio" onClick={() => setOpenPathname(null)}>
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
            const active = pathname === href || pathname.startsWith(`${href}/`)
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
          ref={toggleRef}
          type="button"
          className="site-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
          onClick={() => setOpenPathname((open) => open === pathname ? null : pathname)}
        >
          <span>{menuOpen ? 'Fechar' : 'Menu'}</span>
          <i aria-hidden="true" />
        </button>
      </nav>

      {menuOpen ? (
        <div ref={menuRef} id="site-mobile-menu" className="site-mobile-menu">
          <div className="site-mobile-menu-topline">
            <span>NAVEGAÇÃO</span>
            <span>AMENO / 2026</span>
          </div>
          <div className="site-mobile-menu-links">
            {NAV_ITEMS.map(({ href, label }, index) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined}
                onClick={() => setOpenPathname(null)}
              >
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
    </div>
  )
}
