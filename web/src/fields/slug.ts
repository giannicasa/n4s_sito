import type { Field } from 'payload'

export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Slug derivato dal titolo se lasciato vuoto. Unico per collezione.
export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: "Parte finale dell'URL. Se vuoto viene generato dal titolo.",
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const source = data?.[from]
        if (typeof source === 'string') return slugify(source)
        if (source && typeof source === 'object' && typeof source.it === 'string') return slugify(source.it)
        return value
      },
    ],
  },
})
