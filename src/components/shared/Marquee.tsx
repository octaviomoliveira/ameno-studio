'use client'

const TEXT = 'ARQUITETURA · VISUALIZAÇÃO · PLUGINS · AMENO.INFO · RECIFE · BRASIL · '

export default function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden py-5 select-none"
      style={{ borderTop: '1px solid #222222', borderBottom: '1px solid #222222' }}
    >
      <div
        className="marquee-track flex whitespace-nowrap"
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

    </div>
  )
}
