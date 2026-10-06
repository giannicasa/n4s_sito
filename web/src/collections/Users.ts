import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utente', plural: 'Utenti' },
  admin: { useAsTitle: 'email', group: 'Impostazioni' },
  auth: true,
  fields: [{ name: 'name', label: 'Nome', type: 'text' }],
}
