// Unica fonte degli URL pubblici: usata da pagine, sitemap, schema e anteprima admin.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://not4.sale').replace(/\/$/, '')

export type Locale = 'it' | 'en'

const prefix = (locale: Locale) => (locale === 'en' ? '/en' : '')

export const paths = {
  home: (l: Locale = 'it') => prefix(l) || '/',
  services: (l: Locale = 'it') => `${prefix(l)}/${l === 'en' ? 'services' : 'servizi'}`,
  area: (area: string, l: Locale = 'it') => `${paths.services(l)}/${area}`,
  service: (area: string, slug: string, l: Locale = 'it') => `${paths.area(area, l)}/${slug}`,
  blog: (l: Locale = 'it') => `${prefix(l)}/blog`,
  post: (slug: string, l: Locale = 'it') => `${paths.blog(l)}/${slug}`,
  category: (slug: string, l: Locale = 'it') => `${paths.blog(l)}/${l === 'en' ? 'category' : 'categoria'}/${slug}`,
  // pagine territoriali: solo in italiano
  locations: () => '/agenzia-marketing',
  location: (slug: string) => `/agenzia-marketing/${slug}`,
  localService: (location: string, service: string) => `/agenzia-marketing/${location}/${service}`,
  sectors: () => '/settori',
  sector: (slug: string) => `/settori/${slug}`,
  caseStudies: (l: Locale = 'it') => `${prefix(l)}/case-studies`,
  about: (l: Locale = 'it') => `${prefix(l)}/${l === 'en' ? 'about' : 'chi-siamo'}`,
  contact: (l: Locale = 'it') => `${prefix(l)}/${l === 'en' ? 'contact' : 'contatti'}`,
  quote: (l: Locale = 'it') => `${prefix(l)}/${l === 'en' ? 'quote' : 'preventivo'}`,
  privacy: (l: Locale = 'it') => `${prefix(l)}/privacy-policy`,
  cookies: (l: Locale = 'it') => `${prefix(l)}/cookie-policy`,
}

export const absolute = (path: string) => `${SITE_URL}${path}`
