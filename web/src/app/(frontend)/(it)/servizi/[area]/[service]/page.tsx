import { ServiceView, serviceMetadata } from '@/views/ServiceViews'

type Props = { params: Promise<{ area: string; service: string }> }

// Pagine numerose: generate alla prima visita e poi servite dalla cache (ISR), così la build non dipende dal database.
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props) {
  const { area, service } = await params
  return serviceMetadata(area, service, 'it')
}

export default async function Page({ params }: Props) {
  const { area, service } = await params
  return <ServiceView areaSlug={area} slug={service} locale='it' />
}
