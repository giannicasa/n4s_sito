import { SectorsHub, sectorsHubMetadata } from '@/views/LocalViews'

export const generateMetadata = () => sectorsHubMetadata()

export default function Page() {
  return <SectorsHub />
}
