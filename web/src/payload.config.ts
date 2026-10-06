import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { it } from '@payloadcms/translations/languages/it'
import path from 'path'
import { buildConfig, type CollectionConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Authors } from './collections/Authors'
import { CaseStudies } from './collections/CaseStudies'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { ServiceAreas } from './collections/ServiceAreas'
import { Services } from './collections/Services'
import { LocalServices } from './collections/LocalServices'
import { Locations } from './collections/Locations'
import { Sectors } from './collections/Sectors'
import { Users } from './collections/Users'
import { Company } from './globals/Company'
import { revalidateCollection } from './hooks/revalidate'
import { absolute, paths } from './lib/paths'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SEO_COLLECTIONS = ['service-areas', 'services', 'locations', 'local-services', 'sectors', 'posts', 'case-studies'] as const

// Percorso pubblico di un documento: anteprima SEO e pulsante "Anteprima" nell'admin.
const docPath = async (doc: any, slug: string | undefined, req: any, locale?: string): Promise<string> => {
  const l = locale === 'en' ? 'en' : 'it'
  switch (slug) {
    case 'service-areas':
      return paths.area(doc.slug, l)
    case 'services': {
      const area =
        typeof doc.area === 'object'
          ? doc.area
          : doc.area
            ? await req.payload.findByID({ collection: 'service-areas', id: doc.area, depth: 0, draft: true })
            : null
      return paths.service(area?.slug ?? 'area', doc.slug, l)
    }
    case 'posts':
      return paths.post(doc.slug, l)
    case 'locations':
      return paths.location(doc.slug)
    case 'sectors':
      return paths.sector(doc.slug)
    case 'local-services': {
      const loc = typeof doc.location === 'object' ? doc.location : await req.payload.findByID({ collection: 'locations', id: doc.location, depth: 0, draft: true })
      const svc = typeof doc.service === 'object' ? doc.service : await req.payload.findByID({ collection: 'services', id: doc.service, depth: 0, draft: true })
      return paths.localService(loc?.slug ?? 'comune', svc?.slug ?? 'servizio')
    }
    default:
      return paths.caseStudies(l)
  }
}

const withPreview = (c: CollectionConfig): CollectionConfig =>
  (SEO_COLLECTIONS as readonly string[]).includes(c.slug)
    ? {
        ...c,
        admin: {
          ...c.admin,
          preview: async (doc, { req, locale }) =>
            `/preview?path=${encodeURIComponent(await docPath(doc, c.slug, req, locale))}`,
        },
      }
    : c

// Origini da cui il pannello può autenticarsi: dominio pubblico, URL Vercel del deploy, sviluppo locale.
const ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
  process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  'http://localhost:3100',
].filter((o): o is string => Boolean(o))

export default buildConfig({
  // serverURL non impostato: il pannello usa URL relativi e funziona su ogni dominio del progetto.
  csrf: ORIGINS,
  cors: ORIGINS,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · not4sale CMS' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: { supportedLanguages: { it, en }, fallbackLanguage: 'it' },
  localization: {
    locales: [
      { code: 'it', label: 'Italiano' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'it',
    fallback: false,
  },
  collections: [ServiceAreas, Services, Locations, LocalServices, Sectors, CaseStudies, Posts, Categories, Authors, Media, Users].map(withPreview),
  globals: [Company],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({ url: process.env.DATABASE_URL || '' }),
  sharp,
  plugins: [
    // Su Vercel il disco non è persistente: i media vanno su Vercel Blob (attivo solo se c'è il token).
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
    seoPlugin({
      collections: [...SEO_COLLECTIONS],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }: any) => (doc?.title ? `${doc.title} · not4sale` : 'not4sale'),
      generateDescription: ({ doc }: any) => doc?.short || doc?.excerpt || '',
      generateURL: async ({ doc, collectionConfig, req, locale }: any) =>
        absolute(await docPath(doc, collectionConfig?.slug, req, locale)),
    }),
    redirectsPlugin({
      collections: ['service-areas', 'services', 'posts'],
      redirectTypes: ['301', '302'],
      overrides: {
        labels: { singular: 'Redirect', plural: 'Redirect' },
        admin: { group: 'Impostazioni' },
        hooks: { afterChange: [revalidateCollection('redirects')] },
      },
    }),
  ],
})
