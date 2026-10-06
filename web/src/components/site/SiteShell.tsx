import { Toaster } from 'sonner'

import { JsonLd } from '@/components/cms/JsonLd'
import { getAreas, getAuthors, getCompany } from '@/lib/cms'
import type { Locale } from '@/lib/paths'
import { graph, organizationNode, personNode, websiteNode } from '@/lib/schema'
import '@/styles/globals.css'

import AIChat from './AIChat'
import CookieBanner from './CookieBanner'
import CustomCursor from './CustomCursor'
import Footer from './Footer'
import LenisProvider from './LenisProvider'
import Nav from './Nav'
import PageWrap from './PageWrap'
import { SiteDataProvider } from './SiteData'

// Google Consent Mode v2: tutto negato di default. GTM si carica solo dopo il consenso (lib/consent).
const CONSENT_DEFAULT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`

// Con JS attivo i caratteri animati partono nascosti (niente flash prima dell'animazione GSAP);
// senza JS il testo resta visibile.
const JS_FLAG = `document.documentElement.classList.add('js')`

export const SiteShell = async ({ locale, children }: { locale: Locale; children: React.ReactNode }) => {
  const [areas, company, authors] = await Promise.all([getAreas(locale), getCompany(), getAuthors(locale)])

  return (
    // suppressHydrationWarning: la classe "js" viene aggiunta dallo script inline prima dell'idratazione
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT }} />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&f[]=satoshi@400,500,700,900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap"
        />
        <meta name="geo.region" content="IT-RN" />
        <meta name="geo.placename" content={company.city || 'Cattolica'} />
        <meta name="geo.position" content={`${company.geo?.lat ?? 43.962};${company.geo?.lng ?? 12.737}`} />
        <JsonLd data={graph(organizationNode(company, authors, locale), websiteNode(locale), ...authors.map(personNode))} />
      </head>
      <body>
        <SiteDataProvider
          value={{
            areas: areas.map((a) => ({ slug: a.slug, title: a.title, code: a.code })),
            company,
          }}
        >
          <LenisProvider>
            <div className="App min-h-screen bg-black text-white selection:bg-violet-500">
              <CustomCursor />
              <Nav />
              <main>
                <PageWrap>{children}</PageWrap>
              </main>
              <Footer />
              <AIChat />
              <CookieBanner />
              <Toaster
                theme="dark"
                richColors
                position="bottom-center"
                toastOptions={{
                  style: {
                    background: '#0a0a0a',
                    color: '#ffffff',
                    border: '1px solid rgba(157,76,221,0.4)',
                    borderRadius: '2px',
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                  },
                }}
              />
            </div>
          </LenisProvider>
        </SiteDataProvider>
      </body>
    </html>
  )
}

export const siteViewport = { themeColor: '#050505' }

export const siteMetadataBase = {
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

