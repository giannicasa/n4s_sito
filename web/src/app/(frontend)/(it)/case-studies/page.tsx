import { CasesView, staticMetadata } from '@/views/StaticViews'

export const generateMetadata = () => staticMetadata('cases', 'it')

export default function Page() {
  return <CasesView locale='it' />
}
