import { LocationView, locationMetadata } from '@/views/LocalViews'

type Props = { params: Promise<{ citta: string }> }

// Pagine numerose: generate alla prima visita e poi servite dalla cache (ISR), così la build non dipende dal database.
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props) {
  return locationMetadata((await params).citta)
}

export default async function Page({ params }: Props) {
  return <LocationView slug={(await params).citta} />
}
