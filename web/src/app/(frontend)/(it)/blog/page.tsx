import { BlogHub, blogMetadata } from '@/views/BlogViews'

export const generateMetadata = () => blogMetadata('it')

export default function Page() {
  return <BlogHub locale='it' />
}
