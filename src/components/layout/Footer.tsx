'use client'

import { useState } from 'react'

const CONTACT_EMAIL = 'contato@ameno.studio'

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
            <strong>{copied ? '✓ contato@ameno.studio copiado!' : 'contato@ameno.studio ⎘'}</strong>
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
        <div>
          <span>AMENO.STUDIO</span>
          <small>© {new Date().getFullYear()} Octávio Oliveira</small>
        </div>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <div className="site-footer-social" role="group" aria-label="Redes sociais">
          <a href="https://www.instagram.com/arq.octaviooliveira/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.linkedin.com/in/octavio-m-oliveira/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}

