import { ContactView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('contact', 'it')

export default function Page() {
  return <ContactView locale='it' />
}
