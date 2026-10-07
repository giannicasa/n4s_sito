import { ArrowUpRight, Car, Check, MapPin } from 'lucide-react'
import Link from 'next/link'

import { JsonLd } from '@/components/cms/JsonLd'
import { hasRichText, RichText } from '@/components/cms/RichText'
import ItalyMap, { type MapRegion } from '@/components/site/ItalyMap'
import { Reveal, RevealLines } from '@/components/site/Reveal'
import { Chips, Container, Crumbs, Kicker, LinkCard } from '@/components/site/ui'
import { getLocalService, getLocalServices, getLocation, getLocations, getSector, getSectors, getSectorService, getSectorServices } from '@/lib/cms'
import { absolute, paths } from '@/lib/paths'
import { notFoundOrRedirect } from '@/lib/redirects'
import { regionOf, regionSlug } from '@/lib/regions'
import { breadcrumbNode, faqNode, graph, localServiceNode, locationNode, sectorNode, sectorServiceNode } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import type { CaseStudy, LocalService, Location, Sector, SectorService, Service } from '@/payload-types'

import { CasesBlock, ContactBlock, FaqBlock, Hero, NextCard, plain } from './ServiceViews'

// Pagine territoriali (solo italiano): indice comuni, comune, servizio in città, indice settori, settore.

const PROVINCE_NAME = { RN: 'Provincia di Rimini', PU: 'Provincia di Pesaro e Urbino' } as const
const HOME = { name: 'Home', path: paths.home('it') }
const WHERE = { name: 'Dove lavoriamo', path: paths.locations() }
const SECTORS = { name: 'Settori', path: paths.sectors() }

const objects = <T,>(list: (T | string | number)[] | null | undefined) =>
  (list ?? []).filter((x): x is T => typeof x === 'object' && x !== null && (x as any)._status !== 'draft')

const serviceHref = (s: Service) => (typeof s.area === 'object' && s.area ? paths.service(s.area.slug!, s.slug!) : paths.services())

const TwoCol = ({ kicker, children, aside, tone = 'dark' }: { kicker: string; children: React.ReactNode; aside?: React.ReactNode; tone?: 'dark' | 'ink' }) => (
  <section className={`py-24 md:py-32 ${tone === 'ink' ? 'bg-ink-100' : 'border-t border-white/5'}`}>
    <Container className="grid grid-cols-1 md:grid-cols-12 gap-12">
      <div className="md:col-span-7">
        <Kicker className="mb-6">{kicker}</Kicker>
        {children}
      </div>
      {aside && <div className="md:col-span-5">{aside}</div>}
    </Container>
  </section>
)

// ─── /agenzia-marketing ────────────────────────────────────────────────────

export const locationsHubMetadata = () =>
  buildMetadata({
    locale: 'it',
    title: 'Agenzia di marketing in Romagna, Marche e in tutta Italia: dove lavoriamo',
    description:
      'Da Cattolica lavoriamo con le imprese dei comuni delle province di Rimini e di Pesaro e Urbino e con aziende delle principali città italiane. Strategie pensate per ogni territorio.',
    path: paths.locations(),
    ogKicker: 'Dove lavoriamo',
  })

