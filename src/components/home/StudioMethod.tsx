'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PRINCIPLES = [
  {
    number: '01',
    label: 'ORDEM',
    title: 'Estruturar o que importa.',
    text: 'Clareza para atravessar a complexidade de cada projeto, do levantamento em BIM à prancha executiva final.',
    img: '/projects/autorais/gustavo-lira/planta-humanizada.webp',
    imgAlt: 'Planta humanizada oficial da Residência Gustavo Lira',
  },
  {
    number: '02',
    label: 'IMAGEM',
    title: 'Dar forma ao que ainda não existe.',
    text: 'Visualização como ferramenta de decisão, atmosfera e aprovação — não apenas como acabamento.',
    img: '/projects/central-parque.webp',
    imgAlt: 'Visualização arquitetônica do empreendimento Central Parque',
  },
  {
    number: '03',
    label: 'FERRAMENTA',
    title: 'Automatizar o repetitivo.',
    text: 'Sistemas proprietários para devolver tempo ao trabalho que exige olhar, critério e intenção.',
    img: '/projects/autorais/delicias-da-ana/fachada.webp',
    imgAlt: 'Elevação perspectivada cotada no 3ds Max com o plugin Ameno Cotas',
  },
]

export default function StudioMethod() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from('[data-method-copy]', {
        y: 32,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
      })
      gsap.from('[data-method-card]', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: '[data-method-cards]', start: 'top 90%', once: true },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="method" className="method-section relative overflow-hidden px-6 py-24 sm:py-36" aria-labelledby="method-title">
      <div className="relative z-10 mx-auto max-w-[1440px]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div data-method-copy>
            <h2 id="method-title" className="max-w-2xl text-display-sm">
              Menos ruído, mais espaço<br />para a imagem<span className="text-red">.</span>
            </h2>
          </div>
          <div data-method-copy className="max-w-2xl lg:pt-2">
            <p className="text-xl leading-relaxed text-[#e8e8e0]">
              O ameno.studio transforma arquitetura, visualização e ferramentas em um mesmo campo de trabalho.
            </p>
            <p className="mt-5 text-base leading-relaxed text-[#9a9a92]">
              Cada projeto começa organizando o problema. Depois, a imagem encontra a forma certa de comunicar o que precisa existir.
            </p>
          </div>
        </div>

        <div data-method-cards className="method-principles mt-16 grid gap-8 border-t border-[#222222] pt-12 lg:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <article key={principle.number} data-method-card className="method-card">
              <div className="relative mb-6 aspect-[16/10] w-full overflow-hidden bg-[#141414]">
                <Image
                  src={principle.img}
                  alt={principle.imgAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="method-card-topline">
                <span>{principle.label}</span>
              </div>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
