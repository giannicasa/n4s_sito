import { readFileSync, writeFileSync } from 'node:fs'
import { geoConicConformal, geoPath } from 'd3-geo'
const gj = JSON.parse(readFileSync('regions-s.geojson', 'utf8'))
// GeoJSON (RFC 7946) usa anelli antiorari, d3 li vuole orari: si invertono
for (const f of gj.features) {
  const g = f.geometry
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
  for (const poly of polys) for (const ring of poly) ring.reverse()
}
const W = 600, H = 720
const proj = geoConicConformal().parallels([38, 46]).rotate([-12.5, 0]).fitSize([W, H], gj)
const path = geoPath(proj).digits(1)
const slug = (s) => s.split('/')[0].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const name = (s) => ({ "Valle d'Aosta/Vallée d'Aoste": "Valle d'Aosta", 'Trentino-Alto Adige/Südtirol': 'Trentino-Alto Adige' })[s] ?? s
const regions = gj.features.map((f) => {
  const n = name(f.properties.reg_name)
  const [cx, cy] = path.centroid(f)
  return { slug: slug(n), name: n, d: path(f), cx: Math.round(cx), cy: Math.round(cy) }
})
// San Marino e Cattolica come punti
const [smx, smy] = proj([12.4578, 43.9424]); const [cax, cay] = proj([12.7383, 43.9637])
const out = { width: W, height: H, regions, points: { sanMarino: [Math.round(smx), Math.round(smy)], cattolica: [Math.round(cax), Math.round(cay)] } }
writeFileSync('italy-map.json', JSON.stringify(out))
console.log(regions.map((r) => r.slug).join(', '), '| KB', Math.round(JSON.stringify(out).length / 1024))
