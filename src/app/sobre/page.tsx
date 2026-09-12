import Image from 'next/image'
import StudioMethod from '@/components/home/StudioMethod'
import styles from './page.module.css'

export const metadata = {
  title: 'Sobre — ameno.studio',
  description: 'Octávio Oliveira — arquitetura, visualização e ferramentas para tornar ideias claras e processos mais inteligentes.',
}

export default function SobrePage() {
  return (
    <div className={styles.page}>
      <section className={styles.intro} aria-labelledby="about-title">
        <div className={`page-topline ${styles.topline}`}>
          <p>SOBRE / AMENO.STUDIO</p>
          <p>RECIFE, BRASIL</p>
        </div>
        <div className={styles.hero}>
          <div className={styles.heading}>
            <p className={styles.label}>Estúdio independente</p>
            <h1 id="about-title" className={styles.title}>
              <span>Arquitetura,</span>
              <span>visualização</span>
              <span>e <em className="font-editorial">ferramentas.</em></span>
            </h1>
          </div>
          <figure className={styles.portrait}>
            <div className={styles.portraitFrame}>
              <Image
                src="/about/octavio-oliveira.webp"
                alt="Retrato de Octávio Oliveira"
                fill
                sizes="(max-width: 760px) calc(100vw - 2.5rem), (max-width: 1440px) 36vw, 480px"
                loading="eager"
                className={styles.portraitImage}
              />
            </div>
            <figcaption>
              <span>Octávio Oliveira</span>
              <span>Recife / Brasil</span>
            </figcaption>
          </figure>
          <div className={styles.introduction}>
            <p>Eu sou Octávio Oliveira. O ameno.studio é o ponto de encontro entre meu trabalho com arquitetura, visualização e criação de ferramentas.</p>
            <p>Nasceu da vontade de transformar ideias complexas em imagens claras — e processos repetitivos em soluções mais inteligentes.</p>
          </div>
        </div>
      </section>
      <section className={styles.story} aria-labelledby="about-approach">
        <div className={styles.storyRail}>
          <p className={styles.label}>Arquitetura · Visualização · Ferramentas</p>
          <div className={styles.disciplines} role="group" aria-label="Áreas de atuação">
            <span>Arquitetura</span><span>ArchViz</span><span>Interiores</span><span>BIM</span><span>Produtos</span>
          </div>
        </div>
        <div className={styles.storyContent}>
          <h2 id="about-approach" className={styles.statement}>Visualizar é uma forma de <em className="font-editorial">pensar.</em></h2>
          <p className={styles.statementCopy}>Para mim, visualizar não é apenas apresentar um projeto pronto. É uma forma de pensar: testar atmosferas, perceber relações, antecipar decisões e comunicar com precisão aquilo que ainda não existe.</p>
          <div className={styles.bodyCopy}>
            <p>A mesma inquietação que conduz os projetos também dá origem aos plugins. Quando uma tarefa consome tempo demais ou interrompe o raciocínio, procuro convertê-la em uma ferramenta simples, direta e útil para quem trabalha criando.</p>
            <p>A partir de Recife, colaboro com pessoas, escritórios e empresas que procuram unir intenção, técnica e uma imagem capaz de contar a história certa.</p>
          </div>
          <div className={styles.contact}>
            <p className={styles.label}>Disponível para colaborações</p>
            <a href="mailto:contato@ameno.studio">contato@ameno.studio <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>
      <div className={styles.method}><StudioMethod /></div>
    </div>
  )
}
