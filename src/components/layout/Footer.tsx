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
          <span>AMENO.INFO</span>
          <small>© {new Date().getFullYear()} Octávio Oliveira</small>
        </div>
        <a href="mailto:contato@ameno.studio">contato@ameno.studio</a>
        <div className="site-footer-social" aria-label="Redes sociais em atualização">
          <span title="Link em atualização">Instagram</span>
          <span title="Link em atualização">LinkedIn</span>
        </div>
      </div>
    </footer>
  )
}
