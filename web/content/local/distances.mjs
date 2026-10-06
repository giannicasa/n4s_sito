// Ricalcola distanceKm e travelMinutes dal centro di Cattolica con il router OSRM (dati OpenStreetMap).
// Uso: node content/local/distances.mjs [--dry]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'comuni')
const CATTOLICA = { lat: 43.9637, lng: 12.7383 }
const dry = process.argv.includes('--dry')

const route = async (to) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${CATTOLICA.lng},${CATTOLICA.lat};${to.lng},${to.lat}?overview=false`
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url).catch(() => null)
    if (r?.ok) {
      const j = await r.json()
      if (j.routes?.[0]) return j.routes[0]
    }
    await new Promise((res) => setTimeout(res, 1500 * (i + 1)))
  }
  return null
}

for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const file = path.join(dir, f)
  const data = JSON.parse(readFileSync(file, 'utf8'))
  for (const l of data.locations) {
    if (l.slug === 'cattolica') continue
    const r = await route(l.geo)
    if (!r) { console.log(`✗ ${l.slug}: nessun percorso`); continue }
    const km = Math.round(r.distance / 1000)
    // OSRM è ottimista su strade secondarie e traffico: +15%, arrotondato a 5 minuti
    const min = Math.max(5, Math.round((r.duration / 60) * 1.15 / 5) * 5)
    console.log(`${l.slug.padEnd(28)} ${String(l.distanceKm).padStart(4)} km → ${String(km).padStart(4)} km · ${String(l.travelMinutes).padStart(4)}' → ${String(min).padStart(4)}'`)
    l.distanceKm = km
    l.travelMinutes = min
    await new Promise((res) => setTimeout(res, 300))
  }
  if (!dry) writeFileSync(file, JSON.stringify(data, null, 2))
}
