export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-contact">
        <p>05 / CONTATO</p>
        <a href="mailto:contato@ameno.studio">
          <span>Tem algo em mente?</span>
          <strong>Vamos conversar <em aria-hidden="true">→</em></strong>
        </a>
      </div>

      <div className="site-footer-bottom">
        <div>
          <span>AMENO.STUDIO</span>
          <small>© {new Date().getFullYear()} Octávio Oliveira</small>
        </div>
        <a href="mailto:contato@ameno.studio">contato@ameno.studio</a>
        <div className="site-footer-social" aria-label="Redes sociais">
          <a href="https://www.instagram.com/arq.octaviooliveira/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.linkedin.com/in/octavio-m-oliveira/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}
