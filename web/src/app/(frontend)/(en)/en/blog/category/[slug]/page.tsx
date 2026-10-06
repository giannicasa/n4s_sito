import { getPublishedIndex } from '@/lib/cms'
import { CategoryView, categoryMetadata } from '@/views/BlogViews'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPublishedIndex()).categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props) {
  return categoryMetadata((await params).slug, 'en')
}

export default async function Page({ params }: Props) {
  return <CategoryView slug={(await params).slug} locale='en' />
}
