import type { MetadataRoute } from 'next'

import { getPublishedIndex } from '@/lib/cms'
import { absolute, paths, type Locale } from '@/lib/paths'

// Sitemap generata dal CMS: ogni pagina pubblicata con l'alternativa nell'altra lingua.
export const revalidate = 3600

const entry = (
  build: (l: Locale) => string,
  opts: {
    lastModified?: string
    priority?: number
    changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']
    // false quando la versione inglese non ha testo (e quindi non è indicizzabile)
    en?: boolean
  } = {},
): MetadataRoute.Sitemap[number] => ({
  url: absolute(build('it')),
  lastModified: opts.lastModified ? new Date(opts.lastModified) : undefined,
  changeFrequency: opts.changeFrequency ?? 'monthly',
  priority: opts.priority ?? 0.6,
  ...(opts.en === false ? {} : { alternates: { languages: { it: absolute(build('it')), en: absolute(build('en')) } } }),
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const idx = await getPublishedIndex()
  return [
    entry(paths.home, { priority: 1, changeFrequency: 'weekly' }),
    entry(paths.services, { priority: 0.9, changeFrequency: 'weekly' }),
    ...idx.areas.map((a) => entry((l) => paths.area(a.slug, l), { lastModified: a.updatedAt, priority: 0.9, en: a.en })),
    ...idx.services.map((s) => entry((l) => paths.service(s.area, s.slug, l), { lastModified: s.updatedAt, priority: 0.8, en: s.en })),
    entry(paths.blog, { priority: 0.8, changeFrequency: 'daily' }),
    ...idx.categories.map((c) => entry((l) => paths.category(c.slug, l), { lastModified: c.updatedAt, priority: 0.5 })),
    ...idx.posts.map((p) => entry((l) => paths.post(p.slug, l), { lastModified: p.updatedAt, priority: 0.7, changeFrequency: 'monthly' })),
    // territorio: solo italiano
    entry(paths.locations, { priority: 0.8, en: false }),
    ...idx.locations.map((l) => entry(() => paths.location(l.slug), { lastModified: l.updatedAt, priority: 0.7, en: false })),
    ...idx.localServices.map((x) => entry(() => paths.localService(x.location, x.service), { lastModified: x.updatedAt, priority: 0.7, en: false })),
    entry(paths.sectors, { priority: 0.8, en: false }),
    ...idx.sectors.map((x) => entry(() => paths.sector(x.slug), { lastModified: x.updatedAt, priority: 0.8, en: false })),
    entry(paths.caseStudies, { priority: 0.7 }),
    entry(paths.about, { priority: 0.6 }),
    entry(paths.contact, { priority: 0.6 }),
    entry(paths.quote, { priority: 0.7 }),
    entry(paths.privacy, { priority: 0.1, changeFrequency: 'yearly' }),
    entry(paths.cookies, { priority: 0.1, changeFrequency: 'yearly' }),
  ]
}
