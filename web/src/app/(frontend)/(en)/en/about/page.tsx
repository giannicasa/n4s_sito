import { AboutView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('about', 'en')

export default function Page() {
  return <AboutView locale='en' />
}
