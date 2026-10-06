import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Backend FastAPI esistente (lead, chat AI, preventivo, webhook n8n).
const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN || 'https://n4s-backend.vercel.app').replace(/\/$/, '')

// Endpoint del backend esposti sullo stesso dominio. /api/* resta a Payload per tutto il resto.
const BACKEND_ROUTES = ['/api/contact', '/api/chat', '/api/chat/:path*', '/api/quote/:path*', '/api/health']

const nextConfig: NextConfig = {
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
  },
  async rewrites() {
    return {
      // beforeFiles: hanno la precedenza sulla route catch-all di Payload /api/[...slug]
      beforeFiles: BACKEND_ROUTES.map((source) => ({ source, destination: `${BACKEND_ORIGIN}${source}` })),
      afterFiles: [],
      fallback: [],
    }
  },
  async headers() {
    return [
      // *.vercel.app e anteprime non devono finire nell'indice: solo il dominio di produzione
      {
        source: '/:path*',
        missing: [{ type: 'host', value: '(www\\.)?not4\\.sale' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
  async redirects() {
    return [
      // vecchi endpoint SEO del backend
      { source: '/api/sitemap.xml', destination: '/sitemap.xml', permanent: true },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
