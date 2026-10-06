import { getPublishedIndex } from '@/lib/cms'
import { LocationView, locationMetadata } from '@/views/LocalViews'

type Props = { params: Promise<{ citta: string }> }

export async function generateStaticParams() {
  return (await getPublishedIndex()).locations.map((l) => ({ citta: l.slug }))
}

export async function generateMetadata({ params }: Props) {
  return locationMetadata((await params).citta)
}

export default async function Page({ params }: Props) {
  return <LocationView slug={(await params).citta} />
}
