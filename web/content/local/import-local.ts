// Importa e pubblica comuni, settori e servizi in città da content/local/**.json.
// Idempotente (aggiorna per slug). Uso: npm run local:import
import config from '@payload-config'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

const root = path.resolve(process.cwd(), 'content/local')
const ctx = { disableRevalidate: true }

const withRetry = async <T>(fn: () => Promise<T>, attempts = 6): Promise<T> => {
  for (let i = 1; ; i++) {
    try {
      return await fn()
    } catch (err: any) {
      const transient = /WriteConflict|TransientTransaction|AtlasError|MaxTimeMSExpired|catalog changes|quota/i.test(
        String(err?.message ?? err) + JSON.stringify(err?.data ?? ''),
      )
      if (!transient || i >= attempts) throw err
      await new Promise((r) => setTimeout(r, 1500 * i))
    }
  }
}

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const md = (markdown?: string) => (markdown ? convertMarkdownToLexical({ editorConfig, markdown }) : null)
const readDir = (dir: string) =>
  existsSync(path.join(root, dir))
    ? readdirSync(path.join(root, dir))
        .filter((f) => f.endsWith('.json'))
        .map((f) => JSON.parse(readFileSync(path.join(root, dir, f), 'utf8')))
    : []

type Coll = 'locations' | 'sectors' | 'services' | 'case-studies' | 'local-services'

const idsBySlug = async (collection: Coll) => {
  const res = await withRetry(() => payload.find({ collection, limit: 5000, pagination: false, depth: 0, draft: true }))
  return new Map(res.docs.map((d: any) => [d.slug as string, String(d.id)]))
}

const save = async (collection: Coll, existingId: string | undefined, data: Record<string, unknown>) => {
  const args = { collection, depth: 0, context: ctx, draft: false, data: { ...data, _status: 'published' } } as any
  return withRetry(async () =>
    existingId ? payload.update({ ...args, id: existingId }) : payload.create(args),
  ).then((d: any) => String(d.id))
}

const locations = readDir('comuni').flatMap((f) => f.locations)
const sectors = readDir('settori').flatMap((f) => f.sectors)
const cityFiles = readDir('servizi-citta')

// 1. Comuni e settori, senza relazioni (si collegano dopo, quando esistono tutti)
let locIds = await idsBySlug('locations')
for (const l of locations) {
  locIds.set(
    l.slug,
    await save('locations', locIds.get(l.slug), {
      slug: l.slug,
      name: l.name,
      province: l.province,
      zone: l.zone,
      headline: l.headline,
      short: l.short,
      answer: l.answer,
      economy: md(l.economy),
      challenges: md(l.challenges),
      body: md(l.body),
      faq: l.faq,
      highlights: (l.highlights ?? []).map((item: string) => ({ item })),
      distanceKm: l.distanceKm,
      travelMinutes: l.travelMinutes,
      geo: l.geo,
      meta: { title: l.metaTitle, description: l.metaDescription },
    }),
  )
}
payload.logger.info(`Comuni: ${locations.length}`)

let sectorIds = await idsBySlug('sectors')
for (const [i, x] of sectors.entries()) {
  sectorIds.set(
    x.slug,
    await save('sectors', sectorIds.get(x.slug), {
      slug: x.slug,
      title: x.title,
      headline: x.headline,
      short: x.short,
      answer: x.answer,
      problem: md(x.problem),
      process: x.process,
      body: md(x.body),
      faq: x.faq,
      order: i + 1,
      meta: { title: x.metaTitle, description: x.metaDescription },
    }),
  )
}
payload.logger.info(`Settori: ${sectors.length}`)

// 2. Relazioni
const serviceIds = await idsBySlug('services')
const caseIds = await idsBySlug('case-studies')
const map = (ids: Map<string, string>, slugs?: string[]) => (slugs ?? []).map((s) => ids.get(s)).filter(Boolean)

for (const l of locations) {
  await save('locations', locIds.get(l.slug), {
    sectors: map(sectorIds, l.sectors),
    services: map(serviceIds, l.services),
    nearby: map(locIds, l.nearby),
  })
}
for (const x of sectors) {
  await save('sectors', sectorIds.get(x.slug), {
    services: map(serviceIds, x.services),
    locations: map(locIds, x.locations),
    caseStudies: map(caseIds, x.caseStudies),
  })
}
payload.logger.info('Relazioni collegate')

// 3. Servizi in città (chiave: comune + servizio)
let localCount = 0
for (const f of cityFiles) {
  const locationId = locIds.get(f.location)
  if (!locationId) {
    payload.logger.error(`Comune non trovato per servizi in città: ${f.location}`)
    continue
  }
  const locName = locations.find((l) => l.slug === f.location)?.name ?? f.location
  for (const it of f.items) {
    const serviceId = serviceIds.get(it.service)
    if (!serviceId) {
      payload.logger.error(`Servizio non trovato: ${it.service}`)
      continue
    }
    const existing = await withRetry(() =>
      payload.find({
        collection: 'local-services',
        where: { and: [{ location: { equals: locationId } }, { service: { equals: serviceId } }] },
        limit: 1,
        depth: 0,
        draft: true,
      }),
    )
    await save('local-services', existing.docs[0] ? String(existing.docs[0].id) : undefined, {
      title: `${it.service} · ${locName}`,
      location: locationId,
      service: serviceId,
      headline: it.headline,
      short: it.short,
      answer: it.answer,
      body: md(it.body),
      faq: it.faq,
      meta: { title: it.metaTitle, description: it.metaDescription },
    })
    localCount++
  }
}
payload.logger.info(`Servizi in città: ${localCount}`)
process.exit(0)
