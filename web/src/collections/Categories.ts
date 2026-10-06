import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Categoria', plural: 'Categorie' },
  admin: { useAsTitle: 'title', group: 'Blog' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    afterChange: [revalidateCollection('posts')],
    afterDelete: [revalidateCollectionDelete('posts')],
  },
  fields: [
    { name: 'title', label: 'Nome', type: 'text', required: true, localized: true },
    { name: 'description', label: 'Descrizione', type: 'textarea', localized: true },
    {
      name: 'area',
      label: 'Macro-area collegata',
      type: 'relationship',
      relationTo: 'service-areas',
      admin: { description: 'Gli articoli della categoria compaiono nella pagina della macro-area.' },
    },
    slugField(),
  ],
}
