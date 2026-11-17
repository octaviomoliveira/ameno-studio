import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Cursor from '@/components/layout/Cursor'
import LenisProvider from '@/components/layout/LenisProvider'
import SiteIntro from '@/components/intro/SiteIntro'
import SiteAnalytics from '@/components/analytics/SiteAnalytics'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  preload: true,
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'ameno.studio — Arquitetura, Visualização e Ferramentas',
  description: 'Portfólio e loja de plugins para 3ds Max. Arquitetura, ArchViz e ferramentas para profissionais.',
  metadataBase: new URL('https://ameno.studio'),
  openGraph: {
    title: 'ameno.studio',
    description: 'Arquitetura. Visualização. Ferramentas.',
    url: 'https://ameno.studio',
    siteName: 'ameno.studio',
    locale: 'pt_BR',
    type: 'website',
    images: [{
      url: '/projects/central-parque.webp',
      alt: 'ameno.studio — arquitetura, visualização e ferramentas',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ameno.studio',
    description: 'Arquitetura. Visualização. Ferramentas.',
    images: ['/projects/central-parque.webp'],
  },
  verification: {
    google: '3L2dpjFAo1732HJ8msVci27vBDk2noUtTMOOB0B22Lk',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': 'https://ameno.studio/#organization',
      name: 'ameno.studio',
      url: 'https://ameno.studio',
      logo: 'https://ameno.studio/brand/logo.png',
      image: 'https://ameno.studio/projects/central-parque.webp',
      description:
        'Estúdio de arquitetura autoral, visualização arquitetônica 3D (ArchViz), modelagem 3D e ferramentas profissionais para Autodesk 3ds Max.',
      email: 'contato@ameno.studio',
      founder: {
        '@type': 'Person',
        name: 'Octávio Oliveira',
        jobTitle: 'Arquiteto e Urbanista',
        sameAs: [
          'https://www.instagram.com/arq.octaviooliveira/',
          'https://www.linkedin.com/in/octavio-m-oliveira/',
        ],
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Recife',
        addressRegion: 'PE',
        addressCountry: 'BR',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Brasil',
      },
      sameAs: [
        'https://www.instagram.com/arq.octaviooliveira/',
        'https://www.linkedin.com/in/octavio-m-oliveira/',
      ],
    },
    {
      '@type': 'Service',
      '@id': 'https://ameno.studio/portfolio#service',
      name: 'Projetos de Arquitetura, ArchViz e Modelagem 3D',
      provider: {
        '@id': 'https://ameno.studio/#organization',
      },
      serviceType: [
        'Projetos Autorais de Arquitetura',
        'Visualização Arquitetônica 3D (ArchViz)',
        'Modelagem 3D de Precisão (.GLB / 3ds Max)',
      ],
      areaServed: {
        '@type': 'Country',
        name: 'Brasil',
      },
      url: 'https://ameno.studio/portfolio',
    },
    {
      '@type': ['Product', 'SoftwareApplication'],
      '@id': 'https://ameno.studio/plugins#ameno-cotas',
      name: 'Ameno Cotas — Plugin de Cotagem Técnica para 3ds Max',
      description:
        'Plugin para Autodesk 3ds Max (2024 a 2026) que cria cotas paramétricas 3D reais, texto vetorial editável, líderes e setas em segundos.',
      image: 'https://ameno.studio/plugins/ameno-cotas-preview.png',
      url: 'https://ameno.studio/plugins',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Windows (Autodesk 3ds Max 2024–2026)',
      brand: {
        '@type': 'Brand',
        name: 'ameno.studio',
      },
      offers: {
        '@type': 'AggregateOffer',
        url: 'https://ameno.studio/plugins#comprar',
        priceCurrency: 'BRL',
        lowPrice: '10.00',
        highPrice: '150.00',
        offerCount: 1,
        availability: 'https://schema.org/InStock',
        seller: {
          '@id': 'https://ameno.studio/#organization',
        },
      },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <SiteAnalytics />
        <SiteIntro />
        <div id="site-shell">
          <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
          <LenisProvider>
            <Cursor />
            <Navbar />
            <main id="main-content" tabIndex={-1}>{children}</main>
            <Footer />
          </LenisProvider>
        </div>
      </body>
    </html>
  )
}
