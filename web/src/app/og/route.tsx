import { ImageResponse } from 'next/og'

// Immagine social 1200×630 generata al volo: [NOT4SALE] su nero con bagliore viola.
// Sostituisce /api/og del vecchio backend.

const fontCache = new Map<string, Promise<ArrayBuffer | null>>()

// Fontshare serve anche il .ttf (Satori non legge woff2): si estrae l'URL dal CSS.
const loadFont = (family: string, weight: number) => {
  const key = `${family}@${weight}`
  if (!fontCache.has(key)) {
    fontCache.set(
      key,
      fetch(`https://api.fontshare.com/v2/css?f[]=${family}@${weight}&display=swap`)
        .then((r) => r.text())
        .then((css) => {
          const url = css.match(/url\(['"]?([^'")]+\.ttf)['"]?\)/)?.[1] ?? css.match(/url\(['"]?([^'")]+\.woff)['"]?\)/)?.[1]
          if (!url) return null
          return fetch(url.startsWith('//') ? `https:${url}` : url).then((r) => r.arrayBuffer())
        })
        .catch(() => null),
    )
  }
  return fontCache.get(key)!
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = (searchParams.get('title') || 'not4sale').slice(0, 110)
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 160)
  const kicker = (searchParams.get('kicker') || 'not4sale · Cattolica').slice(0, 60)

  const [black, medium] = await Promise.all([loadFont('cabinet-grotesk', 900), loadFont('satoshi', 500)])
  const fonts = [
    ...(black ? [{ name: 'Cabinet', data: black, weight: 900 as const }] : []),
    ...(medium ? [{ name: 'Satoshi', data: medium, weight: 500 as const }] : []),
  ]
  const size = title.length > 60 ? 64 : title.length > 32 ? 80 : 104

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'radial-gradient(70% 60% at 85% 15%, rgba(157,76,221,0.45) 0%, #050505 60%)',
          backgroundColor: '#050505',
          color: '#fff',
          fontFamily: 'Satoshi',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontFamily: 'Cabinet', fontWeight: 900, fontSize: 34, letterSpacing: 4 }}>
            <span style={{ color: '#9D4CDD' }}>[</span>NOT4SALE<span style={{ color: '#9D4CDD' }}>]</span>
          </div>
          <div style={{ display: 'flex', fontSize: 20, letterSpacing: 6, textTransform: 'uppercase', color: '#B976E3' }}>{kicker}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Cabinet',
              fontWeight: 900,
              fontSize: size,
              lineHeight: 0.92,
              letterSpacing: -2,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>
          {subtitle && <div style={{ display: 'flex', marginTop: 28, fontSize: 28, color: '#a3a3a3', lineHeight: 1.35 }}>{subtitle}</div>}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: fonts.length ? fonts : undefined, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable' } },
  )
}
