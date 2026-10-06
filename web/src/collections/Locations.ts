import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { answerField, faqField } from '../fields/faq'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

// Comuni in cui lavoriamo. URL: /agenzia-marketing/{slug}
// Ogni pagina deve avere contenuto davvero locale: economia, sfide, settori di quel comune.
export const Locations: CollectionConfig = {
  slug: 'locations',
  labels: { singular: 'Comune', plural: 'Comuni' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'province', 'zone', '_status', 'updatedAt'],
    group: 'Territorio',
    listSearchableFields: ['name', 'slug'],
  },
  defaultSort: 'name',
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 20 },
  hooks: { afterChange: [revalidateCollection('local')], afterDelete: [revalidateCollectionDelete('local')] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', label: 'Comune', type: 'text', required: true },
        {
          name: 'province',
          label: 'Provincia',
          type: 'select',
          required: true,
          options: [
            { label: 'Rimini (RN)', value: 'RN' },
            { label: 'Pesaro e Urbino (PU)', value: 'PU' },
          ],
        },
        { name: 'zone', label: 'Zona', type: 'text', admin: { description: 'Es. Valconca, Riviera, Montefeltro' } },
      ],
    },
    { name: 'headline', label: 'H1', type: 'text' },
    { name: 'short', label: 'Descrizione breve', type: 'textarea', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenuto',
          fields: [
            answerField,
            { name: 'economy', label: 'Economia e territorio', type: 'richText' },
            { name: 'challenges', label: 'Le sfide per le aziende del comune', type: 'richText' },
            { name: 'body', label: 'Come lavoriamo qui', type: 'richText' },
          ],
        },
        { label: 'FAQ', fields: [faqField] },
        {
          label: 'Territorio',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'distanceKm', label: 'Km da Cattolica', type: 'number' },
                { name: 'travelMinutes', label: 'Minuti da Cattolica', type: 'number' },
              ],
            },
            {
              name: 'geo',
              type: 'group',
              label: 'Coordinate del centro',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'lat', type: 'number' },
                    { name: 'lng', type: 'number' },
                  ],
                },
              ],
            },
            { name: 'highlights', label: 'Elementi del territorio', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
          ],
        },
        {
          label: 'Collegamenti',
          fields: [
            { name: 'sectors', label: 'Settori forti', type: 'relationship', relationTo: 'sectors', hasMany: true },
            { name: 'services', label: 'Servizi in evidenza', type: 'relationship', relationTo: 'services', hasMany: true },
            {
              name: 'nearby',
              label: 'Comuni vicini',
              type: 'relationship',
              relationTo: 'locations',
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
            },
          ],
        },
      ],
    },
    slugField('name'),
  ],
}
