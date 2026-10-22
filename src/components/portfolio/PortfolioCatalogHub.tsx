'use client'

import { useState, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AssetsSection from './AssetsSection'

gsap.registerPlugin(ScrollTrigger)

type RenderSlide = {
  src: string
  label: string
}

type AutoralCategory = 'Residencial' | 'Comercial & Gastronomia'

type AutoralProject = {
  slug: string
  title: string
  subtitle: string
  category: AutoralCategory
  location: string
  year: number
  scope: string[]
  description: string
  cover: string
  caseStudyUrl?: string
  slides: RenderSlide[]
}

type ArchvizDevelopment = {
  slug: string
  title: string
  category: string
  location: string
  year: number
  description: string
  cover: string
  renders: RenderSlide[]
}

const AUTORAIS_PROJECTS: AutoralProject[] = [
  {
    slug: 'gustavo-lira',
    title: 'Residência Gustavo Lira',
    subtitle: 'Casa MCMV I · Arquitetura & Interiores',
    category: 'Residencial',
    location: 'São Paulo, Brasil',
    year: 2025,
    scope: ['Projeto Executivo BIM', 'Arquitetura de Interiores', 'Planta Humanizada', 'Luminotécnica'],
    description:
      'Arquitetura residencial térrea articulada por jardim de inverno central, integrando sala de estar, jantar e cozinha com ventilação e luz natural cruzadas. Desenvolvido integralmente em BIM com caderno executivo completo (E101–E108).',
    cover: '/projects/autorais/gustavo-lira/fachada.webp',
    slides: [
      { src: '/projects/autorais/gustavo-lira/fachada.webp', label: 'Fachada Principal — Volumetria & Iluminação' },
      { src: '/projects/autorais/gustavo-lira/planta-humanizada.webp', label: 'Planta Humanizada Oficial — Térreo Integrado' },
      { src: '/projects/autorais/gustavo-lira/sala.webp', label: 'Living Integrado & Painel Ripado' },
      { src: '/projects/autorais/gustavo-lira/cozinha.webp', label: 'Jantar & Cozinha com Bancada em Quartzo' },
      { src: '/projects/autorais/gustavo-lira/jardim-inverno.webp', label: 'Jardim de Inverno & Luz Zenital' },
      { src: '/projects/autorais/gustavo-lira/suite.webp', label: 'Suíte Master — Cabeceira & Iluminação Indireta' },
      { src: '/projects/autorais/gustavo-lira/closet.webp', label: 'Closet Planejado — Marcenaria Sob Medida' },
      { src: '/projects/autorais/gustavo-lira/quarto.webp', label: 'Dormitório Duplo Solteiro & Painel de TV Marmorizado' },
      { src: '/projects/autorais/gustavo-lira/banho-suite.webp', label: 'Banheiro da Suíte — Paginação & Nicho Iluminado' },
      { src: '/projects/autorais/gustavo-lira/banho-social.webp', label: 'Banheiro Social — Bancada Esculpida' },
      { src: '/projects/autorais/gustavo-lira/fundos.webp', label: 'Varanda Lounge Posterior & Deck Amadeirado' },
    ],
  },
  {
    slug: 'residencia-lirban-modelo-01',
    title: 'Residência Lirban Modelo 01',
    subtitle: 'Linha Lirban · Estudo Volumétrico & Interiores',
    category: 'Residencial',
    location: 'São Paulo, Brasil',
    year: 2025,
    scope: ['Projeto Arquitetônico', 'Estudo de Fachadas', 'Layout Integrado', 'Interiores'],
    description:
      'Residência unifamiliar implantada em lote 8×20m com três variações de fachada contemporânea, setor social integrado à área gourmet posterior e setor íntimo otimizado.',
    cover: '/projects/autorais/felipe-lira/fachada-01.webp',
    slides: [
      { src: '/projects/autorais/felipe-lira/fachada-01.webp', label: 'Fachada Principal — Estudo Volumétrico 01' },
      { src: '/projects/autorais/felipe-lira/fachada-02.webp', label: 'Fachada Principal — Estudo Volumétrico 02' },
      { src: '/projects/autorais/felipe-lira/fachada-03.webp', label: 'Fachada Principal — Estudo Volumétrico 03' },
      { src: '/projects/autorais/felipe-lira/living-01.webp', label: 'Ambiente Social Integrado — Estar & Jantar' },
      { src: '/projects/autorais/felipe-lira/living-02.webp', label: 'Cozinha Americana & Integração Social' },
      { src: '/projects/autorais/felipe-lira/suite.webp', label: 'Suíte Principal Humanizada' },
      { src: '/projects/autorais/felipe-lira/quarto.webp', label: 'Dormitório Secundário Humanizado' },
      { src: '/projects/autorais/felipe-lira/banheiro.webp', label: 'Banheiro Social — Revestimentos & Louças' },
      { src: '/projects/autorais/felipe-lira/fundos.webp', label: 'Quintal Posterior & Espaço Gourmet' },
    ],
  },
  {
    slug: 'bom-jesus-blindados',
    title: 'Bom Jesus Blindados',
    subtitle: 'Box Técnico PPF & Painel Multimídia',
    category: 'Comercial & Gastronomia',
    location: 'Brasil',
    year: 2025,
    scope: ['Arquitetura Técnica', 'Forro Tensionado Iluminado', 'Painel Multimídia F1', 'Detalhamento'],
    description:
      'Ambiente técnico de precisão para aplicação de PPF e estética automotiva. Projeto executivo com forro tensionado iluminado, matriz luminotécnica para inspeção de pintura, bancada técnica em mármore e painel multimídia em cimento queimado.',
    cover: '/projects/autorais/bom-jesus-blindados/ig01.webp',
    slides: [
      { src: '/projects/autorais/bom-jesus-blindados/ig01.webp', label: 'Vista Geral IG01 — Box de Aplicação PPF & Forro Tensionado Iluminado' },
      { src: '/projects/autorais/bom-jesus-blindados/ig03.webp', label: 'Vista IG03 — Bancada Técnica em Mármore, Apoio Hídrico & Quadros F1' },
      { src: '/projects/autorais/bom-jesus-blindados/ig04.webp', label: 'Vista IG04 — Painel Multimídia F1 em Cimento Queimado & Moldura Metálica' },
      { src: '/projects/autorais/bom-jesus-blindados/ig05.webp', label: 'Vista IG05 — Enquadramento Frontal, Divisória em Vidro & Showroom' },
      { src: '/projects/autorais/bom-jesus-blindados/ig06.webp', label: 'Vista IG06 — Perspectiva Superior Box 1 & Matriz Luminotécnica Completa' },
    ],
  },
  {
    slug: 'delicias-da-ana',
    title: 'Delícias da Ana',
    subtitle: 'Retrofit Comercial, Fluxo Operacional & Cozinha Industrial (2,65m × 25,00m)',
    category: 'Comercial & Gastronomia',
    location: 'Brasil',
    year: 2025,
    scope: [
      'Levantamento In Loco',
      'Retrofit de Fachada (9,00m)',
      'Planta Cotada (Ameno Cotas)',
      'Salão & Menu Boards',
      'Cozinha Industrial em Inox',
    ],
    description:
      'Dossiê completo de reforma comercial em lote estreito de 2,65m × 25,00m: diagnóstico de campo com cotas in loco, retrofit do edifício de 3 pavimentos, planta humanizada cotada via plugin Ameno Cotas, salão de atendimento (7,45m), cozinha em inox (5,65m) e antecâmara sanitária (2,75m).',
    cover: '/projects/autorais/delicias-da-ana/atendimento-01.webp',
    caseStudyUrl: '/portfolio/delicias-da-ana',
    slides: [
      { src: '/projects/autorais/delicias-da-ana/atendimento-01.webp', label: '01 · Salão de Atendimento & Eixo Central (CAM01)' },
      { src: '/projects/autorais/delicias-da-ana/atendimento-02.webp', label: '02 · Balcão Ripado, PDV & Vitrine Aquecida (CAM02)' },
      { src: '/projects/autorais/delicias-da-ana/atendimento-03.webp', label: '03 · Contra-Plano do Balcão para a Esquadria de Entrada (CAM03)' },
      { src: '/projects/autorais/delicias-da-ana/planta-humanizada.webp', label: '04 · Planta Humanizada Cotada (2,65m × 25,00m) — Plugin Ameno Cotas' },
      { src: '/projects/autorais/delicias-da-ana/fachada-limpa.webp', label: '05 · Retrofit Integral do Edifício de 3 Pavimentos (Vista Limpa · R01)' },
      { src: '/projects/autorais/delicias-da-ana/fachada.webp', label: '06 · Elevação Perspectivada com Cotas Executivas — Ameno Cotas (R02)' },
      { src: '/projects/autorais/delicias-da-ana/fachada-terreo-zoom.webp', label: '07 · Close-Up Térreo Comercial — Delícias da Ana & Barbearia Pais & Filhos' },
      { src: '/projects/autorais/delicias-da-ana/cozinha-01.webp', label: '08 · Cozinha Industrial em Inox — Coifa, Fogão & Linha Fria (CAM02)' },
      { src: '/projects/autorais/delicias-da-ana/cozinha-02.webp', label: '09 · Estação de Fritura, Exaustão & Bancada em L (CAM03)' },
      { src: '/projects/autorais/delicias-da-ana/cozinha-03.webp', label: '10 · Linha Fria (Freezer Duplo + Refrigerador Inox) & Acesso à Antecâmara (CAM04)' },
      { src: '/projects/autorais/delicias-da-ana/cozinha-04-eixo.webp', label: '11 · Eixo Operacional — Visada da Cozinha para a Vitrine & Salão (CAM05)' },
      { src: '/projects/autorais/delicias-da-ana/antecamara.webp', label: '12 · Antecâmara Sanitária & Armário Piso-Teto de Insumos (CAM01)' },
      { src: '/projects/autorais/delicias-da-ana/banheiro.webp', label: '13 · Sanitário com Bancada Esculpida em Pedra & Luz Indireta (CAM01)' },
      { src: '/projects/autorais/delicias-da-ana/cardapio-01.webp', label: '14 · Design de Menu Board 01 — Linha de Coxinhas & Combos' },
      { src: '/projects/autorais/delicias-da-ana/cardapio-02.webp', label: '15 · Design de Menu Board 02 — Salgados, Bebidas & Sobremesas' },
      { src: '/projects/autorais/delicias-da-ana/antes-fachada-geral.webp', label: '16 · Antes da Reforma — Fachada Original ("Recanto do Sabor")' },
      { src: '/projects/autorais/delicias-da-ana/antes-fachada-levantamento.webp', label: '17 · Levantamento Métrico de Fachada In Loco (2,67m | 2,86m | 2,81m)' },
      { src: '/projects/autorais/delicias-da-ana/antes-salao-interno.webp', label: '18 · Antes da Reforma — Corredor Interno Estreito (2,65m) com Arco' },
      { src: '/projects/autorais/delicias-da-ana/antes-fundos-levantamento.webp', label: '19 · Antes da Reforma — Levantamento Métrico da Área Úmida de Fundos' },
    ],
  },
  {
    slug: 'barbearia-pais-e-filhos',
    title: 'Barbearia Pais & Filhos',
    subtitle: 'Arquitetura Comercial, Estação Kids & Interiores',
    category: 'Comercial & Gastronomia',
    location: 'Brasil',
    year: 2025,
    scope: ['Levantamento BIM', 'Reforma Comercial', 'Estação Kids', 'Luminotécnica & Marcenaria'],
    description:
      'Reforma comercial com identidade contemporânea: bancadas de corte com espelhos em arco retroiluminados, luminárias anelares suspensas, estação kids temática com cadeira Porsche e videogame, setor de lavatório, copa com lounge de café e sanitário.',
    cover: '/projects/autorais/barbearia-pais-e-filhos/salao-01.webp',
    slides: [
      { src: '/projects/autorais/barbearia-pais-e-filhos/salao-01.webp', label: 'Salão Principal & Recepção — Vista Geral a partir da Entrada (CAM01)' },
      { src: '/projects/autorais/barbearia-pais-e-filhos/salao-02.webp', label: 'Eixo Central de Atendimento & Nicho em Arco Ripado ao Fundo (CAM02)' },
      { src: '/projects/autorais/barbearia-pais-e-filhos/bancadas.webp', label: 'Simetria Frontal — Estações de Corte & Espelhos em Arco Retroiluminados (CAM03)' },
      { src: '/projects/autorais/barbearia-pais-e-filhos/salao-03.webp', label: 'Perspectiva Diagonal das Estações de Corte & Luminárias Anelares LED (CAM04)' },
      { src: '/projects/autorais/barbearia-pais-e-filhos/estacao-kids.webp', label: 'Estação Kids — Poltrona Infantil Porsche Boxster, Console PS4 & TV Gamer (CAM05)' },
      { src: '/projects/autorais/barbearia-pais-e-filhos/lavatorio.webp', label: 'Setor de Lavatório & Contra-Plano para o Salão Principal (CAM06)' },
      { src: '/projects/autorais/barbearia-pais-e-filhos/copa.webp', label: 'Copa & Lounge de Café — Marcenaria, Nespresso, Purificador & Cervejeira (CAM07)' },
      { src: '/projects/autorais/barbearia-pais-e-filhos/banheiro.webp', label: 'Sanitário — Espelho em Arco Retroiluminado, Luz Indireta & Marcenaria Piso-Teto (CAM08)' },
    ],
  },
  {
    slug: 'fachada-rodrigo',
    title: 'Fachada Residencial Rodrigo',
    subtitle: 'Retrofit Volumétrico & Iluminação Noturna',
    category: 'Residencial',
    location: 'Brasil',
    year: 2025,
    scope: ['Retrofit de Fachada', 'Caderno de Materiais', 'Luminotécnica Externa'],
    description:
      'Requalificação completa de fachada residencial com demolição seletiva de elementos antigos, nova marquise em balanço com laje-jardim, revestimento em porcelanato marmorizado, pedra natural e iluminação cênica noturna.',
    cover: '/projects/autorais/fachada-rodrigo/fachada-noite.webp',
    slides: [
      { src: '/projects/autorais/fachada-rodrigo/fachada-noite.webp', label: 'Fachada Final — Cenografia Lumínica Noturna' },
      { src: '/projects/autorais/fachada-rodrigo/fachada-dia.webp', label: 'Fachada Final — Luz Diurna & Materialidade' },
    ],
  },
  {
    slug: 'clinica-dra-michelle',
    title: 'Residência Dra. Michelle',
    subtitle: 'Retrofit de Fachada, Pórtico Iluminado & Living',
    category: 'Residencial',
    location: 'Brasil',
    year: 2024,
    scope: ['Projeto Executivo (R01–R13)', 'Retrofit de Fachada', 'Painel Ripado & Cobogó', 'Living & Estante'],
    description:
      'Reforma arquitetônica residencial com requalificação da fachada frontal, pórtico de garagem com iluminação em sanca LED, elemento vazado em cobogó amarelo, painel amadeirado em espinha-de-peixe com porta mimetizada e sala de estar integrada com estante sob medida.',
    cover: '/projects/autorais/clinica-dra-michelle/fachada-01.webp',
    slides: [
      { src: '/projects/autorais/clinica-dra-michelle/fachada-01.webp', label: 'Fachada Residencial Diurna — Pórtico, Cobogó Amarelo & Paisagismo' },
      { src: '/projects/autorais/clinica-dra-michelle/fachada-noite.webp', label: 'Fachada Noturna — Iluminação Linear em Sanca no Pórtico & Beiral' },
      { src: '/projects/autorais/clinica-dra-michelle/fachada-portico.webp', label: 'Detalhe Noturno do Pórtico — Revestimento em Pedra, Cobogó & Sanca LED' },
      { src: '/projects/autorais/clinica-dra-michelle/fachada-02.webp', label: 'Garagem & Acesso Social — Painel Ripado Espinha-de-Peixe & Cobogó' },
      { src: '/projects/autorais/clinica-dra-michelle/consultorio-01.webp', label: 'Sala de Estar — Sofá em L, Poltrona Platner & Estante em Marcenaria' },
      { src: '/projects/autorais/clinica-dra-michelle/consultorio-02.webp', label: 'Living — Estante Preta e Amadeirada Sob Medida & Iluminação Difusa' },
      { src: '/projects/autorais/clinica-dra-michelle/consultorio-03.webp', label: 'Living — Vista Geral do Estar, Tapete Orgânico & Acesso Social' },
    ],
  },
  {
    slug: 'comedoria-banheiros',
    title: 'Comedoria — Lavabo, Hall & Adega',
    subtitle: 'Arquitetura Comercial, Sanitários & Adega Sob Escada',
    category: 'Comercial & Gastronomia',
    location: 'Brasil',
    year: 2024,
    scope: ['Lavabo & Bancada Esculpida', 'Hall Neon & Iluminação', 'Adega Climatizada Sob Escada'],
    description:
      'Arquitetura de interiores para restaurante e espaço gastronômico: lavabo com cuba esculpida em pedra preta e painel ripado diagonal, hall de acesso em cimento queimado com letreiro neon "Comedoria" e adega climatizada sob escada com dupla cave e expositor de rolhas.',
    cover: '/projects/autorais/comedoria-banheiros/vista-01.webp',
    slides: [
      { src: '/projects/autorais/comedoria-banheiros/vista-01.webp', label: 'Lavabo — Bancada Esculpida em Pedra Preta, Painel Ripado Diagonal & Espelho LED' },
      { src: '/projects/autorais/comedoria-banheiros/vista-02.webp', label: 'Hall de Acesso — Parede em Cimento Queimado, Arandelas Industriais & Neon "Comedoria"' },
      { src: '/projects/autorais/comedoria-banheiros/vista-03.webp', label: 'Circulação & Hall dos Sanitários — Cimento Queimado & Iluminação de Destaque' },
      { src: '/projects/autorais/comedoria-banheiros/vista-04.webp', label: 'Adega Climatizada Sob Escada — Dupla Cave Danby, Expositor de Rolhas & Guarda-Corpo em Vidro' },
    ],
  },
]

const ARCHVIZ_DEVELOPMENTS: ArchvizDevelopment[] = [
  {
    slug: 'central-parque',
    title: 'Central Parque',
    category: 'Empreendimento Residencial',
    location: 'Curitiba, PR',
    year: 2024,
    description:
      'Visualização completa de lançamento residencial vertical: portaria e embasamento, apartamentos tipo e garden, terraço técnico e complexo de lazer.',
    cover: '/projects/central-parque.webp',
    renders: [
      { src: '/projects/central-parque.webp', label: 'Portaria, Embasamento & Torres Residenciais' },
      { src: '/renders/central-parque-piscina.webp', label: 'Piscina & Deck Solarium' },
      { src: '/renders/central-parque-living.webp', label: 'Living Integrado — Interiores' },
      { src: '/renders/central-parque-garden.webp', label: 'Apartamento Garden Privativo' },
      { src: '/renders/central-parque-varanda.webp', label: 'Terraço Técnico & Área de Serviço com Veneziana Ripada' },
      { src: '/renders/quadra-esportes.webp', label: 'Quadra Poliesportiva' },
      { src: '/renders/bicicletario.webp', label: 'Bicicletário & Mobilidade' },
    ],
  },
  {
    slug: 'raizes',
    title: 'Raízes',
    category: 'Condomínio Residencial',
    location: 'Capão Bonito, SP',
    year: 2024,
    description:
      'Narrativa lumínica em dois tempos (golden hour e noturna) para portaria e fachada de condomínio, acompanhada das áreas de convívio e lazer externo.',
    cover: '/projects/raizes-manha.webp',
    renders: [
      { src: '/projects/raizes-manha.webp', label: 'Golden Hour — Portaria & Fachada Entardecer' },
      { src: '/renders/raizes-fachada-noite.webp', label: 'Cenografia Lumínica Noturna' },
      { src: '/renders/raizes-gourmet.webp', label: 'Churrasqueira & Espaço Gourmet' },
      { src: '/renders/praca-externa.webp', label: 'Praça Externa & Convivência' },
    ],
  },
  {
    slug: 'goya',
    title: 'Goya',
    category: 'Residencial Vertical',
    location: 'São Paulo, SP',
    year: 2024,
    description:
      'Imagens de lançamento focadas nas áreas comuns decoradas: espaço gourmet com ilha escultórica, salão de festas, salão de jogos e terraço externo paisagístico.',
    cover: '/projects/goya-gourmet.webp',
    renders: [
      { src: '/projects/goya-gourmet.webp', label: 'Espaço Gourmet & Ilha Central' },
      { src: '/renders/goya-externa.webp', label: 'Área Externa & Paisagismo' },
      { src: '/renders/salao-festas.webp', label: 'Salão de Festas & Eventos' },
      { src: '/renders/salao-jogos.webp', label: 'Salão de Jogos & Convivência' },
    ],
  },
  {
    slug: 'moradas-do-bosque',
    title: 'Moradas do Bosque',
    category: 'Condomínio Horizontal',
    location: 'Campinas, SP',
    year: 2023,
    description:
      'Visualização arquitetônica de condomínio fechado em meio à vegetação nativa, destacando clube aquático com deck solarium e quadras de beach tennis.',
    cover: '/projects/moradas-bosque.webp',
    renders: [
      { src: '/projects/moradas-bosque.webp', label: 'Piscina, Deck Solarium & Playground ao Fundo' },
      { src: '/renders/moradas-beachtennis.webp', label: 'Complexo Esportivo Beach Tennis' },
    ],
  },
  {
    slug: 'estudio-bola',
    title: 'Estúdio Bola',
    category: 'Flagship & Comercial',
    location: 'São Paulo, SP',
    year: 2023,
    description:
      'Estudo de transparência e volumetria minimalista para flagship de mobiliário assinado em São Paulo, destacando fachada branca com aberturas circulares e showroom térreo integrado à calçada.',
    cover: '/projects/estudio-bola.webp',
    renders: [
      { src: '/projects/estudio-bola.webp', label: 'Fachada Minimalista — Janelas Circulares & Vitrine Térrea' },
    ],
  },
  {
    slug: 'espaco-novo-mercato',
    title: 'Espaço Novo Mercato',
    category: 'Varejo Especializado',
    location: 'São Paulo, SP',
    year: 2024,
    description:
      'Visualização comercial para empório gastronômico e vinhoteca, destacando marcenaria retroiluminada, exposição de rótulos e circulação de loja.',
    cover: '/renders/espaco-novo-adega.webp',
    renders: [
      { src: '/renders/espaco-novo-adega.webp', label: 'Adega & Vinhoteca Climatizada' },
      { src: '/renders/espaco-novo-comercial.webp', label: 'Salão Principal & Empório Mercato' },
    ],
  },
  {
    slug: 'interiores-e-areas-comuns',
    title: 'Frederico Jacobi & Estudos de Detalhe',
    category: 'Interiores & Áreas Comuns',
    location: 'São Paulo, SP',
    year: 2024,
    description:
      'Série de visualização focada em texturas táteis, iluminação natural rasante, marcenaria de precisão e ambientes internos de alto padrão.',
    cover: '/renders/instagram-escritorio.webp',
    renders: [
      { src: '/renders/instagram-escritorio.webp', label: 'Home Office Autoral — Luz Natural & Detalhe' },
      { src: '/renders/instagram-suite.webp', label: 'Suíte Master — Atmosfera & Texturas' },
      { src: '/renders/brinquedoteca.webp', label: 'Frederico Jacobi — Brinquedoteca & Espaço Kids' },
    ],
  },
]

type TabId = 'arquitetura' | 'archviz' | 'modelagem-3d'

const TABS: { id: TabId; num: string; label: string; badge: string; summary: string }[] = [
  {
    id: 'arquitetura',
    num: '01',
    label: 'Projetos de Arquitetura',
    badge: `${String(AUTORAIS_PROJECTS.length).padStart(2, '0')} PROJETOS`,
    summary: 'Projetos autorais completos de arquitetura residencial, comercial, reformas e executivo BIM.',
  },
  {
    id: 'archviz',
    num: '02',
    label: 'ArchViz',
    badge: `${String(ARCHVIZ_DEVELOPMENTS.length).padStart(2, '0')} EMPREENDIMENTOS`,
    summary: 'Catálogo de visualização arquitetônica organizado por empreendimento e cliente.',
  },
  {
    id: 'modelagem-3d',
    num: '03',
    label: 'Modelagem 3D',
    badge: '29 MODELOS .GLB',
    summary: 'Blocos e ativos 3D de alta precisão prontos para girar no navegador.',
  },
]

const AUTORAL_FILTERS: ('Todos' | AutoralCategory)[] = [
  'Todos',
  'Residencial',
  'Comercial & Gastronomia',
]

type LightboxState = {
  kicker: string
  title: string
  slides: RenderSlide[]
  index: number
} | null

export default function PortfolioCatalogHub() {
  const [activeTab, setActiveTab] = useState<TabId>('arquitetura')
  const [autoralFilter, setAutoralFilter] = useState<'Todos' | AutoralCategory>('Todos')
  const [lightbox, setLightbox] = useState<LightboxState>(null)
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    arquitetura: null,
    archviz: null,
    'modelagem-3d': null,
  })

  const switchTab = (tab: TabId, updateHash = true) => {
    setActiveTab(tab)
    if (updateHash && typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tab}`)
    }
    window.setTimeout(() => {
      ScrollTrigger.refresh()
    }, 80)
  }

  // Deep-link via URL hash (#arquitetura, #archviz, #assets-3d, #modelagem-3d ou slug de projeto)
  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.replace('#', '').trim().toLowerCase()
      if (!rawHash) return

      if (rawHash === 'arquitetura' || rawHash === 'autorais') {
        setActiveTab('arquitetura')
        return
      }
      if (rawHash === 'archviz' || rawHash === 'projetos' || rawHash === 'galeria-renders') {
        setActiveTab('archviz')
        return
      }
      if (rawHash === 'modelagem-3d' || rawHash === 'assets-3d' || rawHash === 'catalogo-3d') {
        setActiveTab('modelagem-3d')
        window.setTimeout(() => {
          ScrollTrigger.refresh()
          const target = document.getElementById(rawHash)
          if (target) target.scrollIntoView({ behavior: 'smooth' })
        }, 140)
        return
      }

      const autoralMatch = AUTORAIS_PROJECTS.find((p) => p.slug === rawHash)
      if (autoralMatch) {
        setActiveTab('arquitetura')
        window.setTimeout(() => {
          document.getElementById(`project-${autoralMatch.slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 120)
        return
      }

      const archvizMatch = ARCHVIZ_DEVELOPMENTS.find((d) => d.slug === rawHash)
      if (archvizMatch) {
        setActiveTab('archviz')
        window.setTimeout(() => {
          document.getElementById(`dev-${archvizMatch.slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 120)
      }
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  // Controle de teclado no Lightbox
  useEffect(() => {
    if (!lightbox) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setLightbox(null)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setLightbox((prev) =>
          prev ? { ...prev, index: (prev.index + 1) % prev.slides.length } : null
        )
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setLightbox((prev) =>
          prev
            ? { ...prev, index: (prev.index - 1 + prev.slides.length) % prev.slides.length }
            : null
        )
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightbox])

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, current: TabId) => {
    const idx = TABS.findIndex((t) => t.id === current)
    let nextIdx = idx
    if (event.key === 'ArrowRight') nextIdx = (idx + 1) % TABS.length
    else if (event.key === 'ArrowLeft') nextIdx = (idx - 1 + TABS.length) % TABS.length
    else if (event.key === 'Home') nextIdx = 0
    else if (event.key === 'End') nextIdx = TABS.length - 1
    else return

    event.preventDefault()
    const nextTab = TABS[nextIdx].id
    switchTab(nextTab)
    tabRefs.current[nextTab]?.focus()
  }

  const filteredAutorais =
    autoralFilter === 'Todos'
      ? AUTORAIS_PROJECTS
      : AUTORAIS_PROJECTS.filter((p) => p.category === autoralFilter)

  const currentSlide = lightbox ? lightbox.slides[lightbox.index] ?? lightbox.slides[0] : null

  return (
    <div className="portfolio-hub">
      {/* Barra de 3 Abas Independentes */}
      <div className="portfolio-hub-nav-wrap">
        <div className="portfolio-hub-tabs" role="tablist" aria-label="Frentes do portfólio Ameno Studio">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el
                }}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`portfolio-hub-tab${isActive ? ' is-active' : ''}`}
                onClick={() => switchTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
              >
                <div className="portfolio-hub-tab-top">
                  <span className="portfolio-hub-tab-num">{tab.num}</span>
                  <span className="portfolio-hub-tab-badge">{tab.badge}</span>
                </div>
                <strong className="portfolio-hub-tab-label">{tab.label}</strong>
                <span className="portfolio-hub-tab-summary">{tab.summary}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ABA 01 — PROJETOS DE ARQUITETURA (AUTORAIS) */}
      <div
        id="panel-arquitetura"
        role="tabpanel"
        aria-labelledby="tab-arquitetura"
        hidden={activeTab !== 'arquitetura'}
        className="portfolio-hub-panel"
      >
        {activeTab === 'arquitetura' && (
          <section className="portfolio-arch-section" aria-label="Projetos Autorais de Arquitetura">
            <div className="portfolio-section-bar">
              <div>
                <span className="section-tag">01 · ARQUITETURA AUTORAL & EXECUTIVO</span>
                <h2 className="portfolio-section-heading">
                  Projetos assinados do <em className="font-editorial">estudo preliminar à obra.</em>
                </h2>
              </div>

              <div className="portfolio-filter-group" role="group" aria-label="Filtrar projetos de arquitetura por tipologia">
                {AUTORAL_FILTERS.map((filter) => {
                  const count =
                    filter === 'Todos'
                      ? AUTORAIS_PROJECTS.length
                      : AUTORAIS_PROJECTS.filter((p) => p.category === filter).length
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setAutoralFilter(filter)}
                      className={`portfolio-filter-pill${autoralFilter === filter ? ' is-active' : ''}`}
                      aria-pressed={autoralFilter === filter}
                    >
                      <span>{filter}</span>
                      <small>{String(count).padStart(2, '0')}</small>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="portfolio-arch-grid">
              {filteredAutorais.map((project, index) => (
                <article
                  key={project.slug}
                  id={`project-${project.slug}`}
                  className="portfolio-arch-card"
                >
                  <div className="portfolio-arch-card-top">
                    <span className="portfolio-arch-card-index">
                      <strong>#{String(index + 1).padStart(2, '0')}</strong> · {project.category.toUpperCase()}
                    </span>
                    <span className="portfolio-arch-card-year">
                      {project.location} · <em>{project.year}</em>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="portfolio-arch-card-media"
                    onClick={() =>
                      setLightbox({
                        kicker: `PROJETO DE ARQUITETURA · ${project.category.toUpperCase()} · ${project.year}`,
                        title: project.title,
                        slides: project.slides,
                        index: 0,
                      })
                    }
                    aria-label={`Abrir caderno de imagens de ${project.title}`}
                  >
                    <Image
                      src={project.cover}
                      alt={`${project.title} — ${project.subtitle}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      preload={index < 2}
                    />
                    <div className="portfolio-arch-card-wash" aria-hidden="true" />
                    <span className="portfolio-arch-card-count">
                      {String(project.slides.length).padStart(2, '0')} LÂMINAS ↗
                    </span>
                  </button>

                  <div className="portfolio-arch-card-body">
                    <div className="portfolio-arch-card-titles">
                      <span className="portfolio-arch-card-subtitle">{project.subtitle}</span>
                      <h3 className="portfolio-arch-card-title">{project.title}</h3>
                    </div>

                    <p className="portfolio-arch-card-desc">{project.description}</p>

                    <div className="portfolio-arch-scope" aria-label="Escopo desenvolvido">
                      {project.scope.map((item) => (
                        <span key={item} className="portfolio-arch-scope-tag">
                          {item}
                        </span>
                      ))}
                    </div>

                    {/* Miniaturas rápidas das lâminas do projeto */}
                    <div className="portfolio-card-thumbs" aria-label={`Vistas de ${project.title}`}>
                      {project.slides.slice(0, 5).map((slide, sIdx) => (
                        <button
                          key={slide.src}
                          type="button"
                          className="portfolio-card-thumb"
                          onClick={() =>
                            setLightbox({
                              kicker: `PROJETO DE ARQUITETURA · ${project.category.toUpperCase()} · ${project.year}`,
                              title: project.title,
                              slides: project.slides,
                              index: sIdx,
                            })
                          }
                          aria-label={`Ver ${slide.label}`}
                          title={slide.label}
                        >
                          <Image src={slide.src} alt={slide.label} fill sizes="96px" className="object-cover" />
                          {sIdx === 4 && project.slides.length > 5 && (
                            <span className="portfolio-card-thumb-more">
                              +{project.slides.length - 5}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div
                      className="portfolio-arch-card-footer"
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}
                    >
                      {project.caseStudyUrl && (
                        <Link
                          href={project.caseStudyUrl}
                          className="portfolio-arch-open-btn"
                          style={{
                            background: 'var(--red)',
                            borderColor: 'var(--red)',
                            color: 'var(--white)',
                            textDecoration: 'none',
                          }}
                        >
                          <span>
                            LER DOSSIÊ TÉCNICO COMPLETO ({String(project.slides.length).padStart(2, '0')} LÂMINAS)
                          </span>
                          <em aria-hidden="true" style={{ color: 'var(--white)' }}>
                            ↗
                          </em>
                        </Link>
                      )}
                      <button
                        type="button"
                        className="portfolio-arch-open-btn"
                        onClick={() =>
                          setLightbox({
                            kicker: `PROJETO DE ARQUITETURA · ${project.category.toUpperCase()} · ${project.year}`,
                            title: project.title,
                            slides: project.slides,
                            index: 0,
                          })
                        }
                      >
                        <span>
                          {project.caseStudyUrl
                            ? `ABRIR ÁLBUM RÁPIDO (${String(project.slides.length).padStart(2, '0')} IMAGENS)`
                            : `ABRIR PROJETO COMPLETO (${String(project.slides.length).padStart(2, '0')} IMAGENS)`}
                        </span>
                        <em aria-hidden="true">↗</em>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ABA 02 — ARCHVIZ (CATÁLOGO ORGANIZADO POR EMPREENDIMENTO) */}
      <div
        id="panel-archviz"
        role="tabpanel"
        aria-labelledby="tab-archviz"
        hidden={activeTab !== 'archviz'}
        className="portfolio-hub-panel"
      >
        {activeTab === 'archviz' && (
          <section className="portfolio-arch-section" aria-label="Catálogo de Empreendimentos ArchViz">
            <div className="portfolio-section-bar">
              <div>
                <span className="section-tag">02 · VISUALIZAÇÃO ARQUITETÔNICA (ARCHVIZ)</span>
                <h2 className="portfolio-section-heading">
                  Empreendimentos em cena para <em className="font-editorial">incorporadoras e estúdios.</em>
                </h2>
              </div>
              <p className="portfolio-section-note">
                Selecione qualquer empreendimento abaixo para abrir o álbum completo de renders em alta resolução.
              </p>
            </div>

            <div className="portfolio-arch-grid">
              {ARCHVIZ_DEVELOPMENTS.map((dev, index) => (
                <article
                  key={dev.slug}
                  id={`dev-${dev.slug}`}
                  className="portfolio-arch-card"
                >
                  <div className="portfolio-arch-card-top">
                    <span className="portfolio-arch-card-index">
                      <strong>#{String(index + 1).padStart(2, '0')}</strong> · {dev.category.toUpperCase()}
                    </span>
                    <span className="portfolio-arch-card-year">
                      {dev.location} · <em>{dev.year}</em>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="portfolio-arch-card-media"
                    onClick={() =>
                      setLightbox({
                        kicker: `ARCHVIZ · ${dev.category.toUpperCase()} · ${dev.location.toUpperCase()}`,
                        title: dev.title,
                        slides: dev.renders,
                        index: 0,
                      })
                    }
                    aria-label={`Abrir álbum ArchViz de ${dev.title}`}
                  >
                    <Image
                      src={dev.cover}
                      alt={`${dev.title} — ${dev.category}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      preload={index < 2}
                    />
                    <div className="portfolio-arch-card-wash" aria-hidden="true" />
                    <span className="portfolio-arch-card-count">
                      {String(dev.renders.length).padStart(2, '0')} RENDERS ↗
                    </span>
                  </button>

                  <div className="portfolio-arch-card-body">
                    <div className="portfolio-arch-card-titles">
                      <span className="portfolio-arch-card-subtitle">
                        {dev.location} · {dev.category}
                      </span>
                      <h3 className="portfolio-arch-card-title">{dev.title}</h3>
                    </div>

                    <p className="portfolio-arch-card-desc">{dev.description}</p>

                    <div className="portfolio-card-thumbs" aria-label={`Renders de ${dev.title}`}>
                      {dev.renders.slice(0, 5).map((render, rIdx) => (
                        <button
                          key={render.src}
                          type="button"
                          className="portfolio-card-thumb"
                          onClick={() =>
                            setLightbox({
                              kicker: `ARCHVIZ · ${dev.category.toUpperCase()} · ${dev.location.toUpperCase()}`,
                              title: dev.title,
                              slides: dev.renders,
                              index: rIdx,
                            })
                          }
                          aria-label={`Ver ${render.label}`}
                          title={render.label}
                        >
                          <Image src={render.src} alt={render.label} fill sizes="96px" className="object-cover" />
                          {rIdx === 4 && dev.renders.length > 5 && (
                            <span className="portfolio-card-thumb-more">
                              +{dev.renders.length - 5}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="portfolio-arch-card-footer">
                      <button
                        type="button"
                        className="portfolio-arch-open-btn"
                        onClick={() =>
                          setLightbox({
                            kicker: `ARCHVIZ · ${dev.category.toUpperCase()} · ${dev.location.toUpperCase()}`,
                            title: dev.title,
                            slides: dev.renders,
                            index: 0,
                          })
                        }
                      >
                        <span>VER ÁLBUM DO EMPREENDIMENTO · {String(dev.renders.length).padStart(2, '0')} RENDERS</span>
                        <em aria-hidden="true">↗</em>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ABA 03 — MODELAGEM 3D (MANTIDA EXATAMENTE COMO ESTÁ) */}
      <div
        id="panel-modelagem-3d"
        role="tabpanel"
        aria-labelledby="tab-modelagem-3d"
        hidden={activeTab !== 'modelagem-3d'}
        className="portfolio-hub-panel"
      >
        {activeTab === 'modelagem-3d' && <AssetsSection />}
      </div>

      {/* LIGHTBOX DE ÁLBUM EM TELA CHEIA (ARQUITETURA & ARCHVIZ) */}
      {lightbox && currentSlide && (
        <div
          className="project-album-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Álbum de ${lightbox.title}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(null)
          }}
        >
          <div className="project-album-dialog">
            <div className="project-album-header">
              <div className="project-album-header-left">
                <span className="project-album-kicker">{lightbox.kicker}</span>
                <h3 className="project-album-title">
                  {lightbox.title}
                  <span> — {currentSlide.label}</span>
                </h3>
              </div>

              <div className="project-album-actions">
                <span className="project-album-counter">
                  {String(lightbox.index + 1).padStart(2, '0')} / {String(lightbox.slides.length).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  className="asset-carousel-btn"
                  onClick={() =>
                    setLightbox((prev) =>
                      prev
                        ? { ...prev, index: (prev.index - 1 + prev.slides.length) % prev.slides.length }
                        : null
                    )
                  }
                  aria-label="Imagem anterior"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="asset-carousel-btn"
                  onClick={() =>
                    setLightbox((prev) =>
                      prev ? { ...prev, index: (prev.index + 1) % prev.slides.length } : null
                    )
                  }
                  aria-label="Próxima imagem"
                >
                  →
                </button>
                <button
                  type="button"
                  className="assets-modal-close"
                  onClick={() => setLightbox(null)}
                >
                  FECHAR [ESC]
                </button>
              </div>
            </div>

            <div className="project-album-stage">
              <Image
                key={currentSlide.src}
                src={currentSlide.src}
                alt={`${lightbox.title} — ${currentSlide.label}`}
                fill
                sizes="94vw"
                className="object-contain"
                priority
              />
            </div>

            <div className="project-album-thumbs" role="tablist" aria-label={`Imagens de ${lightbox.title}`}>
              {lightbox.slides.map((slide, idx) => (
                <button
                  key={slide.src}
                  type="button"
                  role="tab"
                  aria-selected={idx === lightbox.index}
                  className={`project-album-thumb${idx === lightbox.index ? ' is-active' : ''}`}
                  onClick={() => setLightbox((prev) => (prev ? { ...prev, index: idx } : null))}
                >
                  <div className="project-album-thumb-media">
                    <Image src={slide.src} alt={slide.label} fill sizes="140px" className="object-cover" />
                  </div>
                  <span>
                    {String(idx + 1).padStart(2, '0')} · {slide.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
