import { CasesView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('cases', 'en')

export default function Page() {
  return <CasesView locale='en' />
}
