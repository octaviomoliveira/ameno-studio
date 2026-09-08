'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PRINCIPLES = [
  {
    number: '01',
    label: 'ORDEM',
    title: 'Estruturar o que importa.',
    text: 'Clareza para atravessar a complexidade de cada projeto, do desenho à imagem final.',
  },
  {
    number: '02',
    label: 'IMAGEM',
    title: 'Dar forma ao que ainda não existe.',
    text: 'Visualização como ferramenta de decisão, comunicação e desejo — não apenas como acabamento.',
  },
  {
    number: '03',
    label: 'FERRAMENTA',
    title: 'Automatizar o repetitivo.',
    text: 'Pequenos sistemas para devolver tempo ao trabalho que exige olhar, critério e intenção.',
  },
]

const WORDS = [
  'ARQUITETURA', 'IMAGEM', 'MATÉRIA', 'LUZ', 'BIM', 'PROCESSO', 'ESCALA', 'DETALHE',
  'RENDER', 'FORMA', 'CAMADAS', 'RITMO', 'SISTEMA', 'FERRAMENTA', 'PRECISÃO',
]

export default function StudioMethod() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from('[data-method-copy]', {
        y: 52,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
      })
      gsap.from('[data-method-card]', {
        y: 38,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-method-cards]', start: 'top 78%', once: true },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="method" className="method-section relative overflow-hidden px-6 py-28 sm:py-44" aria-labelledby="method-title">
      <div className="page-grid" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-[1440px]">
        <div className="page-topline">
          <p>02 / MÉTODO</p>
          <p>ORDEM × INTERFERÊNCIA</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
          <div data-method-copy>
            <h2 id="method-title" className="max-w-3xl text-display-sm">Menos ruído. Mais espaço para a imagem<span className="text-red">.</span></h2>
          </div>
          <div data-method-copy className="max-w-2xl lg:pt-4">
            <p className="text-xl leading-relaxed text-[#e8e8e0]">O ameno.studio transforma arquitetura, visualização e ferramentas em um mesmo campo de trabalho.</p>
            <p className="mt-6 text-base leading-relaxed text-[#666666]">Cada projeto começa organizando o problema. Depois, a imagem encontra a forma certa de comunicar o que precisa existir.</p>
          </div>
        </div>

        <div className="method-wordwall mt-20 border-y border-[#222222] py-8" aria-label="Áreas e palavras-chave do estúdio">
          {WORDS.map((word, index) => (
            <span key={word} className={index % 5 === 0 ? 'is-accent' : ''}>{word}</span>
          ))}
        </div>

        <div data-method-cards className="method-principles mt-16 grid border-t border-[#222222] lg:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <article key={principle.number} data-method-card className="method-card">
              <div className="method-card-topline">
                <span>{principle.number}</span>
                <span>{principle.label}</span>
              </div>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
              <span className="method-card-mark" aria-hidden="true">+</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
