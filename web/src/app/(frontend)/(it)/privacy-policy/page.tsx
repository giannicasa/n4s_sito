import { PrivacyView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('privacy', 'it')

export default function Page() {
  return <PrivacyView locale='it' />
}
