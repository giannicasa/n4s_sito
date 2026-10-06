import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

// Autori pubblici (i soci). Alimentano lo schema Person e i segnali E-E-A-T.
export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Autore', plural: 'Autori' },
  admin: { useAsTitle: 'name', group: 'Blog' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    afterChange: [revalidateCollection('authors')],
    afterDelete: [revalidateCollectionDelete('authors')],
  },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    { name: 'role', label: 'Ruolo', type: 'text', localized: true },
    { name: 'photo', label: 'Foto', type: 'upload', relationTo: 'media' },
    { name: 'bio', label: 'Bio', type: 'textarea', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'years', label: 'Anni', type: 'text', admin: { width: '30%', description: 'Es. 25Y' } },
        { name: 'yearsLabel', label: 'Etichetta anni', type: 'text', localized: true },
      ],
    },
    { name: 'vibe', label: 'Motto', type: 'text', localized: true },
    {
      name: 'skills',
      label: 'Competenze',
      type: 'array',
      localized: true,
      fields: [{ name: 'skill', type: 'text', required: true }],
    },
    {
      name: 'sameAs',
      label: 'Profili esterni',
      type: 'array',
      admin: { description: 'LinkedIn ecc. Rafforzano l\'entità autore per Google e le AI.' },
      fields: [{ name: 'url', type: 'text', required: true }],
    },
    { name: 'color', label: 'Colore', type: 'text', defaultValue: '#ffffff', admin: { position: 'sidebar' } },
    { name: 'order', label: 'Ordine', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    slugField('name'),
  ],
}
