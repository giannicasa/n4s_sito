import { getPublishedIndex } from '@/lib/cms'
import { SectorServiceView, sectorServiceMetadata } from '@/views/LocalViews'

type Props = { params: Promise<{ settore: string; servizio: string }> }

export async function generateStaticParams() {
  return (await getPublishedIndex()).sectorServices.map((x) => ({ settore: x.sector, servizio: x.service }))
}

export async function generateMetadata({ params }: Props) {
  const { settore, servizio } = await params
  return sectorServiceMetadata(settore, servizio)
}

export default async function Page({ params }: Props) {
  const { settore, servizio } = await params
  return <SectorServiceView sectorSlug={settore} serviceSlug={servizio} />
}
