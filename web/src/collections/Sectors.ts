import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { answerField, faqField } from '../fields/faq'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

// Settori di mercato (immobiliare, nautica…). URL: /settori/{slug}
export const Sectors: CollectionConfig = {
  slug: 'sectors',
  labels: { singular: 'Settore', plural: 'Settori' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status', 'updatedAt'], group: 'Territorio' },
  defaultSort: 'order',
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 20 },
  hooks: { afterChange: [revalidateCollection('local')], afterDelete: [revalidateCollectionDelete('local')] },
  fields: [
    { name: 'title', label: 'Settore', type: 'text', required: true },
    { name: 'headline', label: 'H1', type: 'text' },
    { name: 'short', label: 'Descrizione breve', type: 'textarea', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenuto',
          fields: [
            answerField,
            { name: 'problem', label: 'Le sfide del settore', type: 'richText' },
            {
              name: 'process',
              label: 'Come lavoriamo nel settore',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', label: 'Passo', type: 'text', required: true },
                { name: 'description', label: 'Descrizione', type: 'textarea' },
              ],
            },
            { name: 'body', label: 'Approfondimento', type: 'richText' },
          ],
        },
        { label: 'FAQ', fields: [faqField] },
        {
          label: 'Collegamenti',
          fields: [
            { name: 'services', label: 'Servizi chiave', type: 'relationship', relationTo: 'services', hasMany: true },
            {
              name: 'locations',
              label: 'Comuni dove il settore è forte',
              type: 'relationship',
              relationTo: 'locations',
              hasMany: true,
            },
            { name: 'caseStudies', label: 'Casi studio', type: 'relationship', relationTo: 'case-studies', hasMany: true },
          ],
        },
      ],
    },
    slugField(),
    { name: 'order', label: 'Ordine', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
  ],
}
