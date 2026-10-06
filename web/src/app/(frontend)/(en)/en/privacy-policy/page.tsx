import { PrivacyView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('privacy', 'en')

export default function Page() {
  return <PrivacyView locale='en' />
}
