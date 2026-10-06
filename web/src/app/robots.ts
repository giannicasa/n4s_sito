import type { MetadataRoute } from 'next'

import { absolute } from '@/lib/paths'

// Motori di ricerca e crawler AI (ChatGPT, Perplexity, Claude, Gemini) sono ammessi esplicitamente:
// essere letti e citati da loro è parte della strategia AEO/GEO.
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // le immagini caricate dal CMS vivono sotto /api/media e devono restare indicizzabili
      { userAgent: '*', allow: ['/', '/api/media/'], disallow: ['/admin', '/api/', '/preview'] },
      { userAgent: AI_BOTS, allow: ['/', '/api/media/'], disallow: ['/admin', '/api/', '/preview'] },
    ],
    sitemap: absolute('/sitemap.xml'),
    host: absolute(''),
  }
}
