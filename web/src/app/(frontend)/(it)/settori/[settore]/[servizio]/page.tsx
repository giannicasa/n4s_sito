import { SectorServiceView, sectorServiceMetadata } from '@/views/LocalViews'

type Props = { params: Promise<{ settore: string; servizio: string }> }

// Pagine numerose: generate alla prima visita e poi servite dalla cache (ISR), così la build non dipende dal database.
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props) {
  const { settore, servizio } = await params
  return sectorServiceMetadata(settore, servizio)
}

export default async function Page({ params }: Props) {
  const { settore, servizio } = await params
  return <SectorServiceView sectorSlug={settore} serviceSlug={servizio} />
}
