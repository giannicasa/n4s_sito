import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Author, CaseStudy, Category, Company, LocalService, Location, Post, Sector, SectorService, Service, ServiceArea } from '@/payload-types'
import type { Locale } from './paths'
import { regionOf } from './regions'

// Accesso ai contenuti per le pagine pubbliche.
// Ogni query è in cache con un tag; gli hook afterChange delle collezioni invalidano il tag
// e la pagina statica si rigenera alla visita successiva. In anteprima (draft mode) niente cache e bozze incluse.

const payload = cache(() => getPayload({ config }))

const isDraft = async () => {
  try {
    return (await draftMode()).isEnabled
  } catch {
    // generateStaticParams/sitemap girano fuori da una richiesta
    return false
  }
}

const published: Where = { _status: { equals: 'published' } }

// Dei documenti collegati servono solo i campi per link e card: senza questo filtro
// una pagina settore si porterebbe dietro il testo integrale di decine di pagine (>2 MB).
const LINK_FIELDS = {
  services: { title: true, slug: true, short: true, area: true, _status: true },
  'service-areas': { title: true, slug: true, code: true },
  locations: { name: true, slug: true, province: true, region: true, scope: true, zone: true, geo: true, _status: true },
  sectors: { title: true, slug: true, short: true, _status: true },
  'case-studies': { code: true, industry: true, title: true, metric: true, excerpt: true, _status: true },
} as const

const withStatus = (where: Where | undefined, draft: boolean): Where =>
  draft ? (where ?? {}) : where ? { and: [where, published] } : published

type QueryFn<A extends unknown[], R> = (draft: boolean, ...args: A) => Promise<R>

// Esegue la query in cache (pubblico) o diretta (anteprima).
// Rete di sicurezza: anche senza invalidazione (es. import da riga di comando) i dati si rinnovano ogni ora.
const MAX_AGE = 3600
// La Data Cache di Vercel sopravvive ai deploy: con la stessa chiave un deploy che cambia i campi letti (select)
// riceverebbe i dati salvati dal codice precedente. La chiave include quindi il commit del deploy.
const BUILD = process.env.VERCEL_GIT_COMMIT_SHA ?? 'local'

const query = <A extends unknown[], R>(key: string, tags: string[], fn: QueryFn<A, R>) => {
  const cached = unstable_cache((...args: A) => fn(false, ...args), [key, BUILD], { tags, revalidate: MAX_AGE })
  return async (...args: A): Promise<R> => ((await isDraft()) ? fn(true, ...args) : cached(...args))
}

export const getAreas = query('areas', ['services'], async (draft, locale: Locale) => {
  const res = await (await payload()).find({
    collection: 'service-areas',
    where: withStatus(undefined, draft),
    sort: 'order',
    locale,
    draft,
    depth: 0,
    limit: 100,
    pagination: false,
  })
  return res.docs as ServiceArea[]
})

export const getArea = query('area', ['services'], async (draft, slug: string, locale: Locale) => {
  const res = await (await payload()).find({
    collection: 'service-areas',
    where: withStatus({ slug: { equals: slug } }, draft),
    locale,
    draft,
    depth: 1,
    limit: 1,
  })
  return (res.docs[0] as ServiceArea | undefined) ?? null
})

export const getServices = query('services', ['services'], async (draft, locale: Locale, areaId?: string) => {
  const res = await (await payload()).find({
    collection: 'services',
    where: withStatus(areaId ? { area: { equals: areaId } } : undefined, draft),
    sort: 'order',
    locale,
    draft,
    depth: 1,
    // elenchi: niente testi lunghi, solo i campi per card e link
    select: { title: true, slug: true, short: true, answer: true, area: true, order: true, _status: true },
    populate: LINK_FIELDS,
    limit: 500,
    pagination: false,
  })
  return res.docs as Service[]
})

export const getService = query(
  'service',
  ['services', 'case-studies'],
  async (draft, areaSlug: string, slug: string, locale: Locale) => {
    const res = await (await payload()).find({
      collection: 'services',
      where: withStatus({ slug: { equals: slug } }, draft),
      locale,
      draft,
      depth: 2,
      populate: LINK_FIELDS,
      limit: 1,
    })
    const doc = res.docs[0] as Service | undefined
    // Lo slug è unico, ma l'URL deve corrispondere alla sua macro-area.
    if (!doc || typeof doc.area !== 'object' || doc.area?.slug !== areaSlug) return null
    return doc
  },
)

type PostQuery = { locale: Locale; category?: string; service?: string; limit?: number; page?: number }

export const getPosts = query('posts', ['posts'], async (draft, { locale, category, service, limit = 24, page = 1 }: PostQuery) => {
  const filters: Where[] = []
  if (category) filters.push({ category: { equals: category } })
  if (service) filters.push({ relatedServices: { contains: service } })
  const res = await (await payload()).find({
    collection: 'posts',
    where: withStatus(filters.length ? { and: filters } : undefined, draft),
    sort: '-publishedAt',
    locale,
    draft,
    depth: 1,
    limit,
    page,
  })
  return { docs: res.docs as Post[], totalPages: res.totalPages, page: res.page ?? 1 }
})

