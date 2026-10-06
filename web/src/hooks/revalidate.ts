import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

// Invalida la cache Next.js quando un contenuto cambia (expire: 0: chi pubblica vede subito la modifica), così la pagina statica
// si rigenera senza un nuovo deploy. Disattivabile con context.disableRevalidate (seed).
const safeRevalidate = (tag: string) => {
  try {
    revalidateTag(tag, { expire: 0 })
    revalidatePath('/', 'layout')
  } catch {
    // Fuori da un contesto Next (es. script di seed): nulla da invalidare.
  }
}

export const revalidateCollection =
  (tag: string): CollectionAfterChangeHook =>
  ({ doc, context }) => {
    if (!context?.disableRevalidate) safeRevalidate(tag)
    return doc
  }

export const revalidateCollectionDelete =
  (tag: string): CollectionAfterDeleteHook =>
  ({ doc, context }) => {
    if (!context?.disableRevalidate) safeRevalidate(tag)
    return doc
  }

export const revalidateGlobal =
  (tag: string): GlobalAfterChangeHook =>
  ({ doc, context }) => {
    if (!context?.disableRevalidate) safeRevalidate(tag)
    return doc
  }
