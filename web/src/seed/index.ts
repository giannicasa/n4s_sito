// Seed iniziale del CMS. Idempotente: aggiorna per slug, non duplica.
// Uso: npm run seed
import config from '@payload-config'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload, type Payload } from 'payload'

import { SERVICES as LEGACY_SERVICES } from '../../../frontend/src/data/services.js'
import { CASE_STUDIES, FOUNDERS } from '../../../frontend/src/data/site.js'
import legacyArticles from './legacy-articles.json'
import { TAXONOMY } from './taxonomy'

type Collection = 'service-areas' | 'services' | 'posts' | 'categories' | 'authors' | 'case-studies'

const ctx = { disableRevalidate: true }

// I cluster Atlas condivisi restituiscono errori transitori (WriteConflict, timeout sulla quota):
// si ritenta con attesa crescente.
const withRetry = async <T>(fn: () => Promise<T>, attempts = 6): Promise<T> => {
  for (let i = 1; ; i++) {
    try {
      return await fn()
    } catch (err: any) {
      const msg = String(err?.message ?? err)
      const transient = /WriteConflict|TransientTransaction|AtlasError|MaxTimeMSExpired|catalog changes|quota/i.test(
        msg + JSON.stringify(err?.data ?? ''),
      )
      if (!transient || i >= attempts) throw err
      await new Promise((r) => setTimeout(r, 1500 * i))
    }
  }
}

const upsert = (...args: Parameters<typeof upsertOnce>) => withRetry(() => upsertOnce(...args))

const upsertOnce = async (
  payload: Payload,
  collection: Collection,
  slug: string,
  it: Record<string, unknown>,
  en: Record<string, unknown> | null,
  publish: boolean,
): Promise<string> => {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
  })
  const status = publish ? { _status: 'published' } : {}
  const data = { ...it, ...status, slug }
  let id: string
  if (existing.docs[0]) {
    id = String(existing.docs[0].id)
    await payload.update({ collection, id, data, locale: 'it', depth: 0, context: ctx, draft: !publish } as any)
  } else {
    const doc = await payload.create({ collection, data, locale: 'it', depth: 0, context: ctx, draft: !publish } as any)
    id = String(doc.id)
  }
  if (en) {
    await payload.update({ collection, id, data: { ...en, ...status }, locale: 'en', depth: 0, context: ctx, draft: !publish } as any)
  }
  return id
}

const upsertRedirect = (payload: Payload, from: string, to: string) => withRetry(() => upsertRedirectOnce(payload, from, to))

const upsertRedirectOnce = async (payload: Payload, from: string, to: string) => {
  const existing = await payload.find({ collection: 'redirects', where: { from: { equals: from } }, limit: 1 })
  const data = { from, to: { type: 'custom', url: to }, type: '301' }
  if (existing.docs[0]) {
    await payload.update({ collection: 'redirects', id: existing.docs[0].id, data, context: ctx } as any)
  } else {
    await payload.create({ collection: 'redirects', data, context: ctx } as any)
  }
}

