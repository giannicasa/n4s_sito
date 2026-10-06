import { ContactView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('contact', 'en')

export default function Page() {
  return <ContactView locale='en' />
}
