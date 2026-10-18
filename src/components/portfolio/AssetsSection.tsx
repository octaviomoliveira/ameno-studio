'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const AssetViewer = dynamic(() => import('./AssetViewer'), {
  ssr: false,
  loading: () => (
    <div className="asset-viewer-skeleton" role="status">
      <span className="sr-only">Carregando modelo 3D…</span>
    </div>
  ),
})

export type Asset3D = {
  slug: string
  name: string
  description: string
  glbSrc: string
  fallbackImg: string
  renders: { src: string; alt: string }[]
}

// Escolha aqui os 5 modelos (pelo slug) que aparecem no carrossel principal em destaque.
// Todos os demais itens continuam acessíveis no grid clicável ("Olhar mais") logo abaixo.
const FEATURED_SLUGS: string[] = [
  'cadeira-raia',
  'cadeira-axis',
  'poltrona-pelicano',
  'cadeira-archi',
  'lg-zvnq48gm2aa',
]

const ASSETS: Asset3D[] = [
  {
    slug: 'cadeira-raia',
    name: 'Cadeira Raia',
    description: 'Modelagem em 3ds Max com geometria precisa e leveza de arquivo. Pronta para renderização em SketchUp e Enscape — aparece bem até no primeiro plano.',
    glbSrc: '/assets/3d/cadeira-raia/cadeira-raia.glb',
    fallbackImg: '/assets/3d/cadeira-raia/cadeira-raia-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-raia/cadeira-raia-render-01.webp', alt: 'Cadeira Raia — vista frontal renderizada' },
      { src: '/assets/3d/cadeira-raia/cadeira-raia-render-02.webp', alt: 'Cadeira Raia — vista traseira renderizada' },
    ],
  },
  {
    slug: 'cadeira-axis',
    name: 'Cadeira Axis',
    description: 'Modelagem em 3ds Max com atenção aos detalhes estruturais. Disponível em versão alta e baixa, pronta para SketchUp e Enscape.',
    glbSrc: '/assets/3d/cadeira-axis/cadeira-axis.glb',
    fallbackImg: '/assets/3d/cadeira-axis/cadeira-axis-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-axis/cadeira-axis-render-01.webp', alt: 'Cadeira Axis — vista frontal renderizada' },
      { src: '/assets/3d/cadeira-axis/cadeira-axis-render-02.webp', alt: 'Cadeira Axis — vista traseira renderizada' },
    ],
  },
  {
    slug: 'poltrona-pelicano',
    name: 'Poltrona Pelicano',
    description: 'Espaldar em leque com fusos torneados à mão, braços escultóricos e assento em palhinha. Modelagem fiel ao original brasileiro — cada curva da madeira preservada no arquivo.',
    glbSrc: '/assets/3d/poltrona-pelicano/poltrona-pelicano.glb',
    fallbackImg: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-01.webp', alt: 'Poltrona Pelicano — vista em perspectiva' },
      { src: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-02.webp', alt: 'Poltrona Pelicano — vista frontal' },
      { src: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-03.webp', alt: 'Poltrona Pelicano — vista lateral' },
      { src: '/assets/3d/poltrona-pelicano/poltrona-pelicano-render-04.webp', alt: 'Poltrona Pelicano — detalhe do espaldar' },
    ],
  },
  {
    slug: 'cadeira-archi',
    name: 'Cadeira Archi',
    description: 'Ergonomia e caráter. Encosto bimatéria com tecido e couro, braços em madeira maciça e base estrela de cinco pontas com rodízios. Modelagem pronta para ambientes corporativos e residenciais de alto padrão.',
    glbSrc: '/assets/3d/cadeira-archi/cadeira-archi.glb',
    fallbackImg: '/assets/3d/cadeira-archi/cadeira-archi-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-archi/cadeira-archi-render-01.webp', alt: 'Cadeira Archi — vista frontal' },
      { src: '/assets/3d/cadeira-archi/cadeira-archi-render-02.webp', alt: 'Cadeira Archi — vista traseira' },
    ],
  },
  {
    slug: 'lg-zvnq48gm2aa',
    name: 'Ar-Condicionado LG ZVNQ48GM2AA',
    description: 'Unidade evaporadora piso-teto LG Inverter 48.000 BTUs. Modelagem em 3ds Max com aletas direcionais, grelhas inferiores e curvatura do gabinete fiéis às especificações técnicas para projetos comerciais e corporativos.',
    glbSrc: '/assets/3d/lg-zvnq48gm2aa/lg-zvnq48gm2aa.glb',
    fallbackImg: '/assets/3d/lg-zvnq48gm2aa/lg-zvnq48gm2aa-render-01.webp',
    renders: [
      { src: '/assets/3d/lg-zvnq48gm2aa/lg-zvnq48gm2aa-render-01.webp', alt: 'Ar-Condicionado LG ZVNQ48GM2AA — vista em perspectiva' },
      { src: '/assets/3d/lg-zvnq48gm2aa/lg-zvnq48gm2aa-render-02.webp', alt: 'Ar-Condicionado LG ZVNQ48GM2AA — detalhe das aletas e gabinete' },
    ],
  },
  {
    slug: 'dlock-dlh-4800-pnb',
    name: 'Fechadura Digital DLock DLH-4800-PNB',
    description: 'Fechadura eletrônica biométrica de embutir em alumínio preto anodizado e painel touch acrílico. Modelagem em 3ds Max com leitor biométrico integrado à maçaneta, teclado luminoso e cilindro mecânico traseiro.',
    glbSrc: '/assets/3d/dlock-dlh-4800-pnb/dlock-dlh-4800-pnb.glb',
    fallbackImg: '/assets/3d/dlock-dlh-4800-pnb/dlock-dlh-4800-pnb-render-01.webp',
    renders: [
      { src: '/assets/3d/dlock-dlh-4800-pnb/dlock-dlh-4800-pnb-render-01.webp', alt: 'Fechadura Digital DLock DLH-4800-PNB — vista frontal estúdio' },
      { src: '/assets/3d/dlock-dlh-4800-pnb/dlock-dlh-4800-pnb-render-02.webp', alt: 'Fechadura Digital DLock DLH-4800-PNB — detalhe painel touch e maçaneta' },
      { src: '/assets/3d/dlock-dlh-4800-pnb/dlock-dlh-4800-pnb-render-03.webp', alt: 'Fechadura Digital DLock DLH-4800-PNB — close-up da maçaneta biométrica' },
    ],
  },
  {
    slug: 'dlock-dl-4800-2022',
    name: 'Fechadura Digital DLock DL-4800 (2022)',
    description: 'Fechadura eletrônica biométrica versão 2022 com painel touch inteiriço em acrílico black piano, leitor de cartão RFID integrado e sensor biométrico côncavo na maçaneta.',
    glbSrc: '/assets/3d/dlock-dl-4800-2022/dlock-dl-4800-2022.glb',
    fallbackImg: '/assets/3d/dlock-dl-4800-2022/dlock-dl-4800-2022-render-01.webp',
    renders: [
      { src: '/assets/3d/dlock-dl-4800-2022/dlock-dl-4800-2022-render-01.webp', alt: 'Fechadura Digital DLock DL-4800 (2022) — vista frontal estúdio 4K' },
      { src: '/assets/3d/dlock-dl-4800-2022/dlock-dl-4800-2022-render-02.webp', alt: 'Fechadura Digital DLock DL-4800 (2022) — detalhe painel touch, cartão RFID e maçaneta' },
      { src: '/assets/3d/dlock-dl-4800-2022/dlock-dl-4800-2022-render-03.webp', alt: 'Fechadura Digital DLock DL-4800 (2022) — close-up da maçaneta e leitor biométrico côncavo' },
    ],
  },
  {
    slug: 'cadeira-office-volo',
    name: 'Cadeira Office Volo',
    description: 'Cadeira giratória executiva com assento e encosto estofados em couro cinza, estrutura tubular metálica com apoios de braço em madeira natural, suporte dorsal escultural e base piramidal de cinco pontas com rodízios.',
    glbSrc: '/assets/3d/cadeira-office-volo/cadeira-office-volo.glb',
    fallbackImg: '/assets/3d/cadeira-office-volo/cadeira-office-volo-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-office-volo/cadeira-office-volo-render-01.webp', alt: 'Cadeira Office Volo — vista frontal em estúdio' },
      { src: '/assets/3d/cadeira-office-volo/cadeira-office-volo-render-02.webp', alt: 'Cadeira Office Volo — vista traseira e detalhe do suporte dorsal' },
    ],
  },
  {
    slug: 'cadeira-lirio',
    name: 'Cadeira Lírio',
    description: 'Cadeira de jantar com encosto envolvente em tela de palhinha sextavada e moldura curvada em madeira maciça, assento estofado em linho claro e pernas torneadas com sapatas metálicas.',
    glbSrc: '/assets/3d/cadeira-lirio/cadeira-lirio.glb',
    fallbackImg: '/assets/3d/cadeira-lirio/cadeira-lirio-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-lirio/cadeira-lirio-render-01.webp', alt: 'Cadeira Lírio — vista em perspectiva em estúdio' },
    ],
  },
  {
    slug: 'cadeira-gralha',
    name: 'Cadeira Gralha',
    description: 'Cadeira contemporânea com estrutura metálica esguia em A, articulação aparente nas laterais do encosto curvo anatômico e assento estofado suspenso.',
    glbSrc: '/assets/3d/cadeira-gralha/cadeira-gralha.glb',
    fallbackImg: '/assets/3d/cadeira-gralha/cadeira-gralha-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-gralha/cadeira-gralha-render-01.webp', alt: 'Cadeira Gralha — vista em perspectiva em estúdio' },
    ],
  },
  {
    slug: 'banqueta-soa',
    name: 'Banqueta Soa',
    description: 'Banqueta alta com estrutura tubular metálica contínua, apoio para os pés integrado em H, encosto suspenso revestido em couro pespontado e assento estofado anatômico.',
    glbSrc: '/assets/3d/banqueta-soa/banqueta-soa.glb',
    fallbackImg: '/assets/3d/banqueta-soa/banqueta-soa-render-01.webp',
    renders: [
      { src: '/assets/3d/banqueta-soa/banqueta-soa-render-01.webp', alt: 'Banqueta Soa — vista em perspectiva em estúdio' },
    ],
  },
  {
    slug: 'banqueta-beet',
    name: 'Banqueta Beet',
    description: 'Banqueta giratória regulável com concha estofada orgânica e abas laterais envolventes, apoio de pés metálico trapezoidal integrado, coluna a gás com alavanca e base quadrada de cantos arredondados.',
    glbSrc: '/assets/3d/banqueta-beet/banqueta-beet.glb',
    fallbackImg: '/assets/3d/banqueta-beet/banqueta-beet-render-01.webp',
    renders: [
      { src: '/assets/3d/banqueta-beet/banqueta-beet-render-01.webp', alt: 'Banqueta Beet — vista em perspectiva em estúdio' },
    ],
  },
  {
    slug: 'cadeira-amanda-presidente',
    name: 'Cadeira Amanda Presidente',
    description: 'Cadeira presidente giratória bimatéria em tecido tramado e camurça aveludada, com encosto alto, apoio de cabeça estofado, braços envolventes integrados à concha e base estrela de cinco pontas em alumínio polido com rodízios.',
    glbSrc: '/assets/3d/cadeira-amanda-presidente/cadeira-amanda-presidente.glb',
    fallbackImg: '/assets/3d/cadeira-amanda-presidente/cadeira-amanda-presidente-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-amanda-presidente/cadeira-amanda-presidente-render-01.webp', alt: 'Cadeira Amanda Presidente — vista em perspectiva em estúdio' },
      { src: '/assets/3d/cadeira-amanda-presidente/cadeira-amanda-presidente-render-02.webp', alt: 'Cadeira Amanda Presidente — vista frontal em estúdio' },
      { src: '/assets/3d/cadeira-amanda-presidente/cadeira-amanda-presidente-render-03.webp', alt: 'Cadeira Amanda Presidente — vista traseira em estúdio' },
    ],
  },
  {
    slug: 'mesa-lateral-nova',
    name: 'Mesa Lateral Nova',
    description: 'Mesa lateral contemporânea com tampo circular chanfrado em madeira ebanizada, haste metálica deslocada e base cilíndrica encapada em couro natural pespontado com botão metálico.',
    glbSrc: '/assets/3d/mesa-lateral-nova/mesa-lateral-nova.glb',
    fallbackImg: '/assets/3d/mesa-lateral-nova/mesa-lateral-nova-render-01.webp',
    renders: [
      { src: '/assets/3d/mesa-lateral-nova/mesa-lateral-nova-render-01.webp', alt: 'Mesa Lateral Nova — vista em perspectiva em estúdio' },
    ],
  },
  {
    slug: 'puff-bonni',
    name: 'Puff Bonni',
    description: 'Puff cilíndrico em dois volumes concêntricos, com assento estofado de bordas abauladas e base recuada revestida em madeira natural ou couro com costuras verticais aparentes.',
    glbSrc: '/assets/3d/puff-bonni/puff-bonni.glb',
    fallbackImg: '/assets/3d/puff-bonni/puff-bonni-render-01.webp',
    renders: [
      { src: '/assets/3d/puff-bonni/puff-bonni-render-01.webp', alt: 'Puff Bonni — versões em bouclé com madeira e couro em estúdio' },
    ],
  },
  {
    slug: 'poltrona-agatha',
    name: 'Poltrona Agatha',
    description: 'Poltrona giratória lounge com concha curva envolvente de abas pronunciadas, apoio de cabeça suspenso, assento cilíndrico generoso em tecido bouclé estruturado e base em disco metálico preto fosco.',
    glbSrc: '/assets/3d/poltrona-agatha/poltrona-agatha.glb',
    fallbackImg: '/assets/3d/poltrona-agatha/poltrona-agatha-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-agatha/poltrona-agatha-render-01.webp', alt: 'Poltrona Agatha — vista em perspectiva em estúdio' },
    ],
  },
  {
    slug: 'poltrona-abassata',
    name: 'Poltrona Abassata',
    description: 'Poltrona contemporânea com estrutura tubular em aço carbono preto fosco, cinta traseira estrutural com pespontos contrastantes, braços estofados dobrados sobre o chassi e almofadas generosas em bouclé.',
    glbSrc: '/assets/3d/poltrona-abassata/poltrona-abassata.glb',
    fallbackImg: '/assets/3d/poltrona-abassata/poltrona-abassata-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-abassata/poltrona-abassata-render-01.webp', alt: 'Poltrona Abassata — vista em perspectiva em estúdio' },
    ],
  },
  {
    slug: 'vidro-martelado',
    name: 'Vidro Martelado',
    description: 'Tampos circulares em vidro martelado de espessura maciça com bordas polidas e relevo orgânico sutil, desenvolvidos para composições de mesas laterais e de centro.',
    glbSrc: '/assets/3d/vidro-martelado/vidro-martelado.glb',
    fallbackImg: '/assets/3d/vidro-martelado/vidro-martelado-render-01.webp',
    renders: [
      { src: '/assets/3d/vidro-martelado/vidro-martelado-render-01.webp', alt: 'Vidro Martelado — tampos circulares em estúdio' },
    ],
  },
  {
    slug: 'banqueta-bold',
    name: 'Banqueta Bold',
    description: 'Banqueta alta com estrutura tubular metálica contínua e pintura eletrostática, apoio de pés perimetral integrado, assento estofado com sobreposição frontal e encosto curvo acolchoado com botões posteriores.',
    glbSrc: '/assets/3d/banqueta-bold/banqueta-bold.glb',
    fallbackImg: '/assets/3d/banqueta-bold/banqueta-bold-render-01.webp',
    renders: [
      { src: '/assets/3d/banqueta-bold/banqueta-bold-render-01.webp', alt: 'Banqueta Bold — vista frontal e posterior em estúdio' },
    ],
  },
  {
    slug: 'cadeira-alva',
    name: 'Cadeira Alva',
    description: 'Cadeira office giratória com estrutura tubular metálica contínua, braços integrados revestidos em couro pespontado, encosto ergonômico em T com apoio lombar estofado e base piramidal de quatro hastes com rodízios.',
    glbSrc: '/assets/3d/cadeira-alva/cadeira-alva.glb',
    fallbackImg: '/assets/3d/cadeira-alva/cadeira-alva-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-alva/cadeira-alva-render-01.webp', alt: 'Cadeira Alva — vista em perspectiva em estúdio' },
    ],
  },
  {
    slug: 'cadeira-soa',
    name: 'Cadeira Soa',
    description: 'Cadeira de jantar com estrutura tubular metálica esguia, encosto suspenso revestido em couro com costura pespontada no topo e assento estofado anatômico em tecido bouclé.',
    glbSrc: '/assets/3d/cadeira-soa/cadeira-soa.glb',
    fallbackImg: '/assets/3d/cadeira-soa/cadeira-soa-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-soa/cadeira-soa-render-01.webp', alt: 'Cadeira Soa — vista em perspectiva em estúdio' },
    ],
  },
  {
    slug: 'cadeira-bold',
    name: 'Cadeira Bold',
    description: 'Cadeira contemporânea nas versões com e sem braços, com estrutura tubular metálica contínua, assento estofado com sobreposição frontal e encosto curvo acolchoado com botões posteriores.',
    glbSrc: '/assets/3d/cadeira-bold/cadeira-bold.glb',
    fallbackImg: '/assets/3d/cadeira-bold/cadeira-bold-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-bold/cadeira-bold-render-01.webp', alt: 'Cadeira Bold — versões com e sem braços em estúdio' },
    ],
  },
  {
    slug: 'carrinho-bacuri',
    name: 'Carrinho Bacuri',
    description: 'Carrinho bar e aparador com estrutura tubular metálica com alças integradas, duas bandejas ripadas em madeira natural, rodas frontais torneadas com banda emborrachada e organizador lateral suspenso em couro camurça com bolsos.',
    glbSrc: '/assets/3d/carrinho-bacuri/carrinho-bacuri.glb',
    fallbackImg: '/assets/3d/carrinho-bacuri/carrinho-bacuri-render-01.webp',
    renders: [
      { src: '/assets/3d/carrinho-bacuri/carrinho-bacuri-render-01.webp', alt: 'Carrinho Bacuri — vista em perspectiva em estúdio' },
    ],
  },
  {
    slug: 'pendente-haste',
    name: 'Pendente Haste',
    description: 'Luminária pendente contemporânea com haste vertical metálica esguia, anel intermediário usinado, difusor tubular interno canelado e cúpula cônica dobrada em couro pespontado com fechamento por botão.',
    glbSrc: '/assets/3d/pendente-haste/pendente-haste.glb',
    fallbackImg: '/assets/3d/pendente-haste/pendente-haste-render-01.webp',
    renders: [
      { src: '/assets/3d/pendente-haste/pendente-haste-render-01.webp', alt: 'Pendente Haste — composição em estúdio' },
    ],
  },
  {
    slug: 'poltrona-alento',
    name: 'Poltrona Alento',
    description: 'Poltrona lounge com estrutura externa em madeira curvada, base metálica esguia, braços estofados integrados com fivela lateral em couro e conjunto de assento, encosto e apoio de cabeça acolchoados.',
    glbSrc: '/assets/3d/poltrona-alento/poltrona-alento.glb',
    fallbackImg: '/assets/3d/poltrona-alento/poltrona-alento-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-alento/poltrona-alento-render-01.webp', alt: 'Poltrona Alento — vista frontal e posterior em estúdio' },
    ],
  },
  {
    slug: 'poltrona-bold',
    name: 'Poltrona Bold',
    description: 'Poltrona lounge com estrutura tubular metálica contínua, braços laterais com manta estofada sobreposta, assento generoso e encosto acolchoado com fixação aparente.',
    glbSrc: '/assets/3d/poltrona-bold/poltrona-bold.glb',
    fallbackImg: '/assets/3d/poltrona-bold/poltrona-bold-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-bold/poltrona-bold-render-01.webp', alt: 'Poltrona Bold — vista frontal e posterior em estúdio' },
    ],
  },
  {
    slug: 'poltrona-elevata',
    name: 'Poltrona Elevata',
    description: 'Poltrona de leitura com banqueta apoia-pés coordenada, estrutura tubular metálica com tirantes traseiros em couro e fivelas, braços estofados chanfrados e apoio de cabeça envolvente.',
    glbSrc: '/assets/3d/poltrona-elevata/poltrona-elevata.glb',
    fallbackImg: '/assets/3d/poltrona-elevata/poltrona-elevata-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-elevata/poltrona-elevata-render-01.webp', alt: 'Poltrona Elevata — conjunto com banqueta em estúdio' },
    ],
  },
  {
    slug: 'poltrona-orbe-alta',
    name: 'Poltrona Orbe Alta',
    description: 'Poltrona de espaldar alto com encosto envolvente e apoio de cabeça estofado integrado, disponível nas versões com e sem braços laterais acolchoados e base tubular metálica.',
    glbSrc: '/assets/3d/poltrona-orbe-alta/poltrona-orbe-alta.glb',
    fallbackImg: '/assets/3d/poltrona-orbe-alta/poltrona-orbe-alta-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-orbe-alta/poltrona-orbe-alta-render-01.webp', alt: 'Poltrona Orbe Alta — versão com braços em estúdio' },
      { src: '/assets/3d/poltrona-orbe-alta/poltrona-orbe-alta-render-02.webp', alt: 'Poltrona Orbe Alta — versão sem braços em estúdio' },
    ],
  },
  {
    slug: 'banco-mosaico',
    name: 'Banco Mosaico',
    description: 'Banco modular com estrutura tubular metálica contínua e cinco assentos geométricos trapezoidais alternados, estofados em couro natural com costura central pespontada.',
    glbSrc: '/assets/3d/banco-mosaico/banco-mosaico.glb',
    fallbackImg: '/assets/3d/banco-mosaico/banco-mosaico-render-01.webp',
    renders: [
      { src: '/assets/3d/banco-mosaico/banco-mosaico-render-01.webp', alt: 'Banco Mosaico — vista em perspectiva em estúdio' },
      { src: '/assets/3d/banco-mosaico/banco-mosaico-render-02.webp', alt: 'Banco Mosaico — composição modular em estúdio' },
    ],
  },
  {
    slug: 'poltrona-pinhao',
    name: 'Poltrona Pinhão',
    description: 'Poltrona giratória de desenho orgânico inspirado nas escamas do pinhão, com assento envolvente e encosto segmentado em três gomos estofados em tecido bouclé sobre base cônica.',
    glbSrc: '/assets/3d/poltrona-pinhao/poltrona-pinhao.glb',
    fallbackImg: '/assets/3d/poltrona-pinhao/poltrona-pinhao-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-pinhao/poltrona-pinhao-render-01.webp', alt: 'Poltrona Pinhão — render de estúdio' },
    ],
  },
  {
    slug: 'cadeira-clip',
    name: 'Cadeira Clip',
    description: 'Cadeira de jantar com estrutura em madeira maciça torneada, assento estofado e encosto curvo com detalhe traseiro em presilha metálica que abraça a travessa superior.',
    glbSrc: '/assets/3d/cadeira-clip/cadeira-clip.glb',
    fallbackImg: '/assets/3d/cadeira-clip/cadeira-clip-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-clip/cadeira-clip-render-01.webp', alt: 'Cadeira Clip — render de estúdio' },
    ],
  },
  {
    slug: 'cadeira-zenith',
    name: 'Cadeira Zenith',
    description: 'Cadeira executiva de espaldar alto com encosto em tela mesh tensionada, apoio lombar integrado, braços reguláveis em alumínio polido e base giratória piramidal com rodízios.',
    glbSrc: '/assets/3d/cadeira-zenith/cadeira-zenith.glb',
    fallbackImg: '/assets/3d/cadeira-zenith/cadeira-zenith-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-zenith/cadeira-zenith-render-01.webp', alt: 'Cadeira Zenith — render de estúdio' },
    ],
  },
  {
    slug: 'cadeira-ramo',
    name: 'Cadeira Ramo',
    description: 'Cadeira estofada com estrutura de pernas cilíndricas que se prolongam lateralmente para sustentar o encosto curvo envolvente com acabamento em vivo pespontado.',
    glbSrc: '/assets/3d/cadeira-ramo/cadeira-ramo.glb',
    fallbackImg: '/assets/3d/cadeira-ramo/cadeira-ramo-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-ramo/cadeira-ramo-render-01.webp', alt: 'Cadeira Ramo — render de estúdio' },
    ],
  },
  {
    slug: 'poltrona-ramo',
    name: 'Poltrona Ramo',
    description: 'Poltrona lounge com estrutura de pernas cilíndricas inclinadas que abraçam a concha estofada vazada, assento generoso e acabamento em vivo pespontado.',
    glbSrc: '/assets/3d/poltrona-ramo/poltrona-ramo.glb',
    fallbackImg: '/assets/3d/poltrona-ramo/poltrona-ramo-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-ramo/poltrona-ramo-render-01.webp', alt: 'Poltrona Ramo — render de estúdio' },
    ],
  },
  {
    slug: 'cadeira-alta-flow',
    name: 'Cadeira Alta Flow',
    description: 'Cadeira presidente de espaldar alto com estofamento em gomos horizontais e verticais pespontados, braços estofados integrados à concha e base giratória de cinco hastes com rodízios.',
    glbSrc: '/assets/3d/cadeira-alta-flow/cadeira-alta-flow.glb',
    fallbackImg: '/assets/3d/cadeira-alta-flow/cadeira-alta-flow-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-alta-flow/cadeira-alta-flow-render-01.webp', alt: 'Cadeira Alta Flow — render de estúdio' },
    ],
  },
  {
    slug: 'poltrona-traverse',
    name: 'Poltrona Traverse',
    description: 'Poltrona lounge de volumes generosos com braços cilíndricos estofados em tecido bouclé, almofada de encosto com caimento suave tipo manta e base recuada em madeira.',
    glbSrc: '/assets/3d/poltrona-traverse/poltrona-traverse.glb',
    fallbackImg: '/assets/3d/poltrona-traverse/poltrona-traverse-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-traverse/poltrona-traverse-render-01.webp', alt: 'Poltrona Traverse — render de estúdio' },
    ],
  },
  {
    slug: 'sofa-bold',
    name: 'Sofá Bold',
    description: 'Sofá de dois lugares com estrutura tubular metálica aparente que contorna os braços e o encosto, almofadas duplas de assento e encosto de volume generoso e braços acolchoados envolventes.',
    glbSrc: '/assets/3d/sofa-bold/sofa-bold.glb',
    fallbackImg: '/assets/3d/sofa-bold/sofa-bold-render-01.webp',
    renders: [
      { src: '/assets/3d/sofa-bold/sofa-bold-render-01.webp', alt: 'Sofá Bold — render de estúdio' },
    ],
  },
  {
    slug: 'cadeira-kauai-alta',
    name: 'Cadeira Kauai Alta',
    description: 'Poltrona giratória de espaldar alto com concha estofada contínua, braços integrados, almofada de assento solta e base metálica cromada de quatro hastes.',
    glbSrc: '/assets/3d/cadeira-kauai-alta/cadeira-kauai-alta.glb',
    fallbackImg: '/assets/3d/cadeira-kauai-alta/cadeira-kauai-alta-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-kauai-alta/cadeira-kauai-alta-render-01.webp', alt: 'Cadeira Kauai Alta — render de estúdio' },
    ],
  },
  {
    slug: 'cadeira-kauai-baixa',
    name: 'Cadeira Kauai Baixa',
    description: 'Poltrona giratória de espaldar baixo com concha estofada envolvente, almofada de assento solta e base metálica cromada de quatro hastes.',
    glbSrc: '/assets/3d/cadeira-kauai-baixa/cadeira-kauai-baixa.glb',
    fallbackImg: '/assets/3d/cadeira-kauai-baixa/cadeira-kauai-baixa-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-kauai-baixa/cadeira-kauai-baixa-render-01.webp', alt: 'Cadeira Kauai Baixa — render de estúdio' },
    ],
  },
  {
    slug: 'cadeira-paloma-alta-office',
    name: 'Cadeira Paloma Alta Office',
    description: 'Cadeira office giratória com concha bipartida de espaldar alto, braços envolventes com revestimento externo contrastante, mecanismo de inclinação e base de cinco hastes com rodízios.',
    glbSrc: '/assets/3d/cadeira-paloma-alta-office/cadeira-paloma-alta-office.glb',
    fallbackImg: '/assets/3d/cadeira-paloma-alta-office/cadeira-paloma-alta-office-render-01.webp',
    renders: [
      { src: '/assets/3d/cadeira-paloma-alta-office/cadeira-paloma-alta-office-render-01.webp', alt: 'Cadeira Paloma Alta Office — render de estúdio' },
    ],
  },
  {
    slug: 'poltrona-orbe',
    name: 'Poltrona Orbe',
    description: 'Poltrona lounge compacta com concha estofada em tecido bouclé estruturado e base contínua em tubo metálico curvo.',
    glbSrc: '/assets/3d/poltrona-orbe/poltrona-orbe.glb',
    fallbackImg: '/assets/3d/poltrona-orbe/poltrona-orbe-render-01.webp',
    renders: [
      { src: '/assets/3d/poltrona-orbe/poltrona-orbe-render-01.webp', alt: 'Poltrona Orbe — render de estúdio' },
    ],
  },
  {
    slug: 'sofa-orbe',
    name: 'Sofá Orbe',
    description: 'Sofá de dois lugares com concha estofada em tecido bouclé estruturado e base contínua em tubo metálico curvo.',
    glbSrc: '/assets/3d/sofa-orbe/sofa-orbe.glb',
    fallbackImg: '/assets/3d/sofa-orbe/sofa-orbe-render-01.webp',
    renders: [
      { src: '/assets/3d/sofa-orbe/sofa-orbe-render-01.webp', alt: 'Sofá Orbe — render de estúdio' },
    ],
  },
  // Para adicionar novo asset: criar public/assets/3d/<slug>/<slug>.glb e <slug>-render-0N.webp
]

