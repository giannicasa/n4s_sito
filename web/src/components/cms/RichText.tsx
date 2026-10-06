import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText as LexicalRichText, type JSXConvertersFunction, LinkJSXConverter } from '@payloadcms/richtext-lexical/react'

import { paths } from '@/lib/paths'

// Link interni del CMS (a servizi, articoli, macro-aree) trasformati nell'URL pubblico.
const internalDocToHref = ({ linkNode }: { linkNode: any }) => {
  const { relationTo, value } = linkNode.fields.doc ?? {}
  if (!value || typeof value !== 'object') return '/'
  switch (relationTo) {
    case 'posts':
      return paths.post(value.slug)
    case 'service-areas':
      return paths.area(value.slug)
    case 'services':
      return typeof value.area === 'object' ? paths.service(value.area.slug, value.slug) : paths.services()
    default:
      return '/'
  }
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
})

export const RichText = ({ data, className = '' }: { data?: SerializedEditorState | null; className?: string }) =>
  data ? <LexicalRichText data={data} converters={converters} className={`article-md ${className}`} /> : null

// true se il campo rich text contiene almeno un carattere di testo
export const hasRichText = (data?: SerializedEditorState | null): boolean => {
  const walk = (node: any): boolean =>
    (typeof node?.text === 'string' && node.text.trim().length > 0) || (node?.children ?? []).some(walk)
  return Boolean(data?.root && walk(data.root))
}

// Parole totali, per stimare i minuti di lettura
export const countWords = (data?: SerializedEditorState | null): number => {
  let n = 0
  const walk = (node: any) => {
    if (typeof node?.text === 'string') n += node.text.split(/\s+/).filter(Boolean).length
    ;(node?.children ?? []).forEach(walk)
  }
  if (data?.root) walk(data.root)
  return n
}
