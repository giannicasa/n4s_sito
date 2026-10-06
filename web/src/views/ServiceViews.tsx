import { ArrowUpRight, Check } from 'lucide-react'
import Link from 'next/link'

import { JsonLd } from '@/components/cms/JsonLd'
import { hasRichText, RichText } from '@/components/cms/RichText'
import ContactForm from '@/components/site/ContactForm'
import Marquee from '@/components/site/Marquee'
import { Reveal, RevealLines } from '@/components/site/Reveal'
import { Container, Crumbs, Kicker, LinkCard, PrimaryButton } from '@/components/site/ui'
import { DICT } from '@/i18n/dict'
import { getArea, getAreas, getCategories, getPosts, getService, getServices } from '@/lib/cms'
import { absolute, paths, type Locale } from '@/lib/paths'
import { areaNode, breadcrumbNode, faqNode, graph, serviceNode } from '@/lib/schema'
import { notFoundOrRedirect } from '@/lib/redirects'
import { buildMetadata } from '@/lib/seo'
import type { CaseStudy, Post, Service, ServiceArea } from '@/payload-types'

const plain = (title?: string | null) => (title ?? '').replace(/\s·\s.*/, '')

// Una pagina è "piena" quando ha almeno la risposta diretta o un testo: le altre restano fuori dall'indice.
const isThin = (doc: { answer?: string | null; body?: any }) =>
  !doc.answer && !hasRichText(doc.body)

// ─── Hub /servizi ──────────────────────────────────────────────────────────

export const servicesHubMetadata = async (locale: Locale) => {
  const t = DICT[locale]
  return buildMetadata({
    locale,
    title:
      locale === 'en'
        ? 'Services · Integrated marketing'
        : 'Servizi di marketing · Agenzia a Cattolica',
    description: t.servicesHub.body,
    path: paths.services(locale),
    altPath: paths.services(locale === 'it' ? 'en' : 'it'),
    ogKicker: t.nav.services,
  })
}