export const getPost = query('post', ['posts', 'services', 'authors'], async (draft, slug: string, locale: Locale) => {
  const res = await (await payload()).find({
    collection: 'posts',
    where: withStatus({ slug: { equals: slug } }, draft),
    locale,
    draft,
    depth: 2,
    limit: 1,
  })
  return (res.docs[0] as Post | undefined) ?? null
})

export const getCategories = query('categories', ['posts'], async (_draft, locale: Locale) => {
  const res = await (await payload()).find({ collection: 'categories', locale, depth: 0, limit: 100, pagination: false })
  return res.docs as Category[]
})

export const getCategory = query('category', ['posts'], async (_draft, slug: string, locale: Locale) => {
  const res = await (await payload()).find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    locale,
    depth: 1,
    limit: 1,
  })
  return (res.docs[0] as Category | undefined) ?? null
})

export const getCaseStudies = query('case-studies', ['case-studies'], async (draft, locale: Locale) => {
  const res = await (await payload()).find({
    collection: 'case-studies',
    where: withStatus(undefined, draft),
    sort: 'order',
    locale,
    draft,
    depth: 0,
    limit: 100,
    pagination: false,
  })
  return res.docs as CaseStudy[]
})

export const getAuthors = query('authors', ['authors'], async (_draft, locale: Locale) => {
  const res = await (await payload()).find({ collection: 'authors', sort: 'order', locale, depth: 1, limit: 50, pagination: false })
  return res.docs as Author[]
})

export const getCompany = query('company', ['company'], async () => {
  return (await (await payload()).findGlobal({ slug: 'company', depth: 0 })) as Company
})

export const getRedirect = query('redirect', ['redirects'], async (_draft, from: string) => {
  const res = await (await payload()).find({
    collection: 'redirects',
    where: { from: { equals: from } },
    depth: 2,
    limit: 1,
  })
  return res.docs[0] ?? null
})

// ─── Territorio: comuni, settori, servizi in città (solo italiano) ─────────



export const getLocations = query('locations', ['local'], async (draft) => {
  const res = await (await payload()).find({
    collection: 'locations',
    where: withStatus(undefined, draft),
    sort: 'name',
    draft,
    depth: 0,
    limit: 500,
    pagination: false,
    select: { name: true, slug: true, province: true, region: true, scope: true, zone: true, short: true, _status: true },
  })
  return res.docs as Location[]
})

export const getLocation = query('location', ['local', 'services'], async (draft, slug: string) => {
  const res = await (await payload()).find({
    collection: 'locations',
    where: withStatus({ slug: { equals: slug } }, draft),
    draft,
    depth: 2, populate: LINK_FIELDS,
    limit: 1,
  })
  return (res.docs[0] as Location | undefined) ?? null
})

export const getLocalServices = query(
  'local-services',
  ['local', 'services'],
  async (draft, filter: { location?: string; service?: string }) => {
    const and: Where[] = []
    if (filter.location) and.push({ location: { equals: filter.location } })
    if (filter.service) and.push({ service: { equals: filter.service } })
    const res = await (await payload()).find({
      collection: 'local-services',
      where: withStatus(and.length ? { and } : undefined, draft),
      draft,
      depth: 2, populate: LINK_FIELDS,
      limit: 500,
      pagination: false,
    })
    return res.docs as LocalService[]
  },
)

export const getLocalService = query('local-service', ['local', 'services'], async (draft, locationSlug: string, serviceSlug: string) => {
  const p = await payload()
  const [loc, svc] = await Promise.all([
    p.find({ collection: 'locations', where: withStatus({ slug: { equals: locationSlug } }, draft), draft, depth: 0, limit: 1 }),
    p.find({ collection: 'services', where: withStatus({ slug: { equals: serviceSlug } }, draft), draft, depth: 0, limit: 1 }),
  ])
  if (!loc.docs[0] || !svc.docs[0]) return null
  const res = await p.find({
    collection: 'local-services',
    where: withStatus({ and: [{ location: { equals: loc.docs[0].id } }, { service: { equals: svc.docs[0].id } }] }, draft),
    draft,
    depth: 2, populate: LINK_FIELDS,
    limit: 1,
  })
  return (res.docs[0] as LocalService | undefined) ?? null
})

export const getSectors = query('sectors', ['local'], async (draft) => {
  const res = await (await payload()).find({
    collection: 'sectors',
    where: withStatus(undefined, draft),
    sort: 'order',
    draft,
    depth: 0,
    limit: 100,
    pagination: false,
  })
  return res.docs as Sector[]
})

export const getSector = query('sector', ['local', 'services', 'case-studies'], async (draft, slug: string) => {
  const res = await (await payload()).find({
    collection: 'sectors',
    where: withStatus({ slug: { equals: slug } }, draft),
    draft,
    depth: 2, populate: LINK_FIELDS,
    limit: 1,
  })
  return (res.docs[0] as Sector | undefined) ?? null
})

