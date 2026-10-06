import { AboutView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('about', 'it')

export default function Page() {
  return <AboutView locale='it' />
}
