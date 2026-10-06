import { getPublishedIndex } from '@/lib/cms'
import { SectorView, sectorMetadata } from '@/views/LocalViews'

type Props = { params: Promise<{ settore: string }> }

export async function generateStaticParams() {
  return (await getPublishedIndex()).sectors.map((x) => ({ settore: x.slug }))
}

export async function generateMetadata({ params }: Props) {
  return sectorMetadata((await params).settore)
}

export default async function Page({ params }: Props) {
  return <SectorView slug={(await params).settore} />
}
