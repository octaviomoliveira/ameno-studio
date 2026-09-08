'use client'
import { useRef } from 'react'

const TEXT = 'ARQUITETURA · VISUALIZAÇÃO · PLUGINS · AMENO.STUDIO · RECIFE · BRASIL · '

export default function Marquee() {
  return (
    <div
      className="overflow-hidden py-5 select-none"
      style={{ borderTop: '1px solid #222222', borderBottom: '1px solid #222222' }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 20s linear infinite' }}
      >
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="text-xs tracking-[0.3em] mr-0"
            style={{ color: '#444444' }}
          >
            {TEXT}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
