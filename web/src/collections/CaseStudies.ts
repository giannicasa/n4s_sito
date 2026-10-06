import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'Caso studio', plural: 'Casi studio' },
  admin: { useAsTitle: 'title', defaultColumns: ['code', 'title', 'metric', '_status'], group: 'Servizi' },
  defaultSort: 'order',
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [revalidateCollection('case-studies')],
    afterDelete: [revalidateCollectionDelete('case-studies')],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'code', label: 'Codice', type: 'text', admin: { width: '25%', description: 'Es. CS·001' } },
        { name: 'industry', label: 'Settore', type: 'text', localized: true },
      ],
    },
    { name: 'title', label: 'Titolo', type: 'text', required: true, localized: true },
    { name: 'metric', label: 'Risultato chiave', type: 'text', localized: true, admin: { description: 'Es. +312% revenue YoY' } },
    { name: 'excerpt', label: 'Sintesi', type: 'textarea', localized: true },
    {
      name: 'levers',
      label: 'Leve',
      type: 'array',
      localized: true,
      fields: [{ name: 'lever', type: 'text', required: true }],
    },
    { name: 'body', label: 'Racconto', type: 'richText', localized: true },
    {
      name: 'services',
      label: 'Servizi usati',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
    },
    slugField(),
    { name: 'order', label: 'Ordine', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
  ],
}
