'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const [hidden, setHidden] = useState(false)
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
    if (!navRef.current) return
    gsap.to(navRef.current, {
      y: hidden ? -80 : 0,
      duration: 0.4,
      ease: 'power2.inOut',
    })
  }, [hidden])

  return (
    <nav
      ref={navRef}
      aria-label="Navegação principal"
      className="site-navbar"
    >
      {/* Logo */}
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

      {/* Nav links */}
      <div className="flex items-center gap-3 sm:gap-8">
        {[
          { href: '/#portfolio', label: 'projetos', desktopOnly: true },
          { href: '/plugins', label: 'plugins' },
          { href: '/sobre', label: 'sobre' },
          { href: '/conta', label: 'conta' },
        ].map(({ href, label, desktopOnly }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`nav-link ${desktopOnly ? 'nav-link-desktop' : ''} ${active ? 'is-active' : ''}`}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