export const getSectorServices = query(
  'sector-services',
  ['local', 'services'],
  async (draft, filter: { sector?: string; service?: string }) => {
    const and: Where[] = []
    if (filter.sector) and.push({ sector: { equals: filter.sector } })
    if (filter.service) and.push({ service: { equals: filter.service } })
    const res = await (await payload()).find({
      collection: 'sector-services',
      where: withStatus(and.length ? { and } : undefined, draft),
      draft,
      depth: 2,
      populate: LINK_FIELDS,
      select: { title: true, sector: true, service: true, headline: true, short: true, _status: true },
      limit: 500,
      pagination: false,
    })
    return res.docs as SectorService[]
  },
)

export const getSectorService = query('sector-service', ['local', 'services'], async (draft, sectorSlug: string, serviceSlug: string) => {
  const p = await payload()
  const [sec, svc] = await Promise.all([
    p.find({ collection: 'sectors', where: withStatus({ slug: { equals: sectorSlug } }, draft), draft, depth: 0, limit: 1 }),
    p.find({ collection: 'services', where: withStatus({ slug: { equals: serviceSlug } }, draft), draft, depth: 0, limit: 1 }),
  ])
  if (!sec.docs[0] || !svc.docs[0]) return null
  const res = await p.find({
    collection: 'sector-services',
    where: withStatus({ and: [{ sector: { equals: sec.docs[0].id } }, { service: { equals: svc.docs[0].id } }] }, draft),
    draft,
    depth: 2,
    populate: LINK_FIELDS,
    limit: 1,
  })
  return (res.docs[0] as SectorService | undefined) ?? null
})

// Per sitemap e generateStaticParams: solo slug pubblicati, senza cache di richiesta.
export const getPublishedIndex = unstable_cache(
  async () => {
    const p = await payload()
    const [areas, services, posts, categories, areasEn, servicesEn, locations, sectors, localServices, sectorServices] = await Promise.all([
      p.find({ collection: 'service-areas', where: published, depth: 0, limit: 500, pagination: false }),
      p.find({ collection: 'services', where: published, depth: 1, limit: 2000, pagination: false }),
      p.find({ collection: 'posts', where: published, depth: 0, limit: 2000, pagination: false }),
      p.find({ collection: 'categories', depth: 0, limit: 200, pagination: false }),
      // versione inglese: serve solo a sapere quali pagine hanno davvero un testo in EN
      p.find({ collection: 'service-areas', where: published, locale: 'en', depth: 0, limit: 500, pagination: false }),
      p.find({ collection: 'services', where: published, locale: 'en', depth: 0, limit: 2000, pagination: false }),
      p.find({ collection: 'locations', where: published, depth: 0, limit: 500, pagination: false, select: { slug: true, updatedAt: true, region: true, province: true } }),
      p.find({ collection: 'sectors', where: published, depth: 0, limit: 200, pagination: false, select: { slug: true, updatedAt: true } }),
      p.find({ collection: 'local-services', where: published, depth: 1, limit: 2000, pagination: false }),
      p.find({ collection: 'sector-services', where: published, depth: 1, limit: 2000, pagination: false }),
    ])
    const hasEn = (docs: { id: string | number; answer?: string | null }[]) =>
      new Set(docs.filter((d) => d.answer).map((d) => String(d.id)))
    const areasWithEn = hasEn(areasEn.docs as ServiceArea[])
    const servicesWithEn = hasEn(servicesEn.docs as Service[])
    return {
      areas: (areas.docs as ServiceArea[]).map((a) => ({ slug: a.slug!, updatedAt: a.updatedAt, en: areasWithEn.has(String(a.id)) })),
      services: (services.docs as Service[])
        .filter((s) => typeof s.area === 'object' && s.area?._status === 'published')
        .map((s) => ({
          area: (s.area as ServiceArea).slug!,
          slug: s.slug!,
          updatedAt: s.updatedAt,
          en: servicesWithEn.has(String(s.id)),
        })),
      posts: (posts.docs as Post[]).map((p) => ({ slug: p.slug!, updatedAt: p.updatedAt })),
      categories: (categories.docs as Category[]).map((c) => ({ slug: c.slug!, updatedAt: c.updatedAt })),
      locations: (locations.docs as Location[]).map((l) => ({ slug: l.slug!, updatedAt: l.updatedAt, region: regionOf(l) })),
      sectors: (sectors.docs as Sector[]).map((x) => ({ slug: x.slug!, updatedAt: x.updatedAt })),
      localServices: (localServices.docs as LocalService[])
        .filter((ls) => typeof ls.location === 'object' && typeof ls.service === 'object')
        .map((ls) => ({
          location: (ls.location as Location).slug!,
          service: (ls.service as Service).slug!,
          updatedAt: ls.updatedAt,
        })),
      sectorServices: (sectorServices.docs as SectorService[])
        .filter((x) => typeof x.sector === 'object' && typeof x.service === 'object')
        .map((x) => ({ sector: (x.sector as Sector).slug!, service: (x.service as Service).slug!, updatedAt: x.updatedAt })),
    }
  },
  ['published-index'],
  { tags: ['services', 'posts', 'local'], revalidate: MAX_AGE },
)
