// Controlla i file content/services/{area}.json prima dell'import.
// Uso: npx tsx content/validate.mts [area-slug ...]   (senza argomenti: tutti i file presenti)
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { TAXONOMY } from '../src/seed/taxonomy'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'services')
const CASES = ['cs-001', 'cs-002', 'cs-003', 'cs-004', 'cs-005']
const EXTRA_URLS = [
  '/preventivo',
  '/contatti',
  '/case-studies',
  '/chi-siamo',
  '/servizi',
  '/blog',
  '/blog/aeo-vs-seo-cosa-cambia',
  '/blog/growth-hacking-perche-funziona',
  '/blog/brand-strategy-non-e-il-logo',
  '/blog/ai-marketing-cosa-automatizzare',
]
const VALID_URLS = new Set([
  ...EXTRA_URLS,
  ...TAXONOMY.flatMap((a) => [`/servizi/${a.slug}`, ...a.services.map((s) => `/servizi/${a.slug}/${s.slug}`)]),
])
const ALL_SLUGS = new Set(TAXONOMY.flatMap((a) => a.services.map((s) => s.slug)))
const BANNED = [/a 360 gradi/i, /nell'era digitale/i, /in continua evoluzione/i, /partner ideale/i, /google partner/i, /garantit[oa] .*prim/i]

const words = (s = '') => s.split(/\s+/).filter(Boolean).length
const links = (md = '') => [...md.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1].split('#')[0])

const areas = process.argv.slice(2).length
  ? process.argv.slice(2)
  : existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''))
    : []

let errors = 0
const err = (where: string, msg: string) => {
  errors++
  console.log(`  ✗ ${where}: ${msg}`)
}

for (const slug of areas) {
  const tax = TAXONOMY.find((a) => a.slug === slug)
  const file = path.join(dir, `${slug}.json`)
  console.log(`\n${slug}`)
  if (!tax) { err(slug, 'area non presente nella tassonomia'); continue }
  if (!existsSync(file)) { err(slug, 'file mancante'); continue }
  let data: any
  try { data = JSON.parse(readFileSync(file, 'utf8')) } catch (e: any) { err(slug, `JSON non valido: ${e.message}`); continue }

  const checkCommon = (where: string, d: any, faqMin: number, faqMax: number) => {
    for (const k of ['headline', 'short', 'answer', 'body', 'metaTitle', 'metaDescription']) if (!d[k]) err(where, `manca ${k}`)
    const aw = words(d.answer)
    if (aw < 35 || aw > 75) err(where, `answer ${aw} parole (35–75)`)
    if (d.short?.length > 160) err(where, `short ${d.short.length} caratteri (max 160)`)
    if (d.metaTitle?.length > 65) err(where, `metaTitle ${d.metaTitle.length} caratteri (max 65)`)
    const md = d.metaDescription?.length ?? 0
    if (md < 110 || md > 165) err(where, `metaDescription ${md} caratteri (110–165)`)
    const faq = d.faq ?? []
    if (faq.length < faqMin || faq.length > faqMax) err(where, `faq ${faq.length} (${faqMin}–${faqMax})`)
    faq.forEach((f: any, i: number) => {
      if (!f.question || !f.answer) err(where, `faq ${i + 1} incompleta`)
      else if (words(f.answer) < 25 || words(f.answer) > 110) err(where, `faq ${i + 1} risposta ${words(f.answer)} parole (25–110)`)
    })
    for (const l of [...links(d.body), ...links(d.problem)]) if (!VALID_URLS.has(l)) err(where, `link non valido: ${l}`)
    const text = JSON.stringify(d)
    for (const b of BANNED) if (b.test(text)) err(where, `espressione vietata: ${b}`)
    if (/\b\d{2,3}\s?€|€\s?\d/.test(text)) err(where, 'contiene un prezzo')
  }

  if (data.area?.slug !== slug) err(slug, 'area.slug non corrisponde')
  checkCommon(`${slug} (area)`, data.area ?? {}, 5, 5)
  const bw = words(data.area?.body)
  if (bw < 450) err(`${slug} (area)`, `body ${bw} parole (min 450)`)
  const areaLinks = links(data.area?.body).filter((l) => l.startsWith(`/servizi/${slug}/`))
  if (areaLinks.length < Math.min(3, tax.services.length)) err(`${slug} (area)`, 'il body deve linkare almeno 3 servizi dell\'area')

  const services = data.services ?? []
  const expected = tax.services.map((s) => s.slug)
  const got = services.map((s: any) => s.slug)
  if (JSON.stringify(expected) !== JSON.stringify(got)) err(slug, `servizi attesi ${expected.join(', ')} — trovati ${got.join(', ')}`)

  for (const s of services) {
    const where = `${slug}/${s.slug}`
    checkCommon(where, s, 5, 6)
    if (!s.problem) err(where, 'manca problem')
    const pw = words(s.problem)
    if (pw < 90 || pw > 260) err(where, `problem ${pw} parole (90–260)`)
    const bw = words(s.body)
    if (bw < 550) err(where, `body ${bw} parole (min 550)`)
    if ((s.body.match(/^## /gm) ?? []).length < 3) err(where, 'body con meno di 3 sezioni ##')
    if (!Array.isArray(s.process) || s.process.length < 4 || s.process.length > 5) err(where, `process ${s.process?.length} passi (4–5)`)
    if (!Array.isArray(s.deliverables) || s.deliverables.length < 5 || s.deliverables.length > 7) err(where, `deliverables ${s.deliverables?.length} (5–7)`)
    const rel = s.related ?? []
    if (rel.length < 3 || rel.length > 4) err(where, `related ${rel.length} (3–4)`)
    for (const r of rel) if (!ALL_SLUGS.has(r) || r === s.slug) err(where, `related non valido: ${r}`)
    for (const c of s.caseStudies ?? []) if (!CASES.includes(c)) err(where, `caso studio non valido: ${c}`)
    const total =
      words(s.answer) + words(s.problem) + words(s.body) +
      (s.process ?? []).reduce((n: number, p: any) => n + words(p.title) + words(p.description), 0) +
      (s.faq ?? []).reduce((n: number, f: any) => n + words(f.question) + words(f.answer), 0)
    if (total < 1000) err(where, `totale ${total} parole (min 1000)`)
    else console.log(`  ✓ ${where} · ${total} parole`)
  }
}

console.log(errors ? `\n${errors} problemi` : '\nTutto valido')
process.exit(errors ? 1 : 0)
