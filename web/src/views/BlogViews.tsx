import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { JsonLd } from '@/components/cms/JsonLd'
import { countWords, RichText } from '@/components/cms/RichText'
import { Reveal, RevealLines } from '@/components/site/Reveal'
import { Container, Kicker, formatDate } from '@/components/site/ui'
import { DICT } from '@/i18n/dict'
import { getCategories, getCategory, getPost, getPosts } from '@/lib/cms'
import { absolute, paths, type Locale } from '@/lib/paths'
import { articleNode, breadcrumbNode, faqNode, graph } from '@/lib/schema'
import { notFoundOrRedirect } from '@/lib/redirects'
import { buildMetadata } from '@/lib/seo'
import type { Category, Post, Service } from '@/payload-types'

const other = (l: Locale): Locale => (l === 'it' ? 'en' : 'it')

const readMinutes = (p: Post) => p.readingMinutes || Math.max(1, Math.round(countWords(p.content as any) / 220))

const PostCard = ({ post, locale }: { post: Post; locale: Locale }) => {
  const t = DICT[locale]
  const cat = typeof post.category === 'object' ? post.category : null
  return (
    <Link href={paths.post(post.slug!, locale)} className="group flex flex-col justify-between p-8 md:p-10 border-r border-b border-white/10 hover:bg-violet-900/10 transition-colors min-h-[320px]">
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-8">
          <span className="text-violet-400">{cat?.title}</span>
          <span>
            {readMinutes(post)} {t.common.readMin}
          </span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-black uppercase leading-none tracking-tight text-white group-hover:text-violet-400 transition-colors mb-5">
          {post.title}
        </h2>
        <p className="text-neutral-400 line-clamp-3">{post.excerpt}</p>
      </div>
      <div className="mt-8 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500">
        <span>{formatDate(post.publishedAt, locale)}</span>
        <span className="inline-flex items-center gap-2 group-hover:text-violet-400">
          {t.insights.readMore} <ArrowUpRight size={12} />
        </span>
      </div>
    </Link>
  )
}

const CategoryNav = ({ categories, active, locale }: { categories: Category[]; active?: string; locale: Locale }) => {
  const t = DICT[locale]
  const chip = (isActive: boolean) =>
    `inline-block text-[11px] font-mono uppercase tracking-[0.18em] px-3 py-2 border transition-colors ${
      isActive ? 'border-violet-500 text-white bg-violet-500/10' : 'border-white/10 text-neutral-400 hover:border-violet-500 hover:text-violet-400'
    }`
  return (
    <nav aria-label={locale === 'en' ? 'Categories' : 'Categorie'} className="flex flex-wrap gap-2 mb-12">
      <Link href={paths.blog(locale)} className={chip(!active)}>
        {t.insights.all}
      </Link>
      {categories.map((c) => (
        <Link key={c.id} href={paths.category(c.slug!, locale)} className={chip(active === c.id)}>
          {c.title}
        </Link>
      ))}
    </nav>
  )
}

const PostGrid = ({ posts, locale }: { posts: Post[]; locale: Locale }) =>
  posts.length ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} locale={locale} />
      ))}
    </div>
  ) : (
    <p className="text-neutral-500">{DICT[locale].insights.empty}</p>
  )

// ─── /blog ─────────────────────────────────────────────────────────────────

export const blogMetadata = async (locale: Locale) => {
  const t = DICT[locale]
  return buildMetadata({
    locale,
    title: locale === 'en' ? 'Blog · marketing, SEO, AI' : 'Blog · marketing, SEO e AI',
    description: t.insights.body,
    path: paths.blog(locale),
    altPath: paths.blog(other(locale)),
    ogKicker: 'Blog',
  })
}

