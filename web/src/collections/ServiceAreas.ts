import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { answerField, faqField } from '../fields/faq'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

// Macro-area di servizio (es. SEO, Advertising). URL: /servizi/{slug}
export const ServiceAreas: CollectionConfig = {
  slug: 'service-areas',
  labels: { singular: 'Macro-area', plural: 'Macro-aree' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'slug', '_status', 'updatedAt'],
    group: 'Servizi',
    description: 'Le pagine principali di /servizi. Ognuna raccoglie i suoi sotto-servizi.',
  },
  defaultSort: 'order',
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 30 },
  hooks: {
    afterChange: [revalidateCollection('services')],
    afterDelete: [revalidateCollectionDelete('services')],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', label: 'Titolo', type: 'text', required: true, localized: true },
        { name: 'code', label: 'Codice', type: 'text', admin: { width: '20%', description: 'Es. 01' } },
      ],
    },
    {
      name: 'headline',
      label: 'H1',
      type: 'text',
      localized: true,
      admin: { description: 'Titolo visibile in pagina, con la parola chiave principale. Se vuoto usa il titolo.' },
    },
    {
      name: 'short',
      label: 'Descrizione breve',
      type: 'textarea',
      localized: true,
      required: true,
      admin: { description: 'Una riga, usata nelle card e negli elenchi.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenuto',
          fields: [
            answerField,
            { name: 'body', label: 'Testo', type: 'richText', localized: true },
          ],
        },
        { label: 'FAQ', fields: [faqField] },
      ],
    },
    slugField(),
    {
      name: 'order',
      label: 'Ordine',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar' },
    },
  ],
}
