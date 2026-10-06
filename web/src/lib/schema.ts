import type { Author, Company, LocalService, Location, Post, Sector, Service, ServiceArea } from '@/payload-types'
import { absolute, paths, SITE_URL, type Locale } from './paths'

// Dati strutturati schema.org. Ogni pagina emette un @graph che rimanda
// all'entità Organization tramite @id: un'unica entità coerente per Google e per le AI.

type Node = Record<string, unknown>

export const ORG_ID = `${SITE_URL}/#organization`
export const SITE_ID = `${SITE_URL}/#website`

const personId = (slug: string) => `${SITE_URL}/chi-siamo#${slug}`

export const organizationNode = (company: Company, authors: Author[], locale: Locale): Node => ({
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: company.brand || 'not4sale',
  legalName: company.name,
  url: absolute(paths.home(locale)),
  logo: absolute('/icon.svg'),
  image: absolute('/og?title=not4sale'),
  email: company.email,
  ...(company.phone ? { telephone: company.phone } : {}),
  vatID: company.piva ? `IT${company.piva}` : undefined,
  address: {
    '@type': 'PostalAddress',
    streetAddress: company.address,
    postalCode: company.cap,
    addressLocality: company.city,
    addressRegion: company.province,
    addressCountry: 'IT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: company.geo?.lat ?? 43.962,
    longitude: company.geo?.lng ?? 12.737,
  },
  areaServed: (company.areaServed ?? []).map((name) => ({ '@type': 'Place', name })),
  sameAs: (company.sameAs ?? []).map((s) => s.url),
  founder: authors.map((a) => ({ '@id': personId(a.slug!) })),
  knowsLanguage: ['it', 'en'],
})

export const websiteNode = (locale: Locale): Node => ({
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: absolute(paths.home(locale)),
  name: 'not4sale',
  inLanguage: locale,
  publisher: { '@id': ORG_ID },
})

export const personNode = (a: Author): Node => ({
  '@type': 'Person',
  '@id': personId(a.slug!),
  name: a.name,
  jobTitle: a.role,
  description: a.bio,
  worksFor: { '@id': ORG_ID },
  url: absolute(`${paths.about('it')}#${a.slug}`),
  ...(a.photo && typeof a.photo === 'object' && a.photo.url ? { image: absolute(a.photo.url) } : {}),
  knowsAbout: (a.skills ?? []).map((s) => s.skill),
  sameAs: (a.sameAs ?? []).map((s) => s.url),
})

export const breadcrumbNode = (items: { name: string; path: string }[]): Node => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: absolute(it.path),
  })),
})

export const faqNode = (faq: { question: string; answer: string }[] | null | undefined): Node | null =>
  faq && faq.length
    ? {
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }
    : null

const priceSpec = (s: Service) => {
  const p = s.pricing
  if (!p?.from) return null
  return {
    '@type': 'Offer',
    priceCurrency: 'EUR',
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'EUR',
      minPrice: p.from,
      ...(p.to ? { maxPrice: p.to } : {}),
      ...(p.unit === 'month' ? { unitText: 'MONTH' } : {}),
    },
  }
}

export const serviceNode = (s: Service, area: ServiceArea, locale: Locale): Node => {
  const offer = priceSpec(s)
  return {
    '@type': 'Service',
    '@id': `${absolute(paths.service(area.slug!, s.slug!, locale))}#service`,
    name: s.title,
    serviceType: s.title,
    description: s.answer || s.short,
    url: absolute(paths.service(area.slug!, s.slug!, locale)),
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Italia' },
    category: area.title,
    ...(offer ? { offers: offer } : {}),
  }
}

export const areaNode = (area: ServiceArea, services: Service[], locale: Locale): Node => ({
  '@type': 'Service',
  '@id': `${absolute(paths.area(area.slug!, locale))}#service`,
  name: area.title,
  description: area.answer || area.short,
  url: absolute(paths.area(area.slug!, locale)),
  provider: { '@id': ORG_ID },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: area.title,
    itemListElement: services.map((s, i) => ({
      '@type': 'Offer',
      position: i + 1,
      itemOffered: { '@type': 'Service', name: s.title, url: absolute(paths.service(area.slug!, s.slug!, locale)) },
    })),
  },
})

export const articleNode = (post: Post, locale: Locale): Node => {
  const author = typeof post.author === 'object' ? post.author : null
  const cover = typeof post.cover === 'object' ? post.cover : null
  return {
    '@type': 'BlogPosting',
    '@id': `${absolute(paths.post(post.slug!, locale))}#article`,
    headline: post.title,
    description: post.excerpt,
    url: absolute(paths.post(post.slug!, locale)),
    mainEntityOfPage: absolute(paths.post(post.slug!, locale)),
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    inLanguage: locale,
    author: author ? { '@id': personId(author.slug!), name: author.name } : { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    image: cover?.url ? absolute(cover.url) : absolute(`/og?title=${encodeURIComponent(post.title)}`),
    ...(typeof post.category === 'object' && post.category ? { articleSection: post.category.title } : {}),
    about: (post.relatedServices ?? [])
      .filter((s): s is Service => typeof s === 'object')
      .map((s) => ({ '@type': 'Thing', name: s.title })),
  }
}

const PROVINCE = { RN: 'Provincia di Rimini', PU: 'Provincia di Pesaro e Urbino' } as const

// Il comune come luogo servito (non come sede: l'unica sede è Cattolica).
export const cityPlace = (l: Location) => ({
  '@type': 'City',
  name: l.name,
  ...(l.geo?.lat && l.geo?.lng ? { geo: { '@type': 'GeoCoordinates', latitude: l.geo.lat, longitude: l.geo.lng } } : {}),
  containedInPlace: {
    '@type': 'AdministrativeArea',
    name: PROVINCE[l.province as keyof typeof PROVINCE],
    containedInPlace: { '@type': 'Country', name: 'Italia' },
  },
})

export const locationNode = (l: Location): Node => ({
  '@type': 'Service',
  '@id': `${absolute(paths.location(l.slug!))}#service`,
  name: l.headline || `Agenzia di marketing a ${l.name}`,
  serviceType: 'Marketing e comunicazione',
  description: l.answer || l.short,
  url: absolute(paths.location(l.slug!)),
  provider: { '@id': ORG_ID },
  areaServed: cityPlace(l),
})

export const localServiceNode = (ls: LocalService, l: Location, svc: Service): Node => ({
  '@type': 'Service',
  '@id': `${absolute(paths.localService(l.slug!, svc.slug!))}#service`,
  name: ls.headline,
  serviceType: svc.title,
  description: ls.answer || ls.short,
  url: absolute(paths.localService(l.slug!, svc.slug!)),
  provider: { '@id': ORG_ID },
  areaServed: cityPlace(l),
  isRelatedTo: { '@type': 'Service', name: svc.title, url: absolute(paths.service(typeof svc.area === 'object' ? svc.area!.slug! : '', svc.slug!)) },
})

export const sectorNode = (x: Sector): Node => ({
  '@type': 'Service',
  '@id': `${absolute(paths.sector(x.slug!))}#service`,
  name: x.headline || `Marketing per ${x.title}`,
  serviceType: 'Marketing e comunicazione',
  description: x.answer || x.short,
  url: absolute(paths.sector(x.slug!)),
  provider: { '@id': ORG_ID },
  audience: { '@type': 'BusinessAudience', name: x.title },
  areaServed: [
    { '@type': 'AdministrativeArea', name: PROVINCE.RN },
    { '@type': 'AdministrativeArea', name: PROVINCE.PU },
  ],
})

export const graph = (...nodes: (Node | null | undefined)[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
})
