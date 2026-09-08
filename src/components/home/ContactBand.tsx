import Link from 'next/link'

export default function ContactBand() {
  return (
    <section className="contact-band relative overflow-hidden border-t border-[#222222] px-6 py-28 sm:py-44" aria-labelledby="contact-band-title">
      <div className="contact-band-mark" aria-hidden="true">→</div>
      <div className="relative z-10 mx-auto max-w-[1440px]">
        <div className="page-topline">
          <p>05 / CONTATO</p>
          <p>RECIFE — BRASIL</p>
        </div>
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:gap-24">
          <h2 id="contact-band-title" className="max-w-5xl text-display-sm">Vamos dar forma ao próximo projeto<span className="text-red">.</span></h2>
          <div className="max-w-md lg:pb-2">
            <p className="text-lg leading-relaxed text-[#e8e8e0]">Arquitetura, imagens ou uma ferramenta que ainda não existe. Vamos conversar.</p>
            <Link href="mailto:contato@ameno.studio" className="contact-band-link mt-10 inline-flex text-sm uppercase tracking-[0.2em] text-[#E63B2E]">
              contato@ameno.studio <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
