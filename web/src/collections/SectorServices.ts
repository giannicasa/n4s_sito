import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { answerField, faqField } from '../fields/faq'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

// Servizio declinato su un settore (es. siti web per hotel). URL: /settori/{settore}/{servizio}
// Create solo dove l'analisi delle ricerche ha mostrato domanda reale.
export const SectorServices: CollectionConfig = {
  slug: 'sector-services',
  labels: { singular: 'Servizio per settore', plural: 'Servizi per settore' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'sector', 'service', '_status'], group: 'Territorio' },
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 20 },
  hooks: { afterChange: [revalidateCollection('local')], afterDelete: [revalidateCollectionDelete('local')] },
  fields: [
    { name: 'title', label: 'Titolo interno', type: 'text', required: true, admin: { description: 'Es. "Siti web · Hotel"' } },
    {
      type: 'row',
      fields: [
        { name: 'sector', label: 'Settore', type: 'relationship', relationTo: 'sectors', required: true, index: true },
        { name: 'service', label: 'Servizio', type: 'relationship', relationTo: 'services', required: true, index: true },
      ],
    },
    { name: 'headline', label: 'H1', type: 'text', required: true },
    { name: 'short', label: 'Descrizione breve', type: 'textarea', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenuto',
          fields: [
            answerField,
            { name: 'problem', label: 'Le sfide', type: 'richText' },
            {
              name: 'process',
              label: 'Come lavoriamo',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', label: 'Passo', type: 'text', required: true },
                { name: 'description', label: 'Descrizione', type: 'textarea' },
              ],
            },
            { name: 'body', label: 'Testo', type: 'richText' },
          ],
        },
        { label: 'FAQ', fields: [faqField] },
      ],
    },
  ],
}
