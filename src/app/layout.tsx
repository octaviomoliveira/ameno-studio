import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Cursor from '@/components/layout/Cursor'
import LenisProvider from '@/components/layout/LenisProvider'
import SiteIntro from '@/components/intro/SiteIntro'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
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
      url: '/hero/ameno-hero-concept-v1.webp',
      alt: 'ameno.studio — arquitetura, visualização e ferramentas',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ameno.studio',
    description: 'Arquitetura. Visualização. Ferramentas.',
    images: ['/hero/ameno-hero-concept-v1.webp'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable}`}>
      <body>
        <SiteIntro />
        <div id="site-shell">
          <LenisProvider>
            <Cursor />
            <Navbar />
            <main>{children}</main>
            <Footer />
          </LenisProvider>
        </div>
      </body>
    </html>
  )
}
