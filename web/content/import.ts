// Importa content/services/{area}.json nel CMS e pubblica area e servizi.
// Idempotente: aggiorna per slug. Uso: npm run content:import [-- area-slug ...]
import config from '@payload-config'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

const dir = path.resolve(process.cwd(), 'content/services')
const ctx = { disableRevalidate: true }

// Stessa strategia del seed: il cluster Atlas condiviso dà errori transitori.
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

const findId = async (collection: 'service-areas' | 'services' | 'case-studies', slug: string) => {
  const res = await withRetry(() =>
    payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true }),
  )
  return res.docs[0] ? String(res.docs[0].id) : null
}

const publish = (collection: 'service-areas' | 'services', id: string, data: Record<string, unknown>) =>
  withRetry(() =>
    payload.update({
      collection,
      id,
      locale: 'it',
      depth: 0,
      context: ctx,
      draft: false,
      data: { ...data, _status: 'published' },
    } as any),
  )

const requested = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const files = requested.length
  ? requested.map((a) => `${a}.json`)
  : existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.json'))
    : []

const caseIds = new Map<string, string>()
for (const slug of ['cs-001', 'cs-002', 'cs-003', 'cs-004', 'cs-005']) {
  const id = await findId('case-studies', slug)
  if (id) caseIds.set(slug, id)
}

// Primo giro: area e servizi. I correlati si collegano dopo, quando tutti gli slug esistono.
const pendingRelations: { id: string; related: string[] }[] = []
let count = 0

for (const file of files) {
  const data = JSON.parse(readFileSync(path.join(dir, file), 'utf8'))
  const a = data.area
  const areaId = await findId('service-areas', a.slug)
  if (!areaId) {
    payload.logger.error(`Area non trovata: ${a.slug} (lancia prima npm run seed)`)
    continue
  }
  await publish('service-areas', areaId, {
    headline: a.headline,
    short: a.short,
    answer: a.answer,
    body: md(a.body),
    faq: a.faq,
    meta: { title: a.metaTitle, description: a.metaDescription },
  })

  for (const s of data.services) {
    const id = await findId('services', s.slug)
    if (!id) {
      payload.logger.error(`Servizio non trovato: ${s.slug}`)
      continue
    }
    await publish('services', id, {
      area: areaId,
      headline: s.headline,
      short: s.short,
      answer: s.answer,
      problem: md(s.problem),
      process: s.process,
      deliverables: s.deliverables.map((item: string) => ({ item })),
      body: md(s.body),
      faq: s.faq,
      caseStudies: (s.caseStudies ?? []).map((c: string) => caseIds.get(c)).filter(Boolean),
      meta: { title: s.metaTitle, description: s.metaDescription },
    })
    pendingRelations.push({ id, related: s.related ?? [] })
    count++
  }
  payload.logger.info(`${a.slug}: area + ${data.services.length} servizi pubblicati`)
}

for (const { id, related } of pendingRelations) {
  const ids = (await Promise.all(related.map((slug) => findId('services', slug)))).filter(Boolean)
  await withRetry(() =>
    payload.update({ collection: 'services', id, data: { related: ids }, depth: 0, context: ctx, locale: 'it' } as any),
  )
}

payload.logger.info(`Import completato: ${files.length} aree, ${count} servizi`)
process.exit(0)
