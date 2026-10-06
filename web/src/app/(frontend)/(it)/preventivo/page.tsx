import { QuoteView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('quote', 'it')

export default function Page() {
  return <QuoteView locale='it' />
}
