import { slugify } from '@/fields/slug'
import type { Location } from '@/payload-types'

// Regione di un comune: esplicita per le città italiane, dedotta dalla provincia per Rimini e Pesaro e Urbino.
export const regionOf = (l: Pick<Location, 'region' | 'province'>) =>
  l.region || (l.province === 'RN' ? 'Emilia-Romagna' : l.province === 'PU' ? 'Marche' : 'Altre città')

// Stessi slug della mappa (es. "valle-d-aosta", "trentino-alto-adige")
export const regionSlug = (name: string) => slugify(name)
