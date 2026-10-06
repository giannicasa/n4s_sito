import { CookiesView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('cookies', 'en')

export default function Page() {
  return <CookiesView locale='en' />
}
