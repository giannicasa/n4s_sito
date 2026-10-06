import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { answerField, faqField } from '../fields/faq'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

// Articoli del blog. URL: /blog/{slug}
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Articolo', plural: 'Articoli' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', 'publishedAt', '_status'],
    group: 'Blog',
  },
  defaultSort: '-publishedAt',
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: { autosave: { interval: 2000 }, schedulePublish: true }, maxPerDoc: 30 },
  hooks: {
    afterChange: [revalidateCollection('posts')],
    afterDelete: [revalidateCollectionDelete('posts')],
  },
  fields: [
    { name: 'title', label: 'Titolo', type: 'text', required: true, localized: true },
    {
      name: 'excerpt',
      label: 'Sommario',
      type: 'textarea',
      localized: true,
      required: true,
      admin: { description: '1–2 frasi per le card e i risultati di ricerca.' },
    },
    { name: 'cover', label: 'Immagine di copertina', type: 'upload', relationTo: 'media' },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenuto',
          fields: [
            answerField,
            { name: 'content', label: 'Testo', type: 'richText', localized: true, required: true },
          ],
        },
        { label: 'FAQ', fields: [faqField] },
        {
          label: 'Collegamenti',
          fields: [
            {
              name: 'relatedServices',
              label: 'Servizi collegati',
              type: 'relationship',
              relationTo: 'services',
              hasMany: true,
              admin: { description: "L'articolo linka questi servizi e compare nelle loro pagine." },
            },
            {
              name: 'relatedPosts',
              label: 'Articoli correlati',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
            },
          ],
        },
      ],
    },
    slugField(),
    {
      name: 'category',
      label: 'Categoria',
      type: 'relationship',
      relationTo: 'categories',
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      label: 'Autore',
      type: 'relationship',
      relationTo: 'authors',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: 'Data di pubblicazione',
      type: 'date',
      index: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) return new Date()
            return value
          },
        ],
      },
    },
    {
      name: 'readingMinutes',
      label: 'Minuti di lettura',
      type: 'number',
      admin: { position: 'sidebar', description: 'Calcolato in automatico se vuoto.' },
    },
  ],
}
