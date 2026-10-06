import { ServicesHub, servicesHubMetadata } from '@/views/ServiceViews'

export const generateMetadata = () => servicesHubMetadata('it')

export default function Page() {
  return <ServicesHub locale='it' />
}
