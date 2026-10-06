import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { answerField, faqField } from '../fields/faq'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

// Sotto-servizio (es. SEO locale). URL: /servizi/{area}/{slug}
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Servizio', plural: 'Servizi' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'area', 'slug', '_status', 'updatedAt'],
    group: 'Servizi',
    listSearchableFields: ['title', 'slug'],
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
    { name: 'title', label: 'Titolo', type: 'text', required: true, localized: true },
    {
      name: 'area',
      label: 'Macro-area',
      type: 'relationship',
      relationTo: 'service-areas',
      required: true,
      index: true,
    },
    {
      name: 'headline',
      label: 'H1',
      type: 'text',
      localized: true,
      admin: { description: 'Titolo in pagina con la keyword principale, es. "Agenzia SEO locale a Rimini e Cattolica".' },
    },
    {
      name: 'short',
      label: 'Descrizione breve',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenuto',
          fields: [
            answerField,
            {
              name: 'problem',
              label: 'Il problema',
              type: 'richText',
              localized: true,
              admin: { description: 'Cosa non funziona oggi per il cliente tipo e perché.' },
            },
            {
              name: 'process',
              label: 'Metodo',
              type: 'array',
              localized: true,
              admin: { description: 'I passi con cui eroghiamo il servizio.', initCollapsed: true },
              fields: [
                { name: 'title', label: 'Passo', type: 'text', required: true },
                { name: 'description', label: 'Descrizione', type: 'textarea' },
              ],
            },
            {
              name: 'deliverables',
              label: 'Cosa ricevi',
              type: 'array',
              localized: true,
              admin: { initCollapsed: true },
              fields: [{ name: 'item', label: 'Deliverable', type: 'text', required: true }],
            },
            { name: 'body', label: 'Approfondimento', type: 'richText', localized: true },
          ],
        },
        {
          label: 'Prezzo',
          fields: [
            {
              name: 'pricing',
              type: 'group',
              admin: { description: 'Fascia indicativa: rassicura e qualifica i contatti. Lascia vuoto per non mostrarla.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'from', label: 'Da (€)', type: 'number' },
                    { name: 'to', label: 'A (€)', type: 'number' },
                    {
                      name: 'unit',
                      label: 'Unità',
                      type: 'select',
                      defaultValue: 'project',
                      options: [
                        { label: 'a progetto', value: 'project' },
                        { label: 'al mese', value: 'month' },
                      ],
                    },
                  ],
                },
                { name: 'note', label: 'Nota', type: 'text', localized: true },
              ],
            },
          ],
        },
        { label: 'FAQ', fields: [faqField] },
        {
          label: 'Collegamenti',
          fields: [
            {
              name: 'related',
              label: 'Servizi correlati',
              type: 'relationship',
              relationTo: 'services',
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
            },
            {
              name: 'caseStudies',
              label: 'Casi studio',
              type: 'relationship',
              relationTo: 'case-studies',
              hasMany: true,
            },
          ],
        },
      ],
    },
    slugField(),
    { name: 'order', label: 'Ordine', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    {
      name: 'wave',
      label: 'Ondata',
      type: 'select',
      admin: { position: 'sidebar', description: 'Priorità editoriale.' },
      options: [
        { label: '1 · subito', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
      ],
    },
  ],
}
