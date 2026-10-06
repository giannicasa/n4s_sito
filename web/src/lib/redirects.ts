import 'server-only'

import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { getRedirect } from './cms'
import { paths } from './paths'

// Prima di rispondere 404 controlla i redirect gestiti dal CMS (es. vecchi URL del sito precedente).
export const notFoundOrRedirect = async (path: string): Promise<never> => {
  const r: any = await getRedirect(path)
  if (r?.to) {
    let target: string | null = null
    if (r.to.type === 'custom') target = r.to.url
    else if (r.to.reference?.value && typeof r.to.reference.value === 'object') {
      const doc = r.to.reference.value
      if (r.to.reference.relationTo === 'posts') target = paths.post(doc.slug)
      if (r.to.reference.relationTo === 'service-areas') target = paths.area(doc.slug)
      if (r.to.reference.relationTo === 'services' && typeof doc.area === 'object') target = paths.service(doc.area.slug, doc.slug)
    }
    if (target && target !== path) {
      if (r.type === '302') redirect(target)
      permanentRedirect(target)
    }
  }
  notFound()
}
