import type { Metadata } from 'next'
import DeliciasDaAnaCaseStudy from './DeliciasDaAnaCaseStudy'

export const metadata: Metadata = {
  title: 'Delícias da Ana — Estudo de Caso Completo (17 Lâminas) · ameno.studio',
  description:
    'Dossiê arquitetônico e técnico completo do projeto comercial Delícias da Ana: levantamento in loco, planta humanizada cotada (2,65m × 25,00m) com Ameno Cotas, retrofit de fachada de 3 pavimentos, salão de atendimento e cozinha industrial em inox.',
  openGraph: {
    title: 'Delícias da Ana — Arquitetura Comercial, Fluxo & Retrofit · ameno.studio',
    description:
      'Como transformar um corredor comercial de 2,65m × 25,00m em uma operação gastronômica de alta conversão. Veja as 17 lâminas do estudo de caso completo.',
    images: [
      {
        url: '/projects/autorais/delicias-da-ana/atendimento-01.webp',
        width: 1688,
        height: 2250,
        alt: 'Delícias da Ana — Salão de Atendimento & Balcão Principal',
      },
    ],
  },
}

export default function DeliciasDaAnaPage() {
  return <DeliciasDaAnaCaseStudy />
}
