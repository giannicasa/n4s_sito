import { BlogHub, blogMetadata } from '@/views/BlogViews'

export const generateMetadata = () => blogMetadata('en')

export default function Page() {
  return <BlogHub locale='en' />
}
