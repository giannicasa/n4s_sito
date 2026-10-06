import { ServicesHub, servicesHubMetadata } from '@/views/ServiceViews'

export const generateMetadata = () => servicesHubMetadata('en')

export default function Page() {
  return <ServicesHub locale='en' />
}
