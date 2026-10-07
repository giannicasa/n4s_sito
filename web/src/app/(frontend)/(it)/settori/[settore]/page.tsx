import { SectorView, sectorMetadata } from '@/views/LocalViews'

type Props = { params: Promise<{ settore: string }> }

// Pagine numerose: generate alla prima visita e poi servite dalla cache (ISR), così la build non dipende dal database.
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props) {
  return sectorMetadata((await params).settore)
}

export default async function Page({ params }: Props) {
  return <SectorView slug={(await params).settore} />
}
