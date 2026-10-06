import { JsonLd } from '@/components/cms/JsonLd'
import { DICT } from '@/i18n/dict'
import { getAreas, getAuthors, getCaseStudies } from '@/lib/cms'
import { absolute, paths, type Locale } from '@/lib/paths'
import { breadcrumbNode, graph, ORG_ID } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'

import CaseStudiesPage from './legacy/CaseStudiesPage'
import ChiSiamoPage from './legacy/ChiSiamoPage'
import ContattiPage from './legacy/ContattiPage'
import CookiePolicyPage from './legacy/CookiePolicyPage'
import HomePage from './legacy/HomePage'
import PrivacyPolicyPage from './legacy/PrivacyPolicyPage'
import QuoteCalculatorPage from './legacy/QuoteCalculatorPage'

// Pagine con contenuto fisso nel codice: il server prepara metadati, schema e dati del CMS,
// il componente client (portato dal vecchio sito) gestisce animazioni e interazioni.

const other = (l: Locale): Locale => (l === 'it' ? 'en' : 'it')

type PageKey = 'home' | 'about' | 'cases' | 'contact' | 'quote' | 'privacy' | 'cookies'

const PAGE_PATH: Record<PageKey, (l: Locale) => string> = {
  home: paths.home,
  about: paths.about,
  cases: paths.caseStudies,
  contact: paths.contact,
  quote: paths.quote,
  privacy: paths.privacy,
  cookies: paths.cookies,
}

const COPY: Record<PageKey, (l: Locale) => { title?: string; description: string; kicker: string }> = {
  home: (l) => ({ description: DICT[l].hero.sub, kicker: 'Studio' }),
  about: (l) => ({
    title: l === 'en' ? 'About · 3 partners, one vision' : 'Chi siamo · 3 soci, una visione',
    description: DICT[l].about.body,
    kicker: DICT[l].nav.about,
  }),
  cases: (l) => ({
    title: l === 'en' ? 'Case Studies · Tailored machines' : 'Case Studies · Macchine su misura',
    description: DICT[l].cases.body,
    kicker: DICT[l].nav.caseStudies,
  }),
  contact: (l) => ({
    title: l === 'en' ? 'Contact · Cattolica' : 'Contatti · Agenzia di marketing a Cattolica',
    description: DICT[l].contact.body,
    kicker: DICT[l].nav.contact,
  }),
  quote: (l) => ({
    title: l === 'en' ? 'Quote calculator' : 'Calcolatore preventivo marketing',
    description: DICT[l].quote.body,
    kicker: DICT[l].nav.quote,
  }),
  privacy: (l) => ({
    title: 'Privacy Policy',
    description:
      l === 'it'
        ? 'Informativa privacy di NOT4SALE Srl: quali dati trattiamo, perché, per quanto tempo e quali sono i tuoi diritti.'
        : 'NOT4SALE Srl privacy notice: what data we process, why, for how long, and your rights.',
    kicker: 'Legal',
  }),
  cookies: (l) => ({
    title: 'Cookie Policy',
    description:
      l === 'it'
        ? 'Quali cookie usa not4.sale, a cosa servono e come gestire o revocare il consenso.'
        : 'Which cookies not4.sale uses, what they are for, and how to manage or withdraw consent.',
    kicker: 'Legal',
  }),
}

export const staticMetadata = (page: PageKey, locale: Locale) => {
  const c = COPY[page](locale)
  return buildMetadata({
    locale,
    title: c.title,
    description: c.description,
    path: PAGE_PATH[page](locale),
    altPath: PAGE_PATH[page](other(locale)),
    ogKicker: c.kicker,
  })
}

const crumbs = (page: PageKey, locale: Locale, name: string) =>
  breadcrumbNode([
    { name: DICT[locale].nav.home, path: paths.home(locale) },
    { name, path: PAGE_PATH[page](locale) },
  ])

export const HomeView = async ({ locale }: { locale: Locale }) => {
  const [areas, cases] = await Promise.all([getAreas(locale), getCaseStudies(locale)])
  return (
    <>
      <JsonLd
        data={graph({
          '@type': 'WebPage',
          '@id': `${absolute(paths.home(locale))}#webpage`,
          url: absolute(paths.home(locale)),
          name: 'not4sale',
          about: { '@id': ORG_ID },
          inLanguage: locale,
          mainEntity: {
            '@type': 'ItemList',
            name: DICT[locale].nav.services,
            itemListElement: areas.map((a, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: a.title,
              url: absolute(paths.area(a.slug!, locale)),
            })),
          },
        })}
      />
      <HomePage
        areas={areas.map((a) => ({ slug: a.slug, title: a.title, short: a.short, code: a.code }))}
        cases={cases}
      />
    </>
  )
}

export const AboutView = async ({ locale }: { locale: Locale }) => {
  const founders = await getAuthors(locale)
  return (
    <>
      <JsonLd data={graph(crumbs('about', locale, DICT[locale].nav.about), { '@type': 'AboutPage', url: absolute(paths.about(locale)), about: { '@id': ORG_ID } })} />
      <ChiSiamoPage founders={founders} />
    </>
  )
}

export const CasesView = async ({ locale }: { locale: Locale }) => {
  const cases = await getCaseStudies(locale)
  return (
    <>
      <JsonLd data={graph(crumbs('cases', locale, DICT[locale].nav.caseStudies))} />
      <CaseStudiesPage cases={cases} />
    </>
  )
}

export const ContactView = ({ locale }: { locale: Locale }) => (
  <>
    <JsonLd data={graph(crumbs('contact', locale, DICT[locale].nav.contact), { '@type': 'ContactPage', url: absolute(paths.contact(locale)), about: { '@id': ORG_ID } })} />
    <ContattiPage />
  </>
)

export const QuoteView = ({ locale }: { locale: Locale }) => (
  <>
    <JsonLd data={graph(crumbs('quote', locale, DICT[locale].nav.quote))} />
    <QuoteCalculatorPage />
  </>
)

// I testi legali scelgono la lingua dall'URL lato client.
export const PrivacyView = (_: { locale: Locale }) => <PrivacyPolicyPage />
export const CookiesView = (_: { locale: Locale }) => <CookiePolicyPage />