export const BlogHub = async ({ locale }: { locale: Locale }) => {
  const t = DICT[locale]
  const [{ docs }, categories] = await Promise.all([getPosts({ locale, limit: 60 }), getCategories(locale)])
  const used = categories.filter((c) => docs.some((p) => (typeof p.category === 'object' ? p.category?.id : p.category) === c.id))

  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbNode([
            { name: t.nav.home, path: paths.home(locale) },
            { name: 'Blog', path: paths.blog(locale) },
          ]),
          {
            '@type': 'Blog',
            '@id': `${absolute(paths.blog(locale))}#blog`,
            name: 'not4sale Blog',
            url: absolute(paths.blog(locale)),
            inLanguage: locale,
            blogPost: docs.slice(0, 20).map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: absolute(paths.post(p.slug!, locale)) })),
          },
        )}
      />
      <section className="relative pt-40 pb-16 md:pt-56 md:pb-24 grain">
        <Container>
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">{t.insights.kicker}</Reveal>
          <h1 className="h-display text-white text-6xl sm:text-8xl md:text-[10vw]">
            <RevealLines lines={[t.insights.headlineLines[0], <span key="2" className="stroke-text-violet">{t.insights.headlineLines[1]}</span>]} />
          </h1>
          <Reveal delay={0.3} className="mt-10 max-w-2xl text-lg md:text-xl text-neutral-300 leading-relaxed">
            {t.insights.body}
          </Reveal>
        </Container>
      </section>
      <section className="pb-24 md:pb-40">
        <Container>
          <CategoryNav categories={used} locale={locale} />
          <PostGrid posts={docs} locale={locale} />
        </Container>
      </section>
    </>
  )
}

// ─── /blog/categoria/{slug} ────────────────────────────────────────────────

export const categoryMetadata = async (slug: string, locale: Locale) => {
  const c = await getCategory(slug, locale)
  if (!c) return {}
  return buildMetadata({
    locale,
    title: `${c.title} · Blog`,
    description: c.description || DICT[locale].insights.body,
    path: paths.category(slug, locale),
    altPath: paths.category(slug, other(locale)),
    ogKicker: 'Blog',
  })
}

export const CategoryView = async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const t = DICT[locale]
  const category = await getCategory(slug, locale)
  if (!category) return notFoundOrRedirect(paths.category(slug, locale))
  const [{ docs }, categories, all] = await Promise.all([
    getPosts({ locale, category: category.id, limit: 60 }),
    getCategories(locale),
    getPosts({ locale, limit: 200 }),
  ])
  const used = categories.filter((c) => all.docs.some((p) => (typeof p.category === 'object' ? p.category?.id : p.category) === c.id))
  const area = typeof category.area === 'object' ? category.area : null

  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbNode([
            { name: t.nav.home, path: paths.home(locale) },
            { name: 'Blog', path: paths.blog(locale) },
            { name: category.title, path: paths.category(slug, locale) },
          ]),
        )}
      />
      <section className="relative pt-40 pb-16 md:pt-56 md:pb-20 grain">
        <Container>
          <Kicker className="mb-6">
            <Link href={paths.blog(locale)} className="hover:text-white">
              ← Blog
            </Link>
          </Kicker>
          <h1 className="h-display text-white text-5xl sm:text-7xl md:text-[8vw]">
            <RevealLines lines={[<span key="1">{category.title}<span className="text-violet-500">.</span></span>]} />
          </h1>
          {category.description && <Reveal delay={0.3} className="mt-10 max-w-2xl text-lg md:text-xl text-neutral-300 leading-relaxed">{category.description}</Reveal>}
          {area?.slug && (
            <Link href={paths.area(area.slug, locale)} className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.24em] text-neutral-400 hover:text-violet-400">
              {t.nav.services} · {area.title} <ArrowUpRight size={14} />
            </Link>
          )}
        </Container>
      </section>
      <section className="pb-24 md:pb-40">
        <Container>
          <CategoryNav categories={used} active={category.id} locale={locale} />
          <PostGrid posts={docs} locale={locale} />
        </Container>
      </section>
    </>
  )
}

// ─── /blog/{slug} ──────────────────────────────────────────────────────────

export const postMetadata = async (slug: string, locale: Locale) => {
  const post = await getPost(slug, locale)
  if (!post) return {}
  const cat = typeof post.category === 'object' ? post.category : null
  return buildMetadata({
    locale,
    title: post.title,
    description: post.excerpt,
    path: paths.post(slug, locale),
    altPath: paths.post(slug, other(locale)),
    type: 'article',
    meta: post.meta,
    ogKicker: cat?.title ?? 'Blog',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  })
}