const FEATURED_ASSETS: Asset3D[] = (() => {
  const bySlug = new Map(ASSETS.map(a => [a.slug, a]))
  const picked = FEATURED_SLUGS.map(s => bySlug.get(s)).filter((a): a is Asset3D => Boolean(a))
  if (picked.length >= 5) return picked.slice(0, 5)
  for (const asset of ASSETS) {
    if (picked.length >= 5) break
    if (!picked.some(p => p.slug === asset.slug)) picked.push(asset)
  }
  return picked
})()

/* ── Carrossel de renders dentro de um slide ────────────────────────── */
function RenderCarousel({ renders, name, description }: {
  renders: Asset3D['renders']
  name: string
  description: string
}) {
  const [ri, setRi] = useState(0)
  const total = renders.length
  return (
    <div className="asset-render-panel">
      <div className="asset-render-frame">
        {renders.map((r, i) => (
          <Image
            key={r.src}
            src={r.src}
            alt={r.alt}
            fill
            className={`object-cover asset-render-img${i === ri ? ' asset-render-img--active' : ''}`}
            sizes="(max-width: 767px) 100vw, 50vw"
            aria-hidden={i !== ri}
          />
        ))}
        <div className="asset-render-overlay">
          <h3 className="asset-render-name">{name}</h3>
          <p className="asset-render-desc">{description}</p>
        </div>
      </div>

      {total > 1 && (
        <nav className="asset-render-nav" aria-label={`Renders de ${name}`}>
          <button type="button" className="asset-carousel-btn"
            onClick={() => setRi(i => (i - 1 + total) % total)} aria-label="Render anterior">←</button>
          <span className="asset-carousel-count">{String(ri + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          <button type="button" className="asset-carousel-btn"
            onClick={() => setRi(i => (i + 1) % total)} aria-label="Próximo render">→</button>
        </nav>
      )}
    </div>
  )
}

/* ── Seção principal — Carrossel 5 Destaques + Grid Clicável ("Olhar mais") ── */
export default function AssetsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const carouselPinRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const clipRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(1)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const featuredTotal = FEATURED_ASSETS.length

  useEffect(() => {
    if (featuredTotal <= 1) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      /* Desktop: GSAP pina apenas o palco dos 5 destaques e libera para o grid abaixo */
      mm.add('(min-width: 1025px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const pinStage = carouselPinRef.current
        const strip = stripRef.current
        if (!pinStage || !strip) return

        // Lê a largura real do primeiro slide (definida via CSS em 75vw)
        const getCardW = () => (strip.children[0] as HTMLElement)?.offsetWidth ?? window.innerWidth

        gsap.to(strip, {
          x: () => -((featuredTotal - 1) * getCardW()),
          ease: 'none',
          scrollTrigger: {
            trigger: pinStage,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${(featuredTotal - 1) * getCardW()}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setCurrent(Math.round(self.progress * (featuredTotal - 1)) + 1)
            },
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [featuredTotal])

  useEffect(() => {
    if (selectedIndex === null) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedIndex])

  const moveSlide = (direction: number) => {
    const clip = clipRef.current
    if (!clip) return
    clip.scrollBy({
      left: direction * clip.clientWidth,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  const updateCurrent = () => {
    const clip = clipRef.current
    if (clip && clip.clientWidth) {
      setCurrent(Math.min(featuredTotal, Math.round(clip.scrollLeft / clip.clientWidth) + 1))
    }
  }

  const activeModalAsset = selectedIndex !== null ? ASSETS[selectedIndex] : null

  return (
    <section ref={sectionRef} className="assets-section" aria-labelledby="assets-title">

      {/* Etapa 1: Palco Pinned — Carrossel com os 5 itens escolhidos */}
      <div ref={carouselPinRef} className="assets-carousel-stage">
        <div className="assets-section-header">
          <div className="assets-section-header-left">
            <span className="section-tag">ASSETS 3D · DESTAQUES</span>
            <h2 id="assets-title">
              Modelagens prontas para<br />
              <em className="font-editorial">quem entrega detalhe.</em>
            </h2>
            <p>Produzidas no 3ds Max. Prontas para SketchUp e Enscape.</p>
          </div>
          <span className="assets-slide-counter" aria-live="polite">
            {String(current).padStart(2, '0')}
            <span className="assets-slide-counter-total"> / {String(featuredTotal).padStart(2, '0')}</span>
          </span>
        </div>

        {/* Clip wrapper — 100vw, escapa o container, oculta overflow horizontal */}
        <div ref={clipRef} className="assets-strip-clip" onScroll={updateCurrent}>
          {/* Strip — GSAP move via translateX */}
          <div ref={stripRef} className="assets-strip">
            {FEATURED_ASSETS.map((asset, index) => (
              <article key={asset.slug} className="asset-slide">
                {/* Esquerda — viewer 3D (WebGL ativo apenas no slide em foco) */}
                <div className="asset-viewer-wrap">
                  <AssetViewer
                    src={asset.glbSrc}
                    fallbackImg={asset.fallbackImg}
                    label={asset.name}
                    className="assets-section-viewer"
                    active={index === current - 1 && selectedIndex === null}
                  />
                </div>
                {/* Direita — render (foto) + descrição */}
                <RenderCarousel
                  renders={asset.renders}
                  name={asset.name}
                  description={asset.description}
                />
              </article>
            ))}
          </div>
        </div>

        <nav className="assets-touch-controls" aria-label="Modelos 3D">
          <button type="button" className="asset-carousel-btn" onClick={() => moveSlide(-1)} disabled={current === 1} aria-label="Modelo anterior">←</button>
          <span>Deslize para explorar · {current} / {featuredTotal}</span>
          <button type="button" className="asset-carousel-btn" onClick={() => moveSlide(1)} disabled={current === featuredTotal} aria-label="Próximo modelo">→</button>
        </nav>
      </div>

      {/* Etapa 2: Grid Clicável ("Olhar mais" — acervo completo sem pesar o scroll nem o WebGL) */}
      <div className="assets-catalog">
        <div className="assets-catalog-header">
          <div>
            <span className="section-tag">OLHAR MAIS · ACERVO COMPLETO</span>
            <h3 className="assets-catalog-title">
              Explore todos os <em className="font-editorial">ativos modelados.</em>
            </h3>
          </div>
          <p className="assets-catalog-hint">
            {String(ASSETS.length).padStart(2, '0')} MODELOS NO ACERVO · CLIQUE EM QUALQUER CARD PARA ABRIR O 3D INTERATIVO
          </p>
        </div>

        <div className="assets-catalog-grid">
          {ASSETS.map((asset, idx) => {
            const isFeatured = FEATURED_SLUGS.includes(asset.slug)
            return (
              <button
                key={asset.slug}
                type="button"
                className="assets-catalog-card"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Abrir modelo 3D interativo e renders de ${asset.name}`}
              >
                <div className="assets-catalog-card-top">
                  <span className="assets-catalog-card-num">
                    #{String(idx + 1).padStart(2, '0')}
                    {isFeatured ? <em> · DESTAQUE</em> : <strong> · ACERVO</strong>}
                  </span>
                  <span className="assets-catalog-card-cta">ABRIR 3D ↗</span>
                </div>

                <div className="assets-catalog-card-media">
                  <Image
                    src={asset.fallbackImg}
                    alt={asset.renders[0]?.alt ?? asset.name}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>

                <div className="assets-catalog-card-body">
                  <h4 className="assets-catalog-card-name">{asset.name}</h4>
                  <p className="assets-catalog-card-desc">{asset.description}</p>
                  <div className="assets-catalog-card-meta">
                    <span>GLB 3D INTERATIVO</span>
                    <span>{asset.renders.length} RENDERS</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal de Inspeção 3D + Renders quando o usuário clica num card do Grid */}
      {activeModalAsset && selectedIndex !== null && (
        <div
          className="assets-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Inspeção 3D — ${activeModalAsset.name}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedIndex(null)
          }}
        >
          <div className="assets-modal-dialog">
            <div className="assets-modal-header">
              <div className="assets-modal-header-title">
                <span className="assets-modal-counter">
                  {String(selectedIndex + 1).padStart(2, '0')} / {String(ASSETS.length).padStart(2, '0')}
                </span>
                <strong>{activeModalAsset.name}</strong>
              </div>
              <div className="assets-modal-actions">
                <button
                  type="button"
                  className="asset-carousel-btn"
                  onClick={() => setSelectedIndex((selectedIndex - 1 + ASSETS.length) % ASSETS.length)}
                  aria-label="Modelo anterior do acervo"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="asset-carousel-btn"
                  onClick={() => setSelectedIndex((selectedIndex + 1) % ASSETS.length)}
                  aria-label="Próximo modelo do acervo"
                >
                  →
                </button>
                <button
                  type="button"
                  className="assets-modal-close"
                  onClick={() => setSelectedIndex(null)}
                >
                  FECHAR [ESC]
                </button>
              </div>
            </div>

            <div className="assets-modal-stage">
              <div className="asset-viewer-wrap">
                <AssetViewer
                  key={activeModalAsset.slug}
                  src={activeModalAsset.glbSrc}
                  fallbackImg={activeModalAsset.fallbackImg}
                  label={activeModalAsset.name}
                  className="assets-section-viewer"
                  active={true}
                />
              </div>
              <RenderCarousel
                key={activeModalAsset.slug}
                renders={activeModalAsset.renders}
                name={activeModalAsset.name}
                description={activeModalAsset.description}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
