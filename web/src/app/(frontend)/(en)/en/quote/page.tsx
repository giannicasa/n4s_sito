import { QuoteView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('quote', 'en')

export default function Page() {
  return <QuoteView locale='en' />
}
