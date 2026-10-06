import { LocationsHub, locationsHubMetadata } from '@/views/LocalViews'

export const generateMetadata = () => locationsHubMetadata()

export default function Page() {
  return <LocationsHub />
}
