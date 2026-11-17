'use client'

import { useState } from 'react'
import Link from 'next/link'

const CONTACT_EMAIL = 'contato@ameno.studio'
const COMPANY_CNPJ = process.env.NEXT_PUBLIC_COMPANY_CNPJ?.trim() || '54.457.188/0001-20'

export default function Footer() {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2600)
    } catch {
      window.location.href = `mailto:${CONTACT_EMAIL}`
    }
  }

  return (
    <footer id="contato" className="site-footer">
      <div className="site-footer-contact">
        <p>05 / CONTATO DIRETO</p>
        <a href={`mailto:${CONTACT_EMAIL}`}>
          <span>Tem um projeto, lançamento ou parceria em mente?</span>
          <strong>Vamos conversar <em aria-hidden="true">→</em></strong>
        </a>

        <div className="site-footer-actions" role="group" aria-label="Canais diretos de contato">
          <button
            type="button"
            onClick={handleCopyEmail}
            className={`site-footer-action-btn${copied ? ' is-copied' : ''}`}
          >
            <span className="site-footer-action-kicker">{copied ? 'COPIADO PARA A ÁREA DE TRANSFERÊNCIA' : 'COPIAR E-MAIL COM 1 CLIQUE'}</span>
            <strong>{copied ? 'Copiado: contato@ameno.studio' : 'contato@ameno.studio'}</strong>
          </button>

          <a
            href="https://www.instagram.com/arq.octaviooliveira/"
            target="_blank"
            rel="noreferrer"
            className="site-footer-action-btn"
          >
            <span className="site-footer-action-kicker">MENSAGEM DIRETA (DM)</span>
            <strong>Instagram @arq.octaviooliveira ↗</strong>
          </a>

          <a
            href="https://www.linkedin.com/in/octavio-m-oliveira/"
            target="_blank"
            rel="noreferrer"
            className="site-footer-action-btn"
          >
            <span className="site-footer-action-kicker">REDE PROFISSIONAL</span>
            <strong>LinkedIn Octávio Oliveira ↗</strong>
          </a>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Contato pelo site ameno.studio')}`}
            className="site-footer-action-btn"
          >
            <span className="site-footer-action-kicker">ABRIR CLIENTE DE E-MAIL</span>
            <strong>Enviar e-mail agora ↗</strong>
          </a>
        </div>
      </div>

      <div className="site-footer-bottom">
        <div className="site-footer-identity">
          <span>AMENO.STUDIO · OCTÁVIO OLIVEIRA</span>
          <small>
            © {new Date().getFullYear()} Octávio Oliveira · Recife, PE — Brasil
            {COMPANY_CNPJ ? ` · CNPJ ${COMPANY_CNPJ}` : ''}
          </small>
        </div>

        <a href={`mailto:${CONTACT_EMAIL}`} className="site-footer-email">
          {CONTACT_EMAIL}
        </a>

        <nav className="site-footer-legal" aria-label="Links institucionais e legais">
          <Link href="/privacidade">Política de privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
        </nav>

        <div className="site-footer-social" role="group" aria-label="Redes sociais">
          <a href="https://www.instagram.com/arq.octaviooliveira/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.linkedin.com/in/octavio-m-oliveira/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}
