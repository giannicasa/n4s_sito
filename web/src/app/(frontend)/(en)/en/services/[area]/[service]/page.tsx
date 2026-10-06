import { getPublishedIndex } from '@/lib/cms'
import { ServiceView, serviceMetadata } from '@/views/ServiceViews'

type Props = { params: Promise<{ area: string; service: string }> }

export async function generateStaticParams() {
  return (await getPublishedIndex()).services.map((s) => ({ area: s.area, service: s.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { area, service } = await params
  return serviceMetadata(area, service, 'en')
}

export default async function Page({ params }: Props) {
  const { area, service } = await params
  return <ServiceView areaSlug={area} slug={service} locale='en' />
}
