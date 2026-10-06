import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { answerField, faqField } from '../fields/faq'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

// Servizio declinato su una città. URL: /agenzia-marketing/{comune}/{servizio}
export const LocalServices: CollectionConfig = {
  slug: 'local-services',
  labels: { singular: 'Servizio in città', plural: 'Servizi in città' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'location', 'service', '_status'], group: 'Territorio' },
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 20 },
  hooks: { afterChange: [revalidateCollection('local')], afterDelete: [revalidateCollectionDelete('local')] },
  fields: [
    { name: 'title', label: 'Titolo interno', type: 'text', required: true, admin: { description: 'Es. "Google Ads · Rimini"' } },
    {
      type: 'row',
      fields: [
        { name: 'location', label: 'Comune', type: 'relationship', relationTo: 'locations', required: true, index: true },
        { name: 'service', label: 'Servizio', type: 'relationship', relationTo: 'services', required: true, index: true },
      ],
    },
    { name: 'headline', label: 'H1', type: 'text', required: true },
    { name: 'short', label: 'Descrizione breve', type: 'textarea', required: true },
    {
      type: 'tabs',
      tabs: [
        { label: 'Contenuto', fields: [answerField, { name: 'body', label: 'Testo', type: 'richText' }] },
        { label: 'FAQ', fields: [faqField] },
      ],
    },
  ],
}
