import { getPublishedIndex } from '@/lib/cms'
import { PostView, postMetadata } from '@/views/BlogViews'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPublishedIndex()).posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  return postMetadata((await params).slug, 'en')
}

export default async function Page({ params }: Props) {
  return <PostView slug={(await params).slug} locale='en' />
}