export const ServicesHub = async ({ locale }: { locale: Locale }) => {
  const t = DICT[locale]
  const [areas, services] = await Promise.all([getAreas(locale), getServices(locale)])
  const byArea = (id: string) =>
    services.filter((s) => (typeof s.area === 'object' ? s.area?.id : s.area) === id)

  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbNode([
            { name: t.nav.home, path: paths.home(locale) },
            { name: t.nav.services, path: paths.services(locale) },
          ]),
          {
            '@type': 'ItemList',
            name: t.nav.services,
            itemListElement: areas.map((a, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: a.title,
              url: absolute(paths.area(a.slug!, locale)),
            })),
          },
        )}
      />
      <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 grain">
        <Container>
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            {t.servicesHub.kicker} · {areas.length} {locale === 'en' ? 'areas' : 'aree'}
          </Reveal>
          <h1 className="h-display text-white text-6xl sm:text-8xl md:text-[12vw]">
            <RevealLines
              lines={[
                t.servicesHub.headlineLines[0],
                <span key="2">
                  <span className="stroke-text">
                    {t.servicesHub.headlineLines[1].split(' ')[0]}
                  </span>{' '}
                  <span className="text-violet-500">
                    {t.servicesHub.headlineLines[1].split(' ').slice(1).join(' ')}
                  </span>
                </span>,
              ]}
            />
          </h1>
          <Reveal
            delay={0.3}
            className="mt-10 max-w-2xl text-lg md:text-xl text-neutral-300 leading-relaxed"
          >
            {t.servicesHub.body}
          </Reveal>
        </Container>
      </section>

      <section className="pb-24 md:pb-40">
        <Container>
          <div className="border-t border-white/10">
            {areas.map((a) => {
              const children = byArea(a.id)
              return (
                <div
                  key={a.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-10 md:py-14 border-b border-white/10"
                >
                  <Link
                    href={paths.area(a.slug!, locale)}
                    className="group lg:col-span-5 flex items-baseline gap-6 md:gap-10 min-w-0"
                  >
                    <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-violet-400 w-10 shrink-0">
                      {a.code}
                    </span>
                    <span>
                      <span className="block font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-white group-hover:text-violet-400 transition-colors">
                        {plain(a.title)}
                        <ArrowUpRight
                          size={28}
                          className="inline ml-3 text-neutral-600 group-hover:text-violet-400 align-baseline"
                        />
                      </span>
                      <span className="block mt-3 text-sm text-neutral-500 max-w-md">
                        {a.short}
                      </span>
                    </span>
                  </Link>
                  {children.length > 0 && (
                    <ul className="lg:col-span-7 flex flex-wrap content-start gap-2 lg:pt-2">
                      {children.map((s) => (
                        <li key={s.id}>
                          <Link
                            href={paths.service(a.slug!, s.slug!, locale)}
                            className="inline-block text-xs font-mono uppercase tracking-[0.16em] text-neutral-300 border border-white/10 px-3 py-2 hover:border-violet-500 hover:text-violet-400 transition-colors"
                          >
                            {plain(s.title)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 border-y border-white/5 overflow-hidden">
        <Marquee
          items={
            locale === 'en'
              ? ['MULTIDISCIPLINARY', 'INTEGRATED', 'ACCOUNTABLE', 'DATA-LED', 'CREATIVE']
              : ['MULTIDISCIPLINARE', 'INTEGRATO', 'ACCOUNTABLE', 'DATA-LED', 'CREATIVO']
          }
          speed="fast"
        />
      </section>
    </>
  )
}

// ─── Blocchi condivisi da area e servizio ──────────────────────────────────

const FaqBlock = ({
  faq,
  locale,
}: {
  faq?: { question: string; answer: string; id?: string | null }[] | null
  locale: Locale
}) => {
  if (!faq?.length) return null
  const t = DICT[locale]
  return (
    <section className="py-24 md:py-32">
      <Container className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <Reveal as="h2" className="h-display text-white text-5xl md:text-6xl">
            {t.serviceDetail.faq.split(' ').map((w: string, i: number) => (
              <span key={i} className={i === 1 ? 'stroke-text block' : 'block'}>
                {w}
              </span>
            ))}
          </Reveal>
        </div>
        <div className="md:col-span-8">
          <div className="border-t border-white/10">
            {faq.map((f, i) => (
              <Reveal
                key={f.id ?? i}
                delay={0.05 * i}
                className="py-6 md:py-8 border-b border-white/10"
              >
                <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight text-white mb-3">
                  {f.question}
                </h3>
                <p className="text-neutral-400 leading-relaxed text-base md:text-lg">{f.answer}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

const PostsBlock = ({ posts, locale }: { posts: Post[]; locale: Locale }) => {
  if (!posts.length) return null
  const t = DICT[locale]
  return (
    <section className="py-24 md:py-32 border-t border-white/5">
      <Container>
        <Kicker className="mb-10">{t.serviceDetail.relatedPosts}</Kicker>
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-white/10">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={paths.post(p.slug!, locale)}
              className="group p-8 border-r border-b border-white/10 hover:bg-violet-900/10 transition-colors"
            >
              <h3 className="font-display text-2xl font-black uppercase leading-none tracking-tight text-white group-hover:text-violet-400 transition-colors mb-4">
                {p.title}
              </h3>
              <p className="text-sm text-neutral-400 line-clamp-3">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

const CasesBlock = ({ cases, locale }: { cases: CaseStudy[]; locale: Locale }) => {
  if (!cases.length) return null
  const t = DICT[locale]
  return (
    <section className="py-24 md:py-32 bg-ink-100">
      <Container>
        <Kicker className="mb-10">{t.serviceDetail.cases}</Kicker>
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-white/10">
          {cases.map((cs) => (
            <Link
              key={cs.id}
              href={paths.caseStudies(locale)}
              className="group p-8 md:p-12 border-r border-b border-white/10 hover:bg-violet-900/10 transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-8">
                <span>{cs.code}</span>
                <span>{cs.industry}</span>
              </div>
              <h3 className="font-display text-3xl font-black uppercase leading-none tracking-tight text-white mb-6 group-hover:text-violet-400 transition-colors">
                {cs.title}
              </h3>
              <div className="text-violet-500 font-mono text-sm uppercase tracking-[0.18em] mb-4">
                {cs.metric}
              </div>
              <p className="text-neutral-400">{cs.excerpt}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

const ContactBlock = ({
  titlePlain,
  locale,
  aside,
}: {
  titlePlain: string
  locale: Locale
  aside?: React.ReactNode
}) => {
  const t = DICT[locale]
  return (
    <section className="py-24 md:py-32 bg-black border-t border-white/5">
      <Container className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7">
          <Reveal as="h2" className="h-display text-white text-4xl md:text-6xl mb-3">
            {t.serviceDetail.startWith} {titlePlain}.
          </Reveal>
          <Reveal delay={0.2} className="text-neutral-400 max-w-xl mb-10">
            {t.serviceDetail.formSub}
          </Reveal>
          <ContactForm defaultService={titlePlain} />
        </div>
        <div className="lg:col-span-5">{aside}</div>
      </Container>
    </section>
  )
}

const NextCard = ({
  href,
  kicker,
  title,
  locale,
}: {
  href: string
  kicker: string
  title: string
  locale: Locale
}) => (
  <Link
    href={href}
    className="group block border border-white/10 hover:border-violet-500 p-8 md:p-12 transition-colors"
  >
    <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
      {kicker}
    </div>
    <div className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-white group-hover:text-violet-400 transition-colors leading-none">
      {title}
    </div>
    <div className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.24em] text-neutral-400 group-hover:text-violet-400">
      {locale === 'en' ? 'go' : 'vai'} <ArrowUpRight size={14} />
    </div>
  </Link>
)

// Apertura con H1 e risposta diretta: il blocco che motori e AI leggono per primo.
const Hero = ({
  crumbs,
  headline,
  title,
  answer,
  short,
  locale,
}: {
  crumbs: { label: string; href?: string }[]
  headline?: string | null
  title: string
  answer?: string | null
  short?: string | null
  locale: Locale
}) => {
  const t = DICT[locale]
  return (
    <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 grain">
      <Container>
        <Crumbs items={crumbs} />
        <h1 className="h-display text-white text-5xl sm:text-7xl md:text-[8vw] leading-[0.88] text-balance">
          <RevealLines
            lines={[
              <span key="1">
                {headline || title}
                <span className="text-violet-500">.</span>
              </span>,
            ]}
          />
        </h1>
        {answer ? (
          <Reveal delay={0.3} className="mt-12 max-w-3xl">
            <Kicker className="mb-4">{t.serviceDetail.inShort}</Kicker>
            <p className="text-xl md:text-2xl text-neutral-200 leading-relaxed">{answer}</p>
          </Reveal>
        ) : (
          <Reveal
            delay={0.3}
            className="mt-12 max-w-3xl text-xl md:text-2xl text-neutral-200 leading-relaxed"
          >
            {short}
          </Reveal>
        )}
      </Container>
    </section>
  )
}

// ─── Macro-area /servizi/{area} ────────────────────────────────────────────

const other = (l: Locale): Locale => (l === 'it' ? 'en' : 'it')

export const areaMetadata = async (slug: string, locale: Locale) => {
  const [area, alt] = await Promise.all([getArea(slug, locale), getArea(slug, other(locale))])
  if (!area) return {}
  return buildMetadata({
    locale,
    title: area.headline || area.title,
    description: area.short,
    path: paths.area(slug, locale),
    // hreflang solo verso una versione con testo, altrimenti punterebbe a una pagina noindex
    altPath: alt && !isThin(alt) ? paths.area(slug, other(locale)) : null,
    meta: area.meta,
    ogKicker: `${area.code} · ${DICT[locale].nav.services}`,
    noindex: isThin(area) && locale === 'en',
  })
}

export const AreaView = async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const t = DICT[locale]
  const area = await getArea(slug, locale)
  if (!area) return notFoundOrRedirect(paths.area(slug, locale))

  const [services, areas, categories] = await Promise.all([
    getServices(locale, area.id),
    getAreas(locale),
    getCategories(locale),
  ])
  // articoli della categoria blog collegata a questa area
  const category = categories.find(
    (c) => (typeof c.area === 'object' ? c.area?.id : c.area) === area.id,
  )
  const areaPosts = category
    ? (await getPosts({ locale, category: category.id, limit: 3 })).docs
    : []
  const titlePlain = plain(area.title)
  const idx = areas.findIndex((a) => a.id === area.id)
  const next = areas[(idx + 1) % areas.length]

  return (
    <>
      <JsonLd
        data={graph(
          areaNode(area, services, locale),
          breadcrumbNode([
            { name: t.nav.home, path: paths.home(locale) },
            { name: t.nav.services, path: paths.services(locale) },
            { name: titlePlain, path: paths.area(slug, locale) },
          ]),
          faqNode(area.faq),
        )}
      />
      <Hero
        crumbs={[
          { label: t.common.backToServices, href: paths.services(locale) },
          { label: `${area.code} · ${titlePlain}` },
        ]}
        headline={area.headline}
        title={titlePlain}
        answer={area.answer}
        short={area.short}
        locale={locale}
      />

      {services.length > 0 && (
        <section className="py-24 md:py-32 bg-ink-100">
          <Container>
            <Kicker className="mb-10">
              {t.serviceDetail.areaServices} · {services.length}
            </Kicker>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
              {services.map((s, i) => (
                <LinkCard
                  key={s.id}
                  href={paths.service(slug, s.slug!, locale)}
                  code={`${area.code}.${String(i + 1).padStart(2, '0')}`}
                  title={plain(s.title)}
                  text={s.short}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {hasRichText(area.body) && (
        <section className="py-24 md:py-32">
          <Container className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3">
              <Kicker className="md:sticky md:top-32">{t.serviceDetail.deepDive}</Kicker>
            </div>
            <div className="md:col-span-8 max-w-3xl">
              <RichText data={area.body} />
            </div>
          </Container>
        </section>
      )}

      <FaqBlock faq={area.faq} locale={locale} />
      <PostsBlock posts={areaPosts} locale={locale} />
      <ContactBlock
        titlePlain={titlePlain}
        locale={locale}
        aside={
          next && next.id !== area.id ? (
            <NextCard
              href={paths.area(next.slug!, locale)}
              kicker={`${t.common.next} · ${next.code}`}
              title={plain(next.title)}
              locale={locale}
            />
          ) : null
        }
      />
    </>
  )
}

// ─── Servizio /servizi/{area}/{servizio} ───────────────────────────────────

const priceLabel = (s: Service, locale: Locale) => {
  const p = s.pricing
  if (!p?.from) return null
  const t = DICT[locale].serviceDetail
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(n)
  const range = p.to ? `${fmt(p.from)} – ${fmt(p.to)}` : `${t.pricingFrom} ${fmt(p.from)}`
  return { range, unit: p.unit === 'month' ? t.perMonth : t.perProject, note: p.note }
}

export const serviceMetadata = async (areaSlug: string, slug: string, locale: Locale) => {
  const [s, alt] = await Promise.all([getService(areaSlug, slug, locale), getService(areaSlug, slug, other(locale))])
  if (!s) return {}
  const area = s.area as ServiceArea
  return buildMetadata({
    locale,
    title: s.headline || `${plain(s.title)} · ${plain(area.title)}`,
    description: s.short,
    path: paths.service(areaSlug, slug, locale),
    altPath: alt && !isThin(alt) ? paths.service(areaSlug, slug, other(locale)) : null,
    meta: s.meta,
    ogKicker: `${area.code} · ${plain(area.title)}`,
    noindex: isThin(s),
  })
}

export const ServiceView = async ({
  areaSlug,
  slug,
  locale,
}: {
  areaSlug: string
  slug: string
  locale: Locale
}) => {
  const t = DICT[locale]
  const s = await getService(areaSlug, slug, locale)
  if (!s) return notFoundOrRedirect(paths.service(areaSlug, slug, locale))
  const area = s.area as ServiceArea

  const [siblings, postsRes] = await Promise.all([
    getServices(locale, area.id),
    getPosts({ locale, service: s.id, limit: 3 }),
  ])
  const titlePlain = plain(s.title)
  const areaPlain = plain(area.title)
  const idx = siblings.findIndex((x) => x.id === s.id)
  const next = siblings.length > 1 ? siblings[(idx + 1) % siblings.length] : null
  const related = (s.related ?? []).filter(
    (r): r is Service => typeof r === 'object' && r?._status === 'published',
  )
  const cases = (s.caseStudies ?? []).filter((c): c is CaseStudy => typeof c === 'object')
  const price = priceLabel(s, locale)

  return (
    <>
      <JsonLd
        data={graph(
          serviceNode(s, area, locale),
          breadcrumbNode([
            { name: t.nav.home, path: paths.home(locale) },
            { name: t.nav.services, path: paths.services(locale) },
            { name: areaPlain, path: paths.area(areaSlug, locale) },
            { name: titlePlain, path: paths.service(areaSlug, slug, locale) },
          ]),
          faqNode(s.faq),
        )}
      />
      <Hero
        crumbs={[
          { label: t.common.backToServices, href: paths.services(locale) },
          { label: `${area.code} · ${areaPlain}`, href: paths.area(areaSlug, locale) },
          { label: titlePlain },
        ]}
        headline={s.headline}
        title={titlePlain}
        answer={s.answer}
        short={s.short}
        locale={locale}
      />

      {(hasRichText(s.problem) || s.deliverables?.length) && (
        <section className="py-24 md:py-32 bg-ink-100">
          <Container className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {hasRichText(s.problem) && (
              <div className="md:col-span-7">
                {
                  <>
                    <Kicker className="mb-6">{t.serviceDetail.problem}</Kicker>
                    <RichText data={s.problem} className="text-lg" />
                  </>
                }
              </div>
            )}
            {!!s.deliverables?.length && (
              <div className={hasRichText(s.problem) ? 'md:col-span-5' : 'md:col-span-12'}>
                <Kicker className="mb-6">{t.serviceDetail.whatYouGet}</Kicker>
                <ul
                  className={
                    hasRichText(s.problem)
                      ? 'space-y-4'
                      : 'grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4'
                  }
                >
                  {s.deliverables.map((d, i) => (
                    <Reveal
                      as="li"
                      key={d.id ?? i}
                      delay={0.05 * i}
                      className="flex gap-4 border-b border-white/10 pb-4"
                    >
                      <Check size={20} className="text-violet-500 mt-1 shrink-0" />
                      <span className="text-neutral-200">{d.item}</span>
                    </Reveal>
                  ))}
                </ul>
              </div>
            )}
          </Container>
        </section>
      )}

      {!!s.process?.length && (
        <section className="py-24 md:py-32">
          <Container>
            <Kicker className="mb-10">{t.serviceDetail.method}</Kicker>
            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
              {s.process.map((p, i) => (
                <li key={p.id ?? i} className="bg-black p-8">
                  <div className="font-mono text-violet-500 text-sm mb-6">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-3 leading-none">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="text-neutral-400 leading-relaxed">{p.description}</p>
                  )}
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {hasRichText(s.body) && (
        <section className="py-24 md:py-32 border-t border-white/5">
          <Container className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3">
              <Kicker className="md:sticky md:top-32">{t.serviceDetail.deepDive}</Kicker>
            </div>
            <div className="md:col-span-8 max-w-3xl">
              <RichText data={s.body} />
            </div>
          </Container>
        </section>
      )}

      {price && (
        <section className="py-24 md:py-32 bg-ink-100">
          <Container className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
            <div className="md:col-span-7">
              <Kicker className="mb-6">{t.serviceDetail.pricing}</Kicker>
              <div className="h-display text-white text-5xl md:text-7xl">{price.range}</div>
              <div className="mt-3 font-mono text-sm uppercase tracking-[0.18em] text-violet-400">
                {price.unit}
              </div>
              {price.note && <p className="mt-6 text-neutral-400 max-w-xl">{price.note}</p>}
            </div>
            <div className="md:col-span-5 md:text-right">
              <PrimaryButton href={paths.quote(locale)} variant="violet">
                {t.serviceDetail.pricingCta}
              </PrimaryButton>
            </div>
          </Container>
        </section>
      )}

      <FaqBlock faq={s.faq} locale={locale} />
      <CasesBlock cases={cases} locale={locale} />

      {related.length > 0 && (
        <section className="py-24 md:py-32 border-t border-white/5">
          <Container>
            <Kicker className="mb-10">{t.serviceDetail.related}</Kicker>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
              {related.map((r) => {
                const ra = typeof r.area === 'object' ? r.area : null
                return ra ? (
                  <LinkCard
                    key={r.id}
                    href={paths.service(ra.slug!, r.slug!, locale)}
                    code={plain(ra.title)}
                    title={plain(r.title)}
                    text={r.short}
                  />
                ) : null
              })}
            </div>
          </Container>
        </section>
      )}

      <PostsBlock posts={postsRes.docs} locale={locale} />
      <ContactBlock
        titlePlain={titlePlain}
        locale={locale}
        aside={
          next ? (
            <NextCard
              href={paths.service(areaSlug, next.slug!, locale)}
              kicker={`${t.common.next} · ${areaPlain}`}
              title={plain(next.title)}
              locale={locale}
            />
          ) : (
            <NextCard
              href={paths.area(areaSlug, locale)}
              kicker={t.serviceDetail.areaServices}
              title={areaPlain}
              locale={locale}
            />
          )
        }
      />
    </>
  )
}