const run = async () => {
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const md = (markdown: string) => convertMarkdownToLexical({ editorConfig, markdown })

  const legacyBySlug = new Map(LEGACY_SERVICES.map((s: any) => [s.slug, s]))
  const pairs = (list?: { it: string[][]; en: string[][] }, l: 'it' | 'en' = 'it') =>
    list?.[l]?.map(([question, answer]) => ({ question, answer })) ?? []

  // ── Macro-aree e servizi ────────────────────────────────────────────────
  const areaIds = new Map<string, string>()
  const serviceIds = new Map<string, string>()
  let created = 0

  for (const [i, area] of TAXONOMY.entries()) {
    const legacy: any = area.legacy?.map((l) => legacyBySlug.get(l)).find(Boolean)
    const areaId = await upsert(
      payload,
      'service-areas',
      area.slug,
      {
        title: area.title.it,
        code: area.code,
        headline: area.headline,
        short: area.short.it,
        answer: legacy?.long?.it,
        faq: pairs(legacy?.faq, 'it'),
        order: i + 1,
      },
      {
        title: area.title.en,
        short: area.short.en,
        answer: legacy?.long?.en,
        faq: pairs(legacy?.faq, 'en'),
      },
      true,
    )
    areaIds.set(area.slug, areaId)

    for (const [j, svc] of area.services.entries()) {
      const old: any = svc.legacy ? legacyBySlug.get(svc.legacy) : null
      const id = await upsert(
        payload,
        'services',
        svc.slug,
        {
          title: svc.title.it,
          area: areaId,
          short: old?.short?.it ?? svc.short,
          answer: old?.long?.it,
          deliverables: old?.deliverables?.it?.map((item: string) => ({ item })) ?? [],
          faq: pairs(old?.faq, 'it'),
          order: j + 1,
          wave: svc.wave,
        },
        {
          title: svc.title.en,
          short: old?.short?.en ?? svc.title.en,
          answer: old?.long?.en,
          deliverables: old?.deliverables?.en?.map((item: string) => ({ item })) ?? [],
          faq: pairs(old?.faq, 'en'),
        },
        // Pubblicati solo i servizi che avevano già una pagina; gli altri restano bozze finché non sono scritti.
        Boolean(old),
      )
      serviceIds.set(svc.slug, id)
      created++
    }
  }
  payload.logger.info(`Macro-aree: ${areaIds.size} · servizi: ${created}`)

  // ── Autori ──────────────────────────────────────────────────────────────
  const authorIds: string[] = []
  for (const [i, f] of (FOUNDERS as any[]).entries()) {
    const slug = f.name.toLowerCase().replace(/\s+/g, '-')
    authorIds.push(
      await upsert(
        payload,
        'authors',
        slug,
        {
          name: f.name,
          role: f.role.it,
          bio: f.bio.it,
          years: f.years,
          yearsLabel: f.yearsLabel.it,
          vibe: f.vibe.it,
          skills: f.skills.it.map((skill: string) => ({ skill })),
          color: f.color,
          order: i + 1,
        },
        {
          role: f.role.en,
          bio: f.bio.en,
          yearsLabel: f.yearsLabel.en,
          vibe: f.vibe.en,
          skills: f.skills.en.map((skill: string) => ({ skill })),
        },
        false,
      ),
    )
  }

  // ── Casi studio ─────────────────────────────────────────────────────────
  for (const [i, c] of (CASE_STUDIES as any[]).entries()) {
    await upsert(
      payload,
      'case-studies',
      `cs-${String(i + 1).padStart(3, '0')}`,
      {
        code: c.code,
        industry: c.industry.it,
        title: c.title.it,
        metric: c.metric.it,
        excerpt: c.excerpt.it,
        levers: c.levers.it.map((lever: string) => ({ lever })),
        order: i + 1,
      },
      {
        industry: c.industry.en,
        title: c.title.en,
        metric: c.metric.en,
        excerpt: c.excerpt.en,
        levers: c.levers.en.map((lever: string) => ({ lever })),
      },
      true,
    )
  }

  // ── Categorie blog ──────────────────────────────────────────────────────
  const CATEGORIES = [
    { slug: 'seo-ai-search', it: 'SEO & AI Search', en: 'SEO & AI Search', area: 'ai-search' },
    { slug: 'growth', it: 'Growth', en: 'Growth', area: 'growth' },
    { slug: 'advertising', it: 'Advertising', en: 'Advertising', area: 'advertising' },
    { slug: 'brand', it: 'Brand & Comunicazione', en: 'Brand & Communication', area: 'branding' },
    { slug: 'social-content', it: 'Social & Content', en: 'Social & Content', area: 'social' },
    { slug: 'web-ecommerce', it: 'Web & E-commerce', en: 'Web & E-commerce', area: 'web-app' },
    { slug: 'ai-automazione', it: 'AI & Automazione', en: 'AI & Automation', area: 'ai-automazione' },
    { slug: 'case-study', it: 'Case study', en: 'Case studies', area: null },
  ]
  const categoryIds = new Map<string, string>()
  for (const c of CATEGORIES) {
    categoryIds.set(
      c.slug,
      await upsert(payload, 'categories', c.slug, { title: c.it, area: c.area ? areaIds.get(c.area) : null }, { title: c.en }, false),
    )
  }

  // ── Articoli dal vecchio /insights (IT ed EN sono in coppia per indice) ──
  const POST_MAP: Record<string, { category: string; services: string[] }> = {
    'aeo-vs-seo-cosa-cambia': { category: 'seo-ai-search', services: ['answer-engine-optimization', 'generative-engine-optimization'] },
    'growth-hacking-perche-funziona': { category: 'growth', services: ['growth-hacking'] },
    'brand-strategy-non-e-il-logo': { category: 'brand', services: ['brand-strategy', 'logo-identita-visiva'] },
    'ai-marketing-cosa-automatizzare': { category: 'ai-automazione', services: ['automazioni-n8n', 'agenti-ai'] },
  }
  const itArticles = (legacyArticles as any[]).filter((a) => a.locale === 'it')
  const enArticles = (legacyArticles as any[]).filter((a) => a.locale === 'en')
  const redirects: [string, string][] = [
    ['/insights', '/blog'],
    ['/en/insights', '/en/blog'],
  ]
  for (const [i, a] of itArticles.entries()) {
    const en = enArticles[i]
    const map = POST_MAP[a.slug]
    await upsert(
      payload,
      'posts',
      a.slug,
      {
        title: a.title,
        excerpt: a.excerpt,
        content: md(a.content_md),
        category: map ? categoryIds.get(map.category) : undefined,
        relatedServices: map?.services.map((s) => serviceIds.get(s)).filter(Boolean) ?? [],
        author: authorIds[0],
        readingMinutes: a.read_minutes,
        publishedAt: new Date(Date.now() - (i + 1) * 7 * 864e5).toISOString(),
      },
      en ? { title: en.title, excerpt: en.excerpt, content: md(en.content_md) } : null,
      true,
    )
    redirects.push([`/insights/${a.slug}`, `/blog/${a.slug}`])
    if (en) redirects.push([`/en/insights/${en.slug}`, `/en/blog/${a.slug}`])
  }

  // ── Redirect 301 dai vecchi URL dei servizi ─────────────────────────────
  for (const area of TAXONOMY) {
    for (const old of area.legacy ?? []) {
      if (old !== area.slug) {
        redirects.push([`/servizi/${old}`, `/servizi/${area.slug}`])
        redirects.push([`/en/services/${old}`, `/en/services/${area.slug}`])
      }
    }
    for (const svc of area.services) {
      if (svc.legacy) {
        redirects.push([`/servizi/${svc.legacy}`, `/servizi/${area.slug}/${svc.slug}`])
        redirects.push([`/en/services/${svc.legacy}`, `/en/services/${area.slug}/${svc.slug}`])
      }
    }
  }
  for (const [from, to] of redirects) await upsertRedirect(payload, from, to)

  payload.logger.info(`Seed completato · redirect: ${redirects.length}`)
  process.exit(0)
}

// `payload run` termina appena il modulo è valutato: serve l'await top-level.
try {
  await run()
} catch (err) {
  console.error(err)
  process.exit(1)
}
