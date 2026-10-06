import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Author, CaseStudy, Category, Company, Post, Service, ServiceArea } from '@/payload-types'
import type { Locale } from './paths'

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

const withStatus = (where: Where | undefined, draft: boolean): Where =>
  draft ? (where ?? {}) : where ? { and: [where, published] } : published

type QueryFn<A extends unknown[], R> = (draft: boolean, ...args: A) => Promise<R>

// Esegue la query in cache (pubblico) o diretta (anteprima).
// Rete di sicurezza: anche senza invalidazione (es. import da riga di comando) i dati si rinnovano ogni ora.
const MAX_AGE = 3600

const query = <A extends unknown[], R>(key: string, tags: string[], fn: QueryFn<A, R>) => {
  const cached = unstable_cache((...args: A) => fn(false, ...args), [key], { tags, revalidate: MAX_AGE })
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

// Per sitemap e generateStaticParams: solo slug pubblicati, senza cache di richiesta.
export const getPublishedIndex = unstable_cache(
  async () => {
    const p = await payload()
    const [areas, services, posts, categories, areasEn, servicesEn] = await Promise.all([
      p.find({ collection: 'service-areas', where: published, depth: 0, limit: 500, pagination: false }),
      p.find({ collection: 'services', where: published, depth: 1, limit: 2000, pagination: false }),
      p.find({ collection: 'posts', where: published, depth: 0, limit: 2000, pagination: false }),
      p.find({ collection: 'categories', depth: 0, limit: 200, pagination: false }),
      // versione inglese: serve solo a sapere quali pagine hanno davvero un testo in EN
      p.find({ collection: 'service-areas', where: published, locale: 'en', depth: 0, limit: 500, pagination: false }),
      p.find({ collection: 'services', where: published, locale: 'en', depth: 0, limit: 2000, pagination: false }),
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
    }
  },
  ['published-index'],
  { tags: ['services', 'posts'], revalidate: MAX_AGE },
)
