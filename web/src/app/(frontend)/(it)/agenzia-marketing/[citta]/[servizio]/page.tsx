import { LocalServiceView, localServiceMetadata } from '@/views/LocalViews'

type Props = { params: Promise<{ citta: string; servizio: string }> }

// Pagine numerose: generate alla prima visita e poi servite dalla cache (ISR), così la build non dipende dal database.
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props) {
  const { citta, servizio } = await params
  return localServiceMetadata(citta, servizio)
}

export default async function Page({ params }: Props) {
  const { citta, servizio } = await params
  return <LocalServiceView locationSlug={citta} serviceSlug={servizio} />
}
