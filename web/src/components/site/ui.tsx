import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

// Piccoli elementi ricorrenti dei nuovi modelli di pagina, con le stesse classi del design esistente.

export const Kicker = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 ${className}`}>{children}</div>
)

export const Container = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`max-w-[1600px] mx-auto px-5 md:px-10 ${className}`}>{children}</div>
)

export const Crumbs = ({ items }: { items: { label: string; href?: string }[] }) => (
  <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
    {items.map((it, i) => (
      <span key={i} className="inline-flex items-center gap-3">
        {i > 0 && <span className="text-neutral-700">/</span>}
        {it.href ? (
          <Link href={it.href} className="hover:text-white">
            {it.label}
          </Link>
        ) : (
          <span aria-current="page" className="text-neutral-400">
            {it.label}
          </span>
        )}
      </span>
    ))}
  </nav>
)

export const PrimaryButton = ({ href, children, variant = 'white' }: { href: string; children: React.ReactNode; variant?: 'white' | 'violet' | 'outline' }) => {
  const styles = {
    white: 'bg-white text-black hover:bg-violet-500 hover:text-white',
    violet: 'bg-violet-500 text-white hover:bg-violet-400',
    outline: 'border border-white/20 text-white hover:border-violet-500 hover:text-violet-400',
  }[variant]
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 px-8 py-5 font-display font-bold uppercase tracking-[0.18em] text-sm transition-colors ${styles}`}
    >
      {children} <ArrowUpRight size={18} />
    </Link>
  )
}

// Card di un servizio/area usata nelle griglie
export const LinkCard = ({ href, code, title, text }: { href: string; code?: string | null; title: string; text?: string | null }) => (
  <Link
    href={href}
    className="group relative p-6 md:p-8 border-r border-b border-white/10 min-h-[220px] flex flex-col justify-between hover:bg-violet-900/10 transition-colors"
  >
    <div className="flex items-start justify-between">
      <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500">{code}</span>
      <ArrowUpRight size={18} className="text-neutral-600 group-hover:text-violet-400 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
    </div>
    <div>
      <h3 className="font-display text-2xl md:text-3xl font-bold uppercase leading-none tracking-tight text-white group-hover:text-violet-400 transition-colors">
        {title}
      </h3>
      {text && <p className="mt-3 text-sm text-neutral-500 line-clamp-3">{text}</p>}
    </div>
  </Link>
)

export const formatDate = (iso: string | null | undefined, locale: 'it' | 'en') =>
  iso
    ? new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'it-IT', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
