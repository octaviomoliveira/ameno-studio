'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5"
      style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Logo */}
      <Link href="/" className="block" aria-label="ameno.studio">
        <Image
          src="/brand/logo.svg"
          alt="ameno"
          width={120}
          height={28}
          className="invert"
          priority
        />
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-8">
        {[
          { href: '/plugins', label: 'plugins' },
          { href: '/sobre', label: 'sobre' },
          { href: '/conta', label: 'conta' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm tracking-widest uppercase transition-colors duration-200"
            style={{ color: '#666666' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E63B2E')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666666')}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
