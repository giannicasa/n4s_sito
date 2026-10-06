import { getAreas, getPosts, getServices } from '@/lib/cms'
import { absolute, paths } from '@/lib/paths'

// llms.txt: indice in Markdown dei contenuti principali, pensato per gli assistenti AI.
// Facoltativo (Google lo ignora), ma utile ad agenti e motori che lo leggono.
export const revalidate = 3600

export async function GET() {
  const [areas, services, { docs: posts }] = await Promise.all([getAreas('it'), getServices('it'), getPosts({ locale: 'it', limit: 50 })])
  const lines: string[] = [
    '# not4sale',
    '',
    '> Studio di marketing a Cattolica (RN), Italia. Strategia, growth, SEO, visibilità nelle AI (AEO/GEO), advertising, social, branding, contenuti, siti web, e-commerce, CRM, automazioni AI e analytics per PMI e brand.',
    '',
    `- [Servizi](${absolute(paths.services())})`,
    `- [Chi siamo](${absolute(paths.about())})`,
    `- [Casi studio](${absolute(paths.caseStudies())})`,
    `- [Contatti](${absolute(paths.contact())})`,
    `- [Preventivo](${absolute(paths.quote())})`,
    '',
  ]
  for (const a of areas) {
    lines.push(`## ${a.title}`, '', `- [${a.title}](${absolute(paths.area(a.slug!))}): ${a.short}`)
    for (const s of services.filter((x) => (typeof x.area === 'object' ? x.area?.id : x.area) === a.id)) {
      lines.push(`- [${s.title}](${absolute(paths.service(a.slug!, s.slug!))}): ${s.short}`)
    }
    lines.push('')
  }
  if (posts.length) {
    lines.push('## Blog', '')
    for (const p of posts) lines.push(`- [${p.title}](${absolute(paths.post(p.slug!))}): ${p.excerpt}`)
  }
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
