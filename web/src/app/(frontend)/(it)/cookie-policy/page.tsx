import { CookiesView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('cookies', 'it')

export default function Page() {
  return <CookiesView locale='it' />
}
