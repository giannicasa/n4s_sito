'use client'

import Link from 'next/link'
import { useState } from 'react'

import map from '@/data/italy-map.json'

// Mappa delle regioni (confini ISTAT via openpolis, semplificati). Ogni regione con pagine è un vero link <a>:
// Google lo segue come un menu. Al passaggio del mouse un pannello mostra le città della regione.

export type MapRegion = {
  slug: string
  name: string
  href: string
  cities: { name: string; href: string }[]
}

export default function ItalyMap({ regions, active }: { regions: MapRegion[]; active?: string }) {
  const bySlug = new Map(regions.map((r) => [r.slug, r]))
  const [hover, setHover] = useState<string | null>(active ?? null)
  const current = hover ? bySlug.get(hover) : null
  const [cx, cy] = map.points.cattolica
  const [smx, smy] = map.points.sanMarino
  const sm = bySlug.get('san-marino')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-7">
        <svg viewBox={`0 0 ${map.width} ${map.height}`} className="w-full max-w-[560px] mx-auto h-auto" aria-label="Mappa delle regioni italiane in cui lavoriamo">
          {map.regions.map((r) => {
            const data = bySlug.get(r.slug)
            const isOn = hover === r.slug || active === r.slug
            const shape = (
              <path
                d={r.d}
                className={`transition-colors duration-200 ${
                  data ? (isOn ? 'fill-violet-500/80' : 'fill-violet-700/60 hover:fill-violet-500/70') : 'fill-ink-200'
                } stroke-violet-500/70`}
                strokeWidth={0.8}
              />
            )
            return data ? (
              <Link
                key={r.slug}
                href={data.href}
                aria-label={`${r.name}: ${data.cities.length} ${data.cities.length === 1 ? 'città' : 'città e comuni'}`}
                onMouseEnter={() => setHover(r.slug)}
                onFocus={() => setHover(r.slug)}
                onMouseLeave={() => setHover(active ?? null)}
              >
                {shape}
              </Link>
            ) : (
              <g key={r.slug} aria-hidden="true">
                {shape}
              </g>
            )
          })}
          {/* San Marino non è una regione italiana: un punto cliccabile al posto della sagoma */}
          {sm && (
            <Link
              href={sm.href}
              aria-label={`San Marino: ${sm.cities.length} ${sm.cities.length === 1 ? 'città' : 'città e comuni'}`}
              onMouseEnter={() => setHover('san-marino')}
              onFocus={() => setHover('san-marino')}
              onMouseLeave={() => setHover(active ?? null)}
            >
              <circle cx={smx} cy={smy} r={9} className="fill-transparent" />
              <circle
                cx={smx}
                cy={smy}
                r={4}
                className={`${hover === 'san-marino' || active === 'san-marino' ? 'fill-violet-300' : 'fill-violet-500'} stroke-white`}
                strokeWidth={1}
              />
            </Link>
          )}
          {/* la sede */}
          <circle cx={cx} cy={cy} r={5} className="fill-white" />
          <circle cx={cx} cy={cy} r={11} className="fill-none stroke-white/60 animate-ping" style={{ transformOrigin: `${cx}px ${cy}px` }} />
        </svg>
      </div>

      <div className="lg:col-span-5 lg:sticky lg:top-32 min-h-[220px]">
        {current ? (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-3">{current.cities.length} tra città e comuni</div>
            <Link href={current.href} className="block font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-white hover:text-violet-400 transition-colors mb-6">
              {current.name}
            </Link>
            <ul className="flex flex-wrap gap-2 max-h-[420px] overflow-y-auto pr-1">
              {current.cities.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="inline-block text-xs font-mono uppercase tracking-[0.14em] text-neutral-300 border border-white/10 px-3 py-2 hover:border-violet-500 hover:text-violet-400 transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-neutral-400 leading-relaxed">
            <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-3">Scegli una regione</div>
            Passa sulle regioni evidenziate per vedere le città, oppure clicca per aprire la pagina della regione. Il punto bianco è la nostra sede, a Cattolica.
          </div>
        )}
      </div>
    </div>
  )
}
