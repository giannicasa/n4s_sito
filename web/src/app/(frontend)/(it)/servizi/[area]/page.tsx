import { getPublishedIndex } from '@/lib/cms'
import { AreaView, areaMetadata } from '@/views/ServiceViews'

type Props = { params: Promise<{ area: string }> }

export async function generateStaticParams() {
  return (await getPublishedIndex()).areas.map((a) => ({ area: a.slug }))
}

export async function generateMetadata({ params }: Props) {
  return areaMetadata((await params).area, 'it')
}

export default async function Page({ params }: Props) {
  return <AreaView slug={(await params).area} locale='it' />
}
