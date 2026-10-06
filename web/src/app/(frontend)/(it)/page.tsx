import { HomeView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('home', 'it')

export default function Page() {
  return <HomeView locale='it' />
}
