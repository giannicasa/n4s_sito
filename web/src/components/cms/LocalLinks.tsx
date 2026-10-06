import { Chips, Container, Kicker } from '@/components/site/ui'
import { getLocalServices } from '@/lib/cms'
import { paths } from '@/lib/paths'
import type { LocalService, Location, Service } from '@/payload-types'

// Per la pagina servizio: le città in cui il servizio ha una pagina dedicata.
export const LocalLinksForService = async ({ serviceId, title }: { serviceId: string; title: string }) => {
  const list = await getLocalServices({ service: serviceId })
  if (!list.length) return null
  return (
    <section className="py-20 border-t border-white/5">
      <Container>
        <Kicker className="mb-6">{title} sul territorio</Kicker>
        <Chips
          items={list
            .filter((x): x is LocalService & { location: Location } => typeof x.location === 'object')
            .map((x) => ({ href: paths.localService(x.location.slug!, (x.service as Service).slug!), label: x.location.name }))}
        />
      </Container>
    </section>
  )
}
