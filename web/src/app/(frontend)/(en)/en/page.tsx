import { HomeView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('home', 'en')

export default function Page() {
  return <HomeView locale='en' />
}
