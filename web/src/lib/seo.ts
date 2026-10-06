import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { absolute, type Locale } from './paths'

const SITE_NAME = 'not4sale'
const DEFAULT_TITLE = {
  it: 'not4sale — Marketing fuori dal coro · Cattolica',
  en: 'not4sale — Marketing out of tune · Cattolica',
}

type SeoInput = {
  locale: Locale
  title?: string | null
  description?: string | null
  path: string
  // percorso equivalente nell'altra lingua; null se la pagina esiste in una sola lingua
  altPath?: string | null
  type?: 'website' | 'article'
  // override dal tab SEO del CMS
  meta?: { title?: string | null; description?: string | null; image?: string | Media | null } | null
  ogKicker?: string
  publishedTime?: string | null
  modifiedTime?: string | null
  noindex?: boolean
}

export const ogImageUrl = ({ title, subtitle, kicker }: { title: string; subtitle?: string | null; kicker?: string }) => {
  const q = new URLSearchParams({ title })
  if (subtitle) q.set('subtitle', subtitle.slice(0, 140))
  if (kicker) q.set('kicker', kicker)
  return absolute(`/og?${q.toString()}`)
}

export const buildMetadata = ({
  locale,
  title,
  description,
  path,
  altPath,
  type = 'website',
  meta,
  ogKicker,
  publishedTime,
  modifiedTime,
  noindex,
}: SeoInput): Metadata => {
  // Il titolo dal tab SEO è già completo; altrimenti si aggiunge il brand.
  const fullTitle = meta?.title || (title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE[locale])
  const desc = meta?.description || description || undefined
  const url = absolute(path)
  const cmsImage = meta?.image && typeof meta.image === 'object' ? meta.image : null
  const image = cmsImage?.url
    ? absolute(cmsImage.sizes?.og?.url || cmsImage.url)
    : ogImageUrl({ title: title || SITE_NAME, subtitle: desc, kicker: ogKicker })

  const itPath = locale === 'it' ? path : altPath
  const enPath = locale === 'en' ? path : altPath
  const languages: Record<string, string> = {}
  if (itPath) languages.it = absolute(itPath)
  if (enPath) languages.en = absolute(enPath)
  if (itPath) languages['x-default'] = absolute(itPath)

  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: url, languages },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      locale: locale === 'it' ? 'it_IT' : 'en_US',
      images: [{ url: image, width: 1200, height: 630 }],
      ...(type === 'article' ? { publishedTime: publishedTime ?? undefined, modifiedTime: modifiedTime ?? undefined } : {}),
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description: desc, images: [image] },
  }
}
