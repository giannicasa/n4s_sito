// Valida le pagine territoriali. Uso:
//   npx tsx content/local/validate-local.mts                       → tutti i file
//   npx tsx content/local/validate-local.mts comuni/pu-costa.json  → solo quei file (i duplicati si cercano comunque su tutto)
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { slugify } from '../../src/fields/slug'
import { TAXONOMY } from '../../src/seed/taxonomy'

const here = path.dirname(fileURLToPath(import.meta.url))
const plan = JSON.parse(readFileSync(path.join(here, 'piano.json'), 'utf8'))

const COMUNI = new Map<string, { batch: string; province: string; name: string }>()
for (const [batch, b] of Object.entries<any>(plan.batches)) for (const name of b.comuni) COMUNI.set(slugify(name), { batch, province: b.province, name })
const SECTORS = new Set<string>(Object.values<any>(plan.sectors).flat().map(([s]: string[]) => s))
const SERVICES = new Set(TAXONOMY.flatMap((a) => a.services.map((s) => s.slug)))
const SERVICE_URL = new Map(TAXONOMY.flatMap((a) => a.services.map((s) => [s.slug, `/servizi/${a.slug}/${s.slug}`])))
const LS_CITIES: string[] = plan.localServices.cities
const LS_SERVICES: string[] = plan.localServices.services

const VALID_URLS = new Set<string>([
  '/preventivo', '/contatti', '/case-studies', '/chi-siamo', '/servizi', '/blog', '/agenzia-marketing', '/settori',
  '/blog/aeo-vs-seo-cosa-cambia', '/blog/growth-hacking-perche-funziona', '/blog/brand-strategy-non-e-il-logo', '/blog/ai-marketing-cosa-automatizzare',
  ...TAXONOMY.flatMap((a) => [`/servizi/${a.slug}`, ...a.services.map((s) => `/servizi/${a.slug}/${s.slug}`)]),
  ...[...COMUNI.keys()].map((c) => `/agenzia-marketing/${c}`),
  ...[...SECTORS].map((s) => `/settori/${s}`),
  ...LS_CITIES.flatMap((c) => LS_SERVICES.map((s) => `/agenzia-marketing/${c}/${s}`)),
])
const CASES = ['cs-001', 'cs-002', 'cs-003', 'cs-004', 'cs-005']
const BANNED = [/a 360 gradi/i, /nell'era digitale/i, /in continua evoluzione/i, /partner ideale/i, /google partner/i, /la nostra sede di (?!cattolica)/i, /nostr[oa] client[ei] (di|a) /i]

const words = (s = '') => s.split(/\s+/).filter(Boolean).length
const links = (md = '') => [...md.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1].split('#')[0])
const read = (rel: string) => JSON.parse(readFileSync(path.join(here, rel), 'utf8'))
const list = (dir: string) => (existsSync(path.join(here, dir)) ? readdirSync(path.join(here, dir)).filter((f) => f.endsWith('.json')).map((f) => `${dir}/${f}`) : [])

let errors = 0
const err = (where: string, msg: string) => { errors++; console.log(`  ✗ ${where}: ${msg}`) }

const common = (where: string, d: any, faqMin: number, faqMax: number) => {
  for (const k of ['headline', 'short', 'answer', 'metaTitle', 'metaDescription']) if (!d[k]) err(where, `manca ${k}`)
  const aw = words(d.answer)
  if (aw < 35 || aw > 75) err(where, `answer ${aw} parole (35–75)`)
  if (d.short?.length > 160) err(where, `short ${d.short.length} caratteri (max 160)`)
  if (d.metaTitle?.length > 65) err(where, `metaTitle ${d.metaTitle.length} caratteri (max 65)`)
  const ml = d.metaDescription?.length ?? 0
  if (ml < 110 || ml > 165) err(where, `metaDescription ${ml} caratteri (110–165)`)
  const faq = d.faq ?? []
  if (faq.length < faqMin || faq.length > faqMax) err(where, `faq ${faq.length} (${faqMin}–${faqMax})`)
  faq.forEach((f: any, i: number) => {
    if (!f.question || !f.answer) err(where, `faq ${i + 1} incompleta`)
    else if (words(f.answer) < 25 || words(f.answer) > 110) err(where, `faq ${i + 1} risposta ${words(f.answer)} parole (25–110)`)
  })
  const text = JSON.stringify(d)
  for (const b of BANNED) if (b.test(text)) err(where, `espressione vietata: ${b}`)
  if (/\b\d{2,3}\s?€|€\s?\d/.test(text)) err(where, 'contiene un prezzo')
}
const checkLinks = (where: string, ...mds: string[]) => {
  for (const l of mds.flatMap((m) => links(m))) if (!VALID_URLS.has(l)) err(where, `link non valido: ${l}`)
}
const faqWords = (d: any) => (d.faq ?? []).reduce((n: number, f: any) => n + words(f.question) + words(f.answer), 0)