export const PostView = async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const t = DICT[locale]
  const post = await getPost(slug, locale)
  if (!post) return notFoundOrRedirect(paths.post(slug, locale))

  const cat = typeof post.category === 'object' ? post.category : null
  const author = typeof post.author === 'object' ? post.author : null
  const services = (post.relatedServices ?? []).filter((s): s is Service => typeof s === 'object' && s?._status === 'published')
  const relatedPosts = (post.relatedPosts ?? []).filter((p): p is Post => typeof p === 'object' && p?._status === 'published')
  const more = relatedPosts.length
    ? relatedPosts
    : cat
      ? (await getPosts({ locale, category: cat.id, limit: 4 })).docs.filter((p) => p.id !== post.id).slice(0, 3)
      : []

  return (
    <>
      <JsonLd
        data={graph(
          articleNode(post, locale),
          breadcrumbNode([
            { name: t.nav.home, path: paths.home(locale) },
            { name: 'Blog', path: paths.blog(locale) },
            ...(cat ? [{ name: cat.title, path: paths.category(cat.slug!, locale) }] : []),
            { name: post.title, path: paths.post(slug, locale) },
          ]),
          faqNode(post.faq),
        )}
      />
      <article className="relative pt-40 pb-24 md:pt-48 md:pb-32 grain">
        <div className="max-w-[900px] mx-auto px-5 md:px-10">
          <Link
            href={cat ? paths.category(cat.slug!, locale) : paths.blog(locale)}
            className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-8 inline-flex items-center gap-2 hover:text-white"
          >
            <ArrowLeft size={12} /> {cat?.title ?? 'Blog'}
          </Link>

          <h1 className="h-display text-white text-5xl sm:text-6xl md:text-7xl mb-6 text-balance">{post.title}</h1>
          <p className="text-xl md:text-2xl text-neutral-300 mb-10 leading-relaxed">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 border-y border-white/10 py-4 mb-12">
            {author && (
              <Link href={`${paths.about(locale)}#${author.slug}`} className="hover:text-violet-400" rel="author">
                {author.name}
              </Link>
            )}
            <span>·</span>
            <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt, locale)}</time>
            <span>·</span>
            <span>
              {readMinutes(post)} {t.common.readMin}
            </span>
          </div>

          {post.answer && (
            <div className="mb-12 border-l-2 border-violet-500 pl-6">
              <Kicker className="mb-3">{t.serviceDetail.inShort}</Kicker>
              <p className="text-lg md:text-xl text-white leading-relaxed">{post.answer}</p>
            </div>
          )}

          <RichText data={post.content as any} />

          {!!post.faq?.length && (
            <section className="mt-20">
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white mb-6">{t.insights.faq}</h2>
              <div className="border-t border-white/10">
                {post.faq.map((f, i) => (
                  <div key={f.id ?? i} className="py-6 border-b border-white/10">
                    <h3 className="font-display text-xl font-bold text-white mb-2">{f.question}</h3>
                    <p className="text-neutral-400 leading-relaxed">{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {services.length > 0 && (
            <div className="mt-16 pt-10 border-t border-white/10">
              <Kicker className="mb-4">{t.serviceDetail.related}</Kicker>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => {
                  const a = typeof s.area === 'object' ? s.area : null
                  return a ? (
                    <Link
                      key={s.id}
                      href={paths.service(a.slug!, s.slug!, locale)}
                      className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-300 border border-white/10 px-3 py-2 hover:border-violet-500 hover:text-violet-400 transition-colors"
                    >
                      {s.title}
                    </Link>
                  ) : null
                })}
              </div>
            </div>
          )}

          {author && (
            <div className="mt-16 flex gap-6 items-start border border-white/10 p-8">
              <div>
                <Kicker className="mb-2">{t.insights.by}</Kicker>
                <div className="font-display text-2xl font-black uppercase text-white">{author.name}</div>
                <div className="text-sm text-violet-400 mb-3">{author.role}</div>
                {author.bio && <p className="text-neutral-400 text-sm leading-relaxed line-clamp-4">{author.bio}</p>}
              </div>
            </div>
          )}

          <div className="mt-16 border border-violet-500/30 p-8 md:p-10 bg-violet-900/10">
            <Kicker className="mb-3">{t.insights.ctaKicker}</Kicker>
            <h2 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-none mb-6">{t.insights.ctaTitle}</h2>
            <div className="flex flex-wrap gap-3">
              <Link href={paths.quote(locale)} className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-white font-display font-bold uppercase tracking-[0.18em] text-xs hover:bg-violet-400 transition-colors">
                {t.hero.ctaQuote} <ArrowUpRight size={14} />
              </Link>
              <Link
                href={paths.contact(locale)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-display font-bold uppercase tracking-[0.18em] text-xs hover:border-violet-500 hover:text-violet-400 transition-colors"
              >
                {t.common.letsTalk} <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="pb-24 md:pb-32">
          <Container>
            <Kicker className="mb-10">{t.serviceDetail.relatedPosts}</Kicker>
            <PostGrid posts={more} locale={locale} />
          </Container>
        </section>
      )}
    </>
  )
}
