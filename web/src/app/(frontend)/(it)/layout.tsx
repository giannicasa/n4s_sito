import type { Metadata, Viewport } from 'next'

import { SiteShell, siteMetadataBase, siteViewport } from '@/components/site/SiteShell'
import { SITE_URL } from '@/lib/paths'

export const metadata: Metadata = { metadataBase: new URL(SITE_URL), ...siteMetadataBase }
export const viewport: Viewport = siteViewport

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale='it'>{children}</SiteShell>
}
