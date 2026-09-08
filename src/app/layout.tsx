import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Cursor from '@/components/layout/Cursor'
import LenisProvider from '@/components/layout/LenisProvider'
import SiteIntro from '@/components/intro/SiteIntro'

export const metadata: Metadata = {
  title: 'ameno.info — Arquitetura, Visualização e Ferramentas',
  description: 'Portfólio e loja de plugins para 3ds Max. Arquitetura, ArchViz e ferramentas para profissionais.',
  metadataBase: new URL('https://ameno.info'),
  openGraph: {
    title: 'ameno.info',
    description: 'Arquitetura. Visualização. Ferramentas.',
    url: 'https://ameno.info',
    siteName: 'ameno.info',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
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
