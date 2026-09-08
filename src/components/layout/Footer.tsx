import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-6 py-8 mt-0"
      style={{ borderTop: '1px solid #222222' }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold tracking-widest uppercase">ameno.studio</span>
        <span className="text-xs" style={{ color: '#666666' }}>
          © {new Date().getFullYear()} Octávio Oliveira
        </span>
      </div>

      <div className="flex items-center gap-6">
        <a
          href="mailto:contato@ameno.studio"
          className="text-xs tracking-wider transition-colors duration-200 text-[#666666] hover:text-[#E63B2E] focus-visible:text-[#E63B2E]"
        >
          contato@ameno.studio
        </a>
        <div className="flex gap-4">
          {[
            { label: 'Instagram', href: 'https://instagram.com' },
            { label: 'LinkedIn', href: 'https://linkedin.com' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-widest uppercase transition-colors duration-200 text-[#666666] hover:text-white focus-visible:text-white"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
