# not4sale — Marketing Studio Site (PRD)

## Original Problem Statement
> Voglio costruire un sito con 3d scroll, super attraente, minimale, stile dark (fondo nero) x uno studio di Marketing a Cattolica chiamato not4sale. Per i colori e logo guarda https://not4.sale (logo [NOT4SALE] bianco con parentesi viola su nero). Il sito deve essere minimal ma di impatto grafico travolgente. Tratta tutti i principali servizi (growth hacking, strategie digitali). Tutto in movimento, multi-pagina, ottimizzato SEO/GEO/AEO/LLM. Pagine che si compongono, 3D scroll bellissimi. Home con sezioni minimal, scritte, hero super. Fuori dal normale, super eroe.

## Architecture
- **Backend**: FastAPI + MongoDB + emergentintegrations (Claude Sonnet 4.5) + Pillow (OG image gen)
- **Frontend**: React 19 + React Router 7 + Tailwind + Framer Motion + Lenis + raw Three.js + GSAP (ScrollTrigger) + react-markdown
- **Universal Key**: EMERGENT_LLM_KEY in /app/backend/.env

## Backend endpoints
- `GET /api/health`
- `POST /api/contact` · `GET /api/leads`
- `POST /api/chat` (locale=it|en) · `GET /api/chat/history/{sid}`
- `POST /api/quote/estimate` (calls Claude → JSON estimate, persists lead)
- `GET /api/articles?locale=it|en` · `GET /api/articles/{slug}?locale=it|en`
- `GET /api/og?title=&subtitle=&kicker=` → PNG 1200x630 via Pillow
- `GET /api/sitemap.xml`

## Frontend routes
**IT (default):** `/`, `/servizi`, `/servizi/:slug` (10 services), `/case-studies`, `/chi-siamo`, `/contatti`, `/preventivo`, `/insights`, `/insights/:slug`

**EN:** `/en`, `/en/services`, `/en/services/:slug`, `/en/case-studies`, `/en/about`, `/en/contact`, `/en/quote`, `/en/insights`, `/en/insights/:slug`

## Features implemented

### Phase 1 (Dec 2025) — MVP
- 15 rotte Italian, raw Three.js hero (morphing sphere + rings + stars), Lenis smooth scroll, custom violet cursor, glass sticky nav, AI chat widget (Claude Sonnet 4.5) bottom-right, contact form → MongoDB
- SEO Italian: JSON-LD ProfessionalService + Service + FAQPage, geo meta tags, sitemap dinamica, robots.txt
- testing_agent_v3 iter1: 100% backend + 100% frontend

### Phase 2 (Dec 2025) — Growth Features
- **Quote Calculator** `/preventivo` (4-step wizard + Claude qualification + lead persistence, range stimato + fit score 0-100)
- **Blog/Insights** `/insights` + `/insights/:slug` con 4 articoli IT + 4 EN (markdown + ReactMarkdown + remark-gfm)
- **GSAP ScrollTrigger** orizzontale pinned su Home (desktop ≥1024px) per la sezione servizi
- **i18n EN completo** con dictionary, switcher lingua nel nav, routing parallelo `/en/*`, content data files bilingual
- **OG image dinamiche** via Pillow `/api/og` con brand `[NOT4SALE]` su nero + glow viola
- **SEOHead React-19-safe** (sostituito react-helmet-async con manager imperativo `document.head`)
- testing_agent_v3 iter2: 18/18 backend, 1 issue head-injection → fixed iter3 confirmed all SEO tags correctly present + de-duplicated

## Personas
- Founder DTC / B2B SaaS (crescita strutturata)
- Imprenditore locale / professionale (presenza digitale premium)
- Visitatore IT/EN che valuta partner marketing

### Phase 3 (Dec 2025) — AI Auto-Audit Agent
- **Quote → mini-audit pipeline** in background (FastAPI BackgroundTasks):
  1. Quote submit → lead saved + audit job scheduled
  2. Screenshot via Microlink (free, no key) of `website_url`
  3. Image base64 → Claude Sonnet 4.5 **vision** (`ImageContent`) with rebel system prompt → JSON `{headline, observations[3], quick_win}`
  4. Branded HTML+text email rendered (logo `[NOT4SALE]`, screenshot embedded, 3 observations, quick win, estimate range + fit score, CTA)
  5. Sent via **Resend** API; status persisted in `db.audit_jobs`
- New endpoint `GET /api/quote/audit/{lead_id}` for status polling
- Quote wizard step 3 gains `website_url` field + pre-submit notice
- Result page gains "Bonus · mini-audit AI" banner
- End-to-end timing measured: ~27s from quote submit to email sent
- **DOMAIN VERIFICATION**: `not4.sale` is NOT yet verified in Resend → emails work only to the Resend account owner email until DNS records (SPF/DKIM) are added. To verify: Resend dashboard → Domains → Add `not4.sale` → add the 3 DNS records to your registrar.

## Implemented (Dec 2025)
- Backend: 11 endpoints REST + Claude chat IT/EN + quote estimator + article CMS + dynamic OG + bilingual sitemap
- Frontend: 18 route, GSAP horizontal pin, full IT+EN i18n, dynamic OG meta per page, JSON-LD per page type (ProfessionalService / Service+FAQPage / Article / ItemList)

## Backlog
**P1**
- Email notification on new lead (Resend integration)
- Admin dashboard `/admin` (auth-protected) for leads + chat sessions + article CRUD
- Privacy/cookie page (IT + EN)
- Real founder photos
- A/B test the quote calculator step copy
- Sticky CTA "Calcola un preventivo" su scroll su tutti i mobile

**P2**
- 3D ScrollTrigger hero sequences (pinned camera moves)
- Per-article OG image variants
- More EN articles
- Service-specific case studies pages
- Newsletter integration
- "Made with Emergent" badge — gestito dalla piattaforma sul preview; sul dominio di produzione si toglie dalla config di deploy

**Done Dec 2025**: MVP + Phase 2 complete + tested.
