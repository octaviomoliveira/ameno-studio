'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './BomJesusHero.module.css'

export default function BomJesusHero() {
  const [overview, setOverview] = useState(true)
  const frame = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    const element = frame.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) element.contentWindow?.postMessage({ type: 'ameno:experience-hidden' }, window.location.origin)
    })
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== element.contentWindow) return
      if (event.data?.type === 'ameno:view-state') setOverview(event.data.overview === true)
    }
    window.addEventListener('message', receive)
    observer.observe(element)
    return () => { observer.disconnect(); window.removeEventListener('message', receive) }
  }, [])

  return (
    <>
      <section className={styles.experience} aria-label="Explore a cabine Bom Jesus">
        <iframe ref={frame} className={styles.frame} src="/experiences/bom-jesus/index.html?v=ameno-home2"
          title="Cabine Bom Jesus — ambientes, materiais e iluminação" allow="fullscreen" allowFullScreen />
      <section className={styles.introduction} data-visible={overview} aria-hidden={!overview} inert={!overview} aria-labelledby="studio-title">
        <p className={styles.kicker}>AMENO.STUDIO / RECIFE · BRASIL</p>
        <h1 id="studio-title">Arquitetura.<br /><em className="font-editorial">Visualização.</em><br />Ferramentas.</h1>
        <p className={styles.caption}>Conheça o trabalho por trás de cada espaço.</p>
        <div className={styles.actions}>
          <Link href="/portfolio#projetos" className="ameno-button ameno-button--primary">Ver portfólio <span aria-hidden="true">→</span></Link>
          <Link href="/portfolio#assets-3d" className="ameno-button ameno-button--secondary">Biblioteca 3D <span aria-hidden="true">→</span></Link>
          <Link href="/plugins" className="ameno-button ameno-button--secondary">Plugins <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      </section>
    </>
  )
}
