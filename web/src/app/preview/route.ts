import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

// Anteprima delle bozze dal pannello: solo per utenti loggati in /admin.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const path = url.searchParams.get('path') || '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Percorso non valido', { status: 400 })

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return new Response('Accedi a /admin per vedere le bozze', { status: 401 })

  ;(await draftMode()).enable()
  redirect(path)
}
