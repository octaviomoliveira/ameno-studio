'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './BomJesusHero.module.css'

export default function BomJesusHero() {
  const frame = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    const element = frame.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) element.contentWindow?.postMessage({ type: 'ameno:experience-hidden' }, window.location.origin)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <section className={styles.experience} aria-label="Explore a cabine Bom Jesus">
        <iframe ref={frame} className={styles.frame} src="/experiences/bom-jesus/index.html?v=ameno-home1"
          title="Cabine Bom Jesus — ambientes, materiais e iluminação" allow="fullscreen" allowFullScreen />
      </section>
      <section className={styles.introduction} aria-labelledby="studio-title">
        <p className={styles.kicker}>AMENO.STUDIO / RECIFE · BRASIL</p>
        <h1 id="studio-title">Arquitetura.<br /><em className="font-editorial">Visualização.</em><br />Ferramentas.</h1>
        <p className={styles.caption}>Explore a cabine acima. Conheça o trabalho por trás de cada espaço.</p>
        <div className={styles.actions}>
          <Link href="/portfolio#projetos" className="ameno-button ameno-button--primary">Ver portfólio <span aria-hidden="true">→</span></Link>
          <Link href="/portfolio#assets-3d" className="ameno-button ameno-button--secondary">Biblioteca 3D <span aria-hidden="true">→</span></Link>
          <Link href="/plugins" className="ameno-button ameno-button--secondary">Plugins <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </>
  )
}
