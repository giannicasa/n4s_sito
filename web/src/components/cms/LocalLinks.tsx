import { Chips, Container, Kicker } from '@/components/site/ui'
import { getLocalServices, getSectorServices } from '@/lib/cms'
import { paths } from '@/lib/paths'
import type { LocalService, Location, Sector, Service } from '@/payload-types'

// Per la pagina servizio: le città in cui il servizio ha una pagina dedicata.
export const LocalLinksForService = async ({
  serviceId,
  title,
}: {
  serviceId: string
  title: string
}) => {
  const [list, bySector] = await Promise.all([
    getLocalServices({ service: serviceId }),
    getSectorServices({ service: serviceId }),
  ])
  if (!list.length && !bySector.length) return null
  return (
    <section className="py-20 border-t border-white/5">
      <Container className="space-y-12">
        {bySector.length > 0 && (
          <div>
            <Kicker className="mb-6">{title} per settore</Kicker>
            <Chips
              items={bySector
                .filter((x) => typeof x.sector === 'object')
                .map((x) => ({
                  href: paths.sectorService(
                    (x.sector as Sector).slug!,
                    (x.service as Service).slug!,
                  ),
                  label: (x.sector as Sector).title,
                }))}
            />
          </div>
        )}
        {list.length > 0 && (
          <div>
            <Kicker className="mb-6">{title} sul territorio</Kicker>
            <Chips
              items={list
                .filter(
                  (x): x is LocalService & { location: Location } => typeof x.location === 'object',
                )
                .map((x) => ({
                  href: paths.localService(x.location.slug!, (x.service as Service).slug!),
                  label: x.location.name,
                }))}
            />
          </div>
        )}
      </Container>
    </section>
  )
}
