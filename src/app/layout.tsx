import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Cursor from '@/components/layout/Cursor'
import LenisProvider from '@/components/layout/LenisProvider'

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
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body style={{ background: '#0a0a0a', color: '#ffffff' }}>
        <LenisProvider>
          <Cursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  )
}
