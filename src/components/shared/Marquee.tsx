const TEXT = 'ARQUITETURA · VISUALIZAÇÃO · PLUGINS · AMENO.STUDIO · RECIFE · BRASIL · '

export default function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden py-5 select-none"
      style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
    >
      <div
        className="marquee-track flex whitespace-nowrap"
      >
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="text-xs tracking-[0.3em] mr-0"
            style={{ color: 'var(--off-white)' }}
          >
            {TEXT}
          </span>
        ))}
      </div>

    </div>
  )
}
