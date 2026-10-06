import { getPublishedIndex } from '@/lib/cms'
import { LocalServiceView, localServiceMetadata } from '@/views/LocalViews'

type Props = { params: Promise<{ citta: string; servizio: string }> }

export async function generateStaticParams() {
  return (await getPublishedIndex()).localServices.map((x) => ({ citta: x.location, servizio: x.service }))
}

export async function generateMetadata({ params }: Props) {
  const { citta, servizio } = await params
  return localServiceMetadata(citta, servizio)
}

export default async function Page({ params }: Props) {
  const { citta, servizio } = await params
  return <LocalServiceView locationSlug={citta} serviceSlug={servizio} />
}
