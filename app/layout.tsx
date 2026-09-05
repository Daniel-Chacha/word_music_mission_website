import type { Metadata } from 'next'
import { Archivo, Crimson_Pro } from 'next/font/google'
import { site } from '@/content/site'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SkipLink } from '@/components/layout/SkipLink'
import { ThemeScript } from '@/components/layout/ThemeScript'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const crimson = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.missionStatement,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.missionStatement,
    locale: 'en_KE',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      // The theme script rewrites data-theme before React hydrates.
      suppressHydrationWarning
      className={`${archivo.variable} ${crimson.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink-900 text-bone">
        <ThemeScript />
        <SkipLink />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