// Tutte le pagine (anche quelle non validate ora) per il controllo delle frasi duplicate
const pageTexts = new Map<string, string>()
const addPage = (id: string, d: any, fields: string[]) =>
  pageTexts.set(id, [...fields.map((f) => d[f] ?? ''), ...(d.faq ?? []).map((f: any) => f.answer)].join(' '))

const allFiles = [...list('comuni'), ...list('settori'), ...list('servizi-citta')]
const targets = process.argv.slice(2).length ? process.argv.slice(2).map((a) => a.replace(/^content\/local\//, '')) : allFiles

for (const rel of allFiles) {
  try {
    const d = read(rel)
    if (rel.startsWith('comuni/')) for (const l of d.locations ?? []) addPage(`comune:${l.slug}`, l, ['answer', 'economy', 'challenges', 'body'])
    if (rel.startsWith('settori/')) for (const s of d.sectors ?? []) addPage(`settore:${s.slug}`, s, ['answer', 'problem', 'body'])
    if (rel.startsWith('servizi-citta/')) for (const it of d.items ?? []) addPage(`${d.location}/${it.service}`, it, ['answer', 'body'])
  } catch { /* JSON non valido: segnalato sotto se è tra i target */ }
}
// pagine servizio già pubblicate, per non riciclarne le frasi
for (const f of existsSync(path.join(here, '../services')) ? readdirSync(path.join(here, '../services')) : []) {
  const d = JSON.parse(readFileSync(path.join(here, '../services', f), 'utf8'))
  for (const s of d.services) addPage(`servizio:${s.slug}`, s, ['answer', 'problem', 'body'])
}

for (const rel of targets) {
  console.log(`\n${rel}`)
  let d: any
  try { d = read(rel) } catch (e: any) { err(rel, `file mancante o JSON non valido: ${e.message}`); continue }

  if (rel.startsWith('comuni/')) {
    const batch = path.basename(rel, '.json')
    const expected = plan.batches[batch]?.comuni.map((c: string) => slugify(c))
    if (!expected) { err(rel, 'batch non presente in piano.json'); continue }
    const got = (d.locations ?? []).map((l: any) => l.slug)
    if (JSON.stringify(expected) !== JSON.stringify(got)) err(rel, `comuni attesi ${expected.join(', ')} — trovati ${got.join(', ')}`)
    for (const l of d.locations ?? []) {
      const where = `comune:${l.slug}`
      common(where, l, 4, 5)
      const info = COMUNI.get(l.slug)
      if (info && l.province !== info.province) err(where, `provincia ${l.province}, attesa ${info.province}`)
      if (info && l.name !== info.name) err(where, `nome "${l.name}", atteso "${info.name}"`)
      if (!l.answer?.includes(l.name)) err(where, 'answer non nomina il comune')
      const ew = words(l.economy), cw = words(l.challenges), bw = words(l.body)
      if (ew < 160 || ew > 360) err(where, `economy ${ew} parole (160–360)`)
      if (cw < 110 || cw > 280) err(where, `challenges ${cw} parole (110–280)`)
      if (bw < 330) err(where, `body ${bw} parole (min 330)`)
      if ((l.body?.match(/^## /gm) ?? []).length < 2) err(where, 'body con meno di 2 sezioni ##')
      if (!Array.isArray(l.highlights) || l.highlights.length < 4 || l.highlights.length > 6) err(where, `highlights ${l.highlights?.length} (4–6)`)
      if (!(l.distanceKm >= 0) || !(l.travelMinutes > 0) && l.slug !== 'cattolica') err(where, 'distanceKm/travelMinutes mancanti')
      if (!(l.geo?.lat > 43 && l.geo?.lat < 44.3 && l.geo?.lng > 12 && l.geo?.lng < 13.2)) err(where, `coordinate fuori zona: ${JSON.stringify(l.geo)}`)
      for (const s of l.sectors ?? []) if (!SECTORS.has(s)) err(where, `settore non valido: ${s}`)
      if ((l.sectors ?? []).length < 2 || l.sectors.length > 4) err(where, `sectors ${l.sectors?.length} (2–4)`)
      for (const s of l.services ?? []) if (!SERVICES.has(s)) err(where, `servizio non valido: ${s}`)
      if ((l.services ?? []).length < 4 || l.services.length > 6) err(where, `services ${l.services?.length} (4–6)`)
      for (const n of l.nearby ?? []) if (!COMUNI.has(n) || n === l.slug) err(where, `comune vicino non valido: ${n}`)
      if ((l.nearby ?? []).length < 3 || l.nearby.length > 5) err(where, `nearby ${l.nearby?.length} (3–5)`)
      checkLinks(where, l.economy, l.challenges, l.body)
      const total = words(l.answer) + words(l.economy) + words(l.challenges) + words(l.body) + faqWords(l)
      if (total < 900) err(where, `totale ${total} parole (min 900)`)
      else console.log(`  ✓ ${where} · ${total} parole`)
    }
  } else if (rel.startsWith('settori/')) {
    const batch = path.basename(rel, '.json')
    const expected = plan.sectors[batch]?.map(([s]: string[]) => s)
    if (!expected) { err(rel, 'batch non presente in piano.json'); continue }
    const got = (d.sectors ?? []).map((s: any) => s.slug)
    if (JSON.stringify(expected) !== JSON.stringify(got)) err(rel, `settori attesi ${expected.join(', ')} — trovati ${got.join(', ')}`)
    for (const s of d.sectors ?? []) {
      const where = `settore:${s.slug}`
      common(where, s, 5, 6)
      const pw = words(s.problem), bw = words(s.body)
      if (pw < 130 || pw > 280) err(where, `problem ${pw} parole (130–280)`)
      if (bw < 650) err(where, `body ${bw} parole (min 650)`)
      if ((s.body?.match(/^## /gm) ?? []).length < 4) err(where, 'body con meno di 4 sezioni ##')
      if (!Array.isArray(s.process) || s.process.length < 4 || s.process.length > 5) err(where, `process ${s.process?.length} (4–5)`)
      for (const x of s.services ?? []) if (!SERVICES.has(x)) err(where, `servizio non valido: ${x}`)
      if ((s.services ?? []).length < 4 || s.services.length > 6) err(where, `services ${s.services?.length} (4–6)`)
      for (const x of s.locations ?? []) if (!COMUNI.has(x)) err(where, `comune non valido: ${x}`)
      if ((s.locations ?? []).length < 3 || s.locations.length > 10) err(where, `locations ${s.locations?.length} (3–10)`)
      for (const c of s.caseStudies ?? []) if (!CASES.includes(c)) err(where, `caso studio non valido: ${c}`)
      if (!links(s.body).some((l) => l.startsWith('/agenzia-marketing/'))) err(where, 'il body deve linkare almeno un comune')
      checkLinks(where, s.problem, s.body)
      const total = words(s.answer) + pw + bw + faqWords(s) + (s.process ?? []).reduce((n: number, p: any) => n + words(p.title) + words(p.description), 0)
      if (total < 1100) err(where, `totale ${total} parole (min 1100)`)
      else console.log(`  ✓ ${where} · ${total} parole`)
    }
  } else if (rel.startsWith('servizi-citta/')) {
    const city = path.basename(rel, '.json')
    if (!LS_CITIES.includes(city) || d.location !== city) err(rel, `comune non previsto o non corrispondente: ${d.location}`)
    const got = (d.items ?? []).map((i: any) => i.service)
    if (JSON.stringify(got) !== JSON.stringify(LS_SERVICES)) err(rel, `servizi attesi ${LS_SERVICES.join(', ')} — trovati ${got.join(', ')}`)
    for (const it of d.items ?? []) {
      const where = `${city}/${it.service}`
      common(where, it, 4, 5)
      const bw = words(it.body)
      if (bw < 450) err(where, `body ${bw} parole (min 450)`)
      if ((it.body?.match(/^## /gm) ?? []).length < 3) err(where, 'body con meno di 3 sezioni ##')
      const ls = links(it.body)
      if (!ls.includes(SERVICE_URL.get(it.service)!)) err(where, `manca il link alla pagina del servizio ${SERVICE_URL.get(it.service)}`)
      if (!ls.includes(`/agenzia-marketing/${city}`)) err(where, `manca il link alla pagina del comune /agenzia-marketing/${city}`)
      checkLinks(where, it.body)
      const total = words(it.answer) + bw + faqWords(it)
      if (total < 700) err(where, `totale ${total} parole (min 700)`)
      else console.log(`  ✓ ${where} · ${total} parole`)
    }
  } else err(rel, 'percorso non riconosciuto')
}

// Frasi lunghe ripetute tra pagine diverse (le pagine dei target contro tutto il resto)
const targetIds = new Set<string>()
for (const rel of targets) {
  try {
    const d = read(rel)
    for (const l of d.locations ?? []) targetIds.add(`comune:${l.slug}`)
    for (const s of d.sectors ?? []) targetIds.add(`settore:${s.slug}`)
    for (const it of d.items ?? []) targetIds.add(`${d.location}/${it.service}`)
  } catch { /* già segnalato */ }
}
const owners = new Map<string, Set<string>>()
for (const [id, text] of pageTexts) {
  for (const sent of text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').split(/(?<=[.!?])\s+/)) {
    const s = sent.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
    if (s.split(' ').length >= 12) owners.set(s, (owners.get(s) ?? new Set()).add(id))
  }
}
for (const [s, ids] of owners) {
  if (ids.size > 1 && [...ids].some((i) => targetIds.has(i))) err('duplicati', `frase ripetuta in ${[...ids].join(', ')}: "${s.slice(0, 90)}…"`)
}

console.log(errors ? `\n${errors} problemi` : '\nTutto valido')
process.exit(errors ? 1 : 0)
