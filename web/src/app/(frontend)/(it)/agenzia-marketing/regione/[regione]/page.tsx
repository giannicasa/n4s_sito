import { RegionView, regionMetadata } from '@/views/LocalViews'

type Props = { params: Promise<{ regione: string }> }

export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props) {
  return regionMetadata((await params).regione)
}

export default async function Page({ params }: Props) {
  return <RegionView slug={(await params).regione} />
}