export const LocationsHub = async () => {
  const locations = await getLocations()
  const local = locations.filter((l) => l.scope !== 'italia')
  const national = locations.filter((l) => l.scope === 'italia')
  const regions = [...new Set(national.map((l) => l.region || 'Altre città'))].sort((a, b) => a.localeCompare(b, 'it'))
  const byProvince = (['RN', 'PU'] as const).map((p) => {
    const list = local.filter((l) => l.province === p)
    const zones = [...new Set(list.map((l) => l.zone || 'Altri comuni'))]
    return { p, zones: zones.map((z) => ({ z, list: list.filter((l) => (l.zone || 'Altri comuni') === z) })) }
  })

  return (
    <>
      <JsonLd
        data={graph(breadcrumbNode([HOME, WHERE]), {
          '@type': 'ItemList',
          name: 'Comuni in cui lavoriamo',
          itemListElement: locations.map((l, i) => ({ '@type': 'ListItem', position: i + 1, name: l.name, url: absolute(paths.location(l.slug!)) })),
        })}
      />
      <section className="relative pt-40 pb-20 md:pt-56 md:pb-28 grain">
        <Container>
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            Dove lavoriamo · {locations.length} città e comuni
          </Reveal>
          <h1 className="h-display text-white text-5xl sm:text-7xl md:text-[9vw]">
            <RevealLines lines={['dalla riviera', <span key="2" className="stroke-text-violet">all'appennino.</span>]} />
          </h1>
          <Reveal delay={0.3} className="mt-10 max-w-3xl text-lg md:text-xl text-neutral-300 leading-relaxed">
            Siamo a Cattolica, sul confine tra Romagna e Marche. Lavoriamo con le imprese di tutti i comuni delle province di Rimini e di
            Pesaro e Urbino, dalla costa ai borghi del Montefeltro, e le incontriamo di persona. Seguiamo anche aziende delle principali città
            italiane, a distanza e con trasferte per i momenti che contano. Scegli la tua città: trovi come lavoriamo lì e cosa serve davvero
            alle aziende del territorio.
          </Reveal>
        </Container>
      </section>

      <section className="py-16 md:py-24 border-t border-white/5">
        <Container>
          <ItalyMap regions={mapRegions(locations)} />
        </Container>
      </section>

      {byProvince.map(({ p, zones }) =>
        zones.length ? (
          <section key={p} className="py-20 md:py-28 border-t border-white/5">
            <Container>
              <h2 className="h-display text-white text-4xl md:text-6xl mb-12">{PROVINCE_NAME[p]}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {zones.map(({ z, list }) => (
                  <div key={z}>
                    <Kicker className="mb-4">{z}</Kicker>
                    <ul className="space-y-2">
                      {list.map((l) => (
                        <li key={l.id}>
                          <Link href={paths.location(l.slug!)} className="group inline-flex items-center gap-2 text-lg text-neutral-200 hover:text-violet-400 transition-colors">
                            <MapPin size={14} className="text-violet-500" /> {l.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        ) : null,
      )}

      {national.length > 0 && (
        <section className="py-20 md:py-28 border-t border-white/5">
          <Container>
            <h2 className="h-display text-white text-4xl md:text-6xl mb-12">In tutta Italia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {regions.map((r) => (
                <div key={r}>
                  <Kicker className="mb-4">{r}</Kicker>
                  <ul className="space-y-2">
                    {national
                      .filter((l) => (l.region || 'Altre città') === r)
                      .map((l) => (
                        <li key={l.id}>
                          <Link href={paths.location(l.slug!)} className="group inline-flex items-center gap-2 text-lg text-neutral-200 hover:text-violet-400 transition-colors">
                            <MapPin size={14} className="text-violet-500" /> {l.name}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}

// Dati per la mappa: una voce per ogni regione che ha almeno un comune pubblicato.
const mapRegions = (locations: Location[]): MapRegion[] => {
  const groups = new Map<string, Location[]>()
  for (const l of locations) groups.set(regionOf(l), [...(groups.get(regionOf(l)) ?? []), l])
  return [...groups].map(([name, list]) => ({
    slug: regionSlug(name),
    name,
    href: paths.region(regionSlug(name)),
    cities: list.map((l) => ({ name: l.name, href: paths.location(l.slug!) })),
  }))
}

// ─── /agenzia-marketing/regione/{regione} ──────────────────────────────────

const regionData = async (slug: string) => {
  const locations = await getLocations()
  const list = locations.filter((l) => regionSlug(regionOf(l)) === slug)
  return list.length ? { name: regionOf(list[0]), list, locations } : null
}

export const regionMetadata = async (slug: string) => {
  const r = await regionData(slug)
  if (!r) return {}
  return buildMetadata({
    locale: 'it',
    title: `Agenzia di marketing in ${r.name}: le città in cui lavoriamo`,
    description: `Marketing, siti web, SEO e social per le aziende in ${r.name}: ${r.list
      .slice(0, 6)
      .map((l) => l.name)
      .join(', ')}${r.list.length > 6 ? ' e altre città' : ''}. Lavoriamo da Cattolica, di persona e a distanza.`.slice(0, 160),
    path: paths.region(slug),
    ogKicker: 'Dove lavoriamo',
  })
}

export const RegionView = async ({ slug }: { slug: string }) => {
  const r = await regionData(slug)
  if (!r) return notFoundOrRedirect(paths.region(slug))
  const local = r.list.every((l) => l.scope !== 'italia')
  return (
    <>
      <JsonLd
        data={graph(breadcrumbNode([HOME, WHERE, { name: r.name, path: paths.region(slug) }]), {
          '@type': 'ItemList',
          name: `Città in ${r.name}`,
          itemListElement: r.list.map((l, i) => ({ '@type': 'ListItem', position: i + 1, name: l.name, url: absolute(paths.location(l.slug!)) })),
        })}
      />
      <section className="relative pt-40 pb-16 md:pt-56 md:pb-20 grain">
        <Container>
          <Crumbs items={[{ label: 'Dove lavoriamo', href: paths.locations() }, { label: r.name }]} />
          <h1 className="h-display text-white text-5xl sm:text-7xl md:text-[8vw] leading-[0.88]">
            <RevealLines lines={[<span key="1">Marketing in {r.name}<span className="text-violet-500">.</span></span>]} />
          </h1>
          <Reveal delay={0.3} className="mt-10 max-w-3xl text-lg md:text-xl text-neutral-300 leading-relaxed">
            {local
              ? `Da Cattolica lavoriamo con le imprese di ${r.list.length} comuni in ${r.name}, e le incontriamo di persona. Per ogni comune trovi l'economia del territorio, le sfide tipiche delle aziende e i servizi che servono davvero.`
              : `Seguiamo aziende in ${r.name} da Cattolica: strategia e lavoro operativo a distanza, con trasferte per gli incontri che contano. Per ogni città trovi il contesto economico, le sfide delle imprese e i servizi più utili.`}
          </Reveal>
        </Container>
      </section>
      <section className="py-16 md:py-24 border-t border-white/5">
        <Container>
          <ItalyMap regions={mapRegions(r.locations)} active={slug} />
        </Container>
      </section>
      <section className="pb-24 md:pb-32">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
            {r.list.map((l) => (
              <LinkCard key={l.id} href={paths.location(l.slug!)} code={l.zone || l.province} title={l.name} text={l.short} />
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}

// ─── /agenzia-marketing/{comune} ───────────────────────────────────────────

export const locationMetadata = async (slug: string) => {
  const l = await getLocation(slug)
  if (!l) return {}
  return buildMetadata({
    locale: 'it',
    title: l.headline || `Agenzia di marketing a ${l.name}`,
    description: l.short,
    path: paths.location(slug),
    meta: l.meta,
    ogKicker: `${l.name} · ${l.province}`,
  })
}

export const LocationView = async ({ slug }: { slug: string }) => {
  const l = await getLocation(slug)
  if (!l) return notFoundOrRedirect(paths.location(slug))

  const [localServices] = await Promise.all([getLocalServices({ location: l.id })])
  const sectors = objects<Sector>(l.sectors as any)
  const services = objects<Service>(l.services as any)
  const nearby = objects<Location>(l.nearby as any)

  return (
    <>
      <JsonLd data={graph(locationNode(l), breadcrumbNode([HOME, WHERE, { name: l.name, path: paths.location(slug) }]), faqNode(l.faq))} />
      <Hero
        crumbs={[{ label: 'Dove lavoriamo', href: paths.locations() }, { label: `${l.name} · ${l.province}` }]}
        headline={l.headline}
        title={l.name}
        answer={l.answer}
        short={l.short}
        locale="it"
      />

      <section className="pb-16 -mt-8">
        <Container className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">
          {(l.zone || l.region) && (
            <span className="inline-flex items-center gap-2">
              <MapPin size={14} className="text-violet-500" /> {[l.zone, PROVINCE_NAME[l.province as 'RN' | 'PU'] ?? l.region].filter(Boolean).join(' · ')}
            </span>
          )}
          {l.scope === 'italia' && (l.distanceKm ?? 0) > 120 ? (
            <span className="inline-flex items-center gap-2">
              <Car size={14} className="text-violet-500" /> a distanza, con trasferte per gli incontri chiave
            </span>
          ) : l.slug !== 'cattolica' && l.travelMinutes ? (
            <span className="inline-flex items-center gap-2">
              <Car size={14} className="text-violet-500" /> {l.distanceKm} km · circa {l.travelMinutes} minuti da Cattolica
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Car size={14} className="text-violet-500" /> la nostra sede
            </span>
          )}
          {(l.scope !== 'italia' || (l.distanceKm ?? 0) <= 120) && <span>Incontri di persona</span>}
        </Container>
      </section>

      {hasRichText(l.economy) && (
        <TwoCol
          kicker={`${l.name}: economia e territorio`}
          tone="ink"
          aside={
            <>
              {!!l.highlights?.length && (
                <>
                  <Kicker className="mb-6">Il territorio</Kicker>
                  <ul className="space-y-4 mb-12">
                    {l.highlights.map((h, i) => (
                      <li key={h.id ?? i} className="flex gap-4 border-b border-white/10 pb-4">
                        <Check size={20} className="text-violet-500 mt-1 shrink-0" />
                        <span className="text-neutral-200">{h.item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {sectors.length > 0 && (
                <>
                  <Kicker className="mb-4">Settori forti</Kicker>
                  <Chips items={sectors.map((x) => ({ href: paths.sector(x.slug!), label: x.title }))} />
                </>
              )}
            </>
          }
        >
          <RichText data={l.economy} className="text-lg" />
        </TwoCol>
      )}

      {hasRichText(l.challenges) && (
        <TwoCol kicker={`Le sfide per le aziende di ${l.name}`}>
          <RichText data={l.challenges} className="text-lg" />
        </TwoCol>
      )}

      {hasRichText(l.body) && (
        <section className="py-24 md:py-32 border-t border-white/5">
          <Container className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3">
              <Kicker className="md:sticky md:top-32">Come lavoriamo a {l.name}</Kicker>
            </div>
            <div className="md:col-span-8 max-w-3xl">
              <RichText data={l.body} />
            </div>
          </Container>
        </section>
      )}

      {services.length > 0 && (
        <section className="py-24 md:py-32 bg-ink-100">
          <Container>
            <Kicker className="mb-10">I servizi più utili a {l.name}</Kicker>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
              {services.map((s) => (
                <LinkCard
                  key={s.id}
                  href={serviceHref(s)}
                  code={typeof s.area === 'object' ? plain(s.area?.title) : ''}
                  title={plain(s.title)}
                  text={s.short}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {localServices.length > 0 && (
        <section className="py-24 md:py-32 border-t border-white/5">
          <Container>
            <Kicker className="mb-10">A {l.name}, nel dettaglio</Kicker>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
              {localServices.map((ls) => {
                const svc = ls.service as Service
                return <LinkCard key={ls.id} href={paths.localService(slug, svc.slug!)} code={l.name} title={plain(svc.title)} text={ls.short} />
              })}
            </div>
          </Container>
        </section>
      )}

      <FaqBlock faq={l.faq} locale="it" />

      {nearby.length > 0 && (
        <section className="py-20 border-t border-white/5">
          <Container>
            <Kicker className="mb-6">Comuni vicini</Kicker>
            <Chips items={nearby.map((n) => ({ href: paths.location(n.slug!), label: n.name }))} />
          </Container>
        </section>
      )}

      <ContactBlock
        titlePlain={l.name}
        locale="it"
        aside={<NextCard href={paths.locations()} kicker="Dove lavoriamo" title="Tutti i comuni" locale="it" />}
      />
    </>
  )
}

// ─── /agenzia-marketing/{comune}/{servizio} ────────────────────────────────

export const localServiceMetadata = async (locationSlug: string, serviceSlug: string) => {
  const ls = await getLocalService(locationSlug, serviceSlug)
  if (!ls) return {}
  const l = ls.location as Location
  return buildMetadata({
    locale: 'it',
    title: ls.headline,
    description: ls.short,
    path: paths.localService(locationSlug, serviceSlug),
    meta: ls.meta,
    ogKicker: `${plain((ls.service as Service).title)} · ${l.name}`,
  })
}

export const LocalServiceView = async ({ locationSlug, serviceSlug }: { locationSlug: string; serviceSlug: string }) => {
  const ls = await getLocalService(locationSlug, serviceSlug)
  if (!ls) return notFoundOrRedirect(paths.localService(locationSlug, serviceSlug))
  const l = ls.location as Location
  const svc = ls.service as Service

  const [sameCity, sameService] = await Promise.all([getLocalServices({ location: l.id }), getLocalServices({ service: svc.id })])
  const otherServices = sameCity.filter((x) => x.id !== ls.id)
  const otherCities = sameService.filter((x) => x.id !== ls.id)

  return (
    <>
      <JsonLd
        data={graph(
          localServiceNode(ls, l, svc),
          breadcrumbNode([
            HOME,
            WHERE,
            { name: l.name, path: paths.location(l.slug!) },
            { name: plain(svc.title), path: paths.localService(l.slug!, svc.slug!) },
          ]),
          faqNode(ls.faq),
        )}
      />
      <Hero
        crumbs={[
          { label: 'Dove lavoriamo', href: paths.locations() },
          { label: l.name, href: paths.location(l.slug!) },
          { label: plain(svc.title) },
        ]}
        headline={ls.headline}
        title={plain(svc.title)}
        answer={ls.answer}
        short={ls.short}
        locale="it"
      />

      {hasRichText(ls.body) && (
        <section className="py-24 md:py-32 border-t border-white/5">
          <Container className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3 space-y-6">
              <Kicker>
                {plain(svc.title)} a {l.name}
              </Kicker>
              <Link href={serviceHref(svc)} className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 hover:text-violet-400">
                Il servizio in dettaglio <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="md:col-span-8 max-w-3xl">
              <RichText data={ls.body} />
            </div>
          </Container>
        </section>
      )}

      <FaqBlock faq={ls.faq} locale="it" />

      {(otherServices.length > 0 || otherCities.length > 0) && (
        <section className="py-20 border-t border-white/5">
          <Container className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {otherServices.length > 0 && (
              <div>
                <Kicker className="mb-6">Altri servizi a {l.name}</Kicker>
                <Chips items={otherServices.map((x) => ({ href: paths.localService(l.slug!, (x.service as Service).slug!), label: plain((x.service as Service).title) }))} />
              </div>
            )}
            {otherCities.length > 0 && (
              <div>
                <Kicker className="mb-6">{plain(svc.title)} in altri comuni</Kicker>
                <Chips items={otherCities.map((x) => ({ href: paths.localService((x.location as Location).slug!, svc.slug!), label: (x.location as Location).name }))} />
              </div>
            )}
          </Container>
        </section>
      )}

      <ContactBlock
        titlePlain={`${plain(svc.title)} a ${l.name}`}
        locale="it"
        aside={<NextCard href={paths.location(l.slug!)} kicker="Il territorio" title={l.name} locale="it" />}
      />
    </>
  )
}

// ─── /settori ──────────────────────────────────────────────────────────────

export const sectorsHubMetadata = () =>
  buildMetadata({
    locale: 'it',
    title: 'Marketing per settore: immobiliare, hotel, nautica, moda e altri',
    description:
      'Il marketing cambia da settore a settore. Ecco come lavoriamo con immobiliare, edilizia, manifattura, moda, hotel, ristorazione e gli altri settori del territorio.',
    path: paths.sectors(),
    ogKicker: 'Settori',
  })

export const SectorsHub = async () => {
  const sectors = await getSectors()
  return (
    <>
      <JsonLd
        data={graph(breadcrumbNode([HOME, SECTORS]), {
          '@type': 'ItemList',
          name: 'Settori',
          itemListElement: sectors.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.title, url: absolute(paths.sector(x.slug!)) })),
        })}
      />
      <section className="relative pt-40 pb-20 md:pt-56 md:pb-28 grain">
        <Container>
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">Settori · {sectors.length}</Reveal>
          <h1 className="h-display text-white text-5xl sm:text-7xl md:text-[9vw]">
            <RevealLines lines={['ogni settore', <span key="2" className="stroke-text-violet">ha le sue regole.</span>]} />
          </h1>
          <Reveal delay={0.3} className="mt-10 max-w-3xl text-lg md:text-xl text-neutral-300 leading-relaxed">
            Un hotel della Riviera e un'azienda meccanica della Valle del Foglia non vendono allo stesso modo. Partiamo da come compra il tuo
            cliente, poi scegliamo le leve.
          </Reveal>
        </Container>
      </section>
      <section className="pb-24 md:pb-40">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
            {sectors.map((x, i) => (
              <LinkCard key={x.id} href={paths.sector(x.slug!)} code={String(i + 1).padStart(2, '0')} title={x.title} text={x.short} />
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}

// ─── /settori/{settore} ────────────────────────────────────────────────────

export const sectorMetadata = async (slug: string) => {
  const x = await getSector(slug)
  if (!x) return {}
  return buildMetadata({
    locale: 'it',
    title: x.headline || `Marketing per ${x.title}`,
    description: x.short,
    path: paths.sector(slug),
    meta: x.meta,
    ogKicker: 'Settori',
  })
}

export const SectorView = async ({ slug }: { slug: string }) => {
  const x = await getSector(slug)
  if (!x) return notFoundOrRedirect(paths.sector(slug))
  const services = objects<Service>(x.services as any)
  const locations = objects<Location>(x.locations as any)
  const cases = objects<CaseStudy>(x.caseStudies as any)
  const [sectors, sectorServices] = await Promise.all([getSectors(), getSectorServices({ sector: x.id })])
  const idx = sectors.findIndex((s) => s.id === x.id)
  const next = sectors.length > 1 ? sectors[(idx + 1) % sectors.length] : null

  return (
    <>
      <JsonLd data={graph(sectorNode(x), breadcrumbNode([HOME, SECTORS, { name: x.title, path: paths.sector(slug) }]), faqNode(x.faq))} />
      <Hero
        crumbs={[{ label: 'Settori', href: paths.sectors() }, { label: x.title }]}
        headline={x.headline}
        title={x.title}
        answer={x.answer}
        short={x.short}
        locale="it"
      />

      {hasRichText(x.problem) && (
        <TwoCol
          kicker="Le sfide del settore"
          tone="ink"
          aside={
            services.length > 0 ? (
              <>
                <Kicker className="mb-6">Le leve che usiamo</Kicker>
                <Chips items={services.map((s) => ({ href: serviceHref(s), label: plain(s.title) }))} />
              </>
            ) : null
          }
        >
          <RichText data={x.problem} className="text-lg" />
        </TwoCol>
      )}

      {!!x.process?.length && (
        <section className="py-24 md:py-32">
          <Container>
            <Kicker className="mb-10">Come lavoriamo nel settore</Kicker>
            <ol
              className={`grid grid-cols-1 md:grid-cols-2 ${x.process.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-px bg-white/10 border border-white/10`}
            >
              {x.process.map((p, i) => (
                <li key={p.id ?? i} className="bg-black p-8">
                  <div className="font-mono text-violet-500 text-sm mb-6">{String(i + 1).padStart(2, '0')}</div>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-3 leading-none">{p.title}</h3>
                  {p.description && <p className="text-neutral-400 leading-relaxed">{p.description}</p>}
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {hasRichText(x.body) && (
        <section className="py-24 md:py-32 border-t border-white/5">
          <Container className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3">
              <Kicker className="md:sticky md:top-32">Approfondimento</Kicker>
            </div>
            <div className="md:col-span-8 max-w-3xl">
              <RichText data={x.body} />
            </div>
          </Container>
        </section>
      )}

      {sectorServices.length > 0 && (
        <section className="py-24 md:py-32 bg-ink-100">
          <Container>
            <Kicker className="mb-10">I nostri servizi per {x.title.toLowerCase()}</Kicker>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
              {sectorServices.map((ss) => {
                const svc = ss.service as Service
                return <LinkCard key={ss.id} href={paths.sectorService(slug, svc.slug!)} code={x.title} title={plain(svc.title)} text={ss.short} />
              })}
            </div>
          </Container>
        </section>
      )}

      {locations.length > 0 && (
        <section className="py-20 border-t border-white/5">
          <Container>
            <Kicker className="mb-6">Dove il settore è più forte</Kicker>
            <Chips items={locations.map((l) => ({ href: paths.location(l.slug!), label: l.name }))} />
          </Container>
        </section>
      )}

      <FaqBlock faq={x.faq} locale="it" />
      <CasesBlock cases={cases} locale="it" />
      <ContactBlock
        titlePlain={x.title}
        locale="it"
        aside={next && next.id !== x.id ? <NextCard href={paths.sector(next.slug!)} kicker="Prossimo settore" title={next.title} locale="it" /> : null}
      />
    </>
  )
}

// ─── /settori/{settore}/{servizio} ─────────────────────────────────────────

export const sectorServiceMetadata = async (sectorSlug: string, serviceSlug: string) => {
  const x = await getSectorService(sectorSlug, serviceSlug)
  if (!x) return {}
  return buildMetadata({
    locale: 'it',
    title: x.headline,
    description: x.short,
    path: paths.sectorService(sectorSlug, serviceSlug),
    meta: x.meta,
    ogKicker: `${plain((x.service as Service).title)} · ${(x.sector as Sector).title}`,
  })
}

export const SectorServiceView = async ({ sectorSlug, serviceSlug }: { sectorSlug: string; serviceSlug: string }) => {
  const x = await getSectorService(sectorSlug, serviceSlug)
  if (!x) return notFoundOrRedirect(paths.sectorService(sectorSlug, serviceSlug))
  const sec = x.sector as Sector
  const svc = x.service as Service
  const [sameSector, sameService] = await Promise.all([getSectorServices({ sector: sec.id }), getSectorServices({ service: svc.id })])
  const otherServices = sameSector.filter((o) => o.id !== x.id)
  const otherSectors = sameService.filter((o) => o.id !== x.id)

  return (
    <>
      <JsonLd
        data={graph(
          sectorServiceNode(x, sec, svc),
          breadcrumbNode([
            HOME,
            SECTORS,
            { name: sec.title, path: paths.sector(sec.slug!) },
            { name: plain(svc.title), path: paths.sectorService(sec.slug!, svc.slug!) },
          ]),
          faqNode(x.faq),
        )}
      />
      <Hero
        crumbs={[{ label: 'Settori', href: paths.sectors() }, { label: sec.title, href: paths.sector(sec.slug!) }, { label: plain(svc.title) }]}
        headline={x.headline}
        title={plain(svc.title)}
        answer={x.answer}
        short={x.short}
        locale="it"
      />

      {hasRichText(x.problem) && (
        <TwoCol
          kicker="Le sfide"
          tone="ink"
          aside={
            <>
              <Kicker className="mb-6">Approfondisci</Kicker>
              <Chips
                items={[
                  { href: serviceHref(svc), label: plain(svc.title) },
                  { href: paths.sector(sec.slug!), label: `Marketing per ${sec.title.toLowerCase()}` },
                ]}
              />
            </>
          }
        >
          <RichText data={x.problem} className="text-lg" />
        </TwoCol>
      )}

      {!!x.process?.length && (
        <section className="py-24 md:py-32">
          <Container>
            <Kicker className="mb-10">Come lavoriamo</Kicker>
            <ol
              className={`grid grid-cols-1 md:grid-cols-2 ${x.process.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-px bg-white/10 border border-white/10`}
            >
              {x.process.map((p, i) => (
                <li key={p.id ?? i} className="bg-black p-8">
                  <div className="font-mono text-violet-500 text-sm mb-6">{String(i + 1).padStart(2, '0')}</div>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-3 leading-none">{p.title}</h3>
                  {p.description && <p className="text-neutral-400 leading-relaxed">{p.description}</p>}
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {hasRichText(x.body) && (
        <section className="py-24 md:py-32 border-t border-white/5">
          <Container className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3">
              <Kicker className="md:sticky md:top-32">Approfondimento</Kicker>
            </div>
            <div className="md:col-span-8 max-w-3xl">
              <RichText data={x.body} />
            </div>
          </Container>
        </section>
      )}

      <FaqBlock faq={x.faq} locale="it" />

      {(otherServices.length > 0 || otherSectors.length > 0) && (
        <section className="py-20 border-t border-white/5">
          <Container className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {otherServices.length > 0 && (
              <div>
                <Kicker className="mb-6">Altri servizi per {sec.title.toLowerCase()}</Kicker>
                <Chips items={otherServices.map((o) => ({ href: paths.sectorService(sec.slug!, (o.service as Service).slug!), label: plain((o.service as Service).title) }))} />
              </div>
            )}
            {otherSectors.length > 0 && (
              <div>
                <Kicker className="mb-6">{plain(svc.title)} per altri settori</Kicker>
                <Chips items={otherSectors.map((o) => ({ href: paths.sectorService((o.sector as Sector).slug!, svc.slug!), label: (o.sector as Sector).title }))} />
              </div>
            )}
          </Container>
        </section>
      )}

      <ContactBlock
        titlePlain={`${plain(svc.title)} per ${sec.title.toLowerCase()}`}
        locale="it"
        aside={<NextCard href={paths.sector(sec.slug!)} kicker="Il settore" title={sec.title} locale="it" />}
      />
    </>
  )
}
