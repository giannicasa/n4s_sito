# not4sale — Marketing Studio Site (PRD)

## Original Problem Statement
> Voglio costruire un sito con 3d scroll, super attraente, minimale, stile dark (fondo nero) x uno studio di Marketing a Cattolica chiamato not4sale. Per i colori e logo guarda https://not4.sale (logo [NOT4SALE] bianco con parentesi viola su nero). Il sito deve essere minimal ma di impatto grafico travolgente. Tratta tutti i principali servizi (growth hacking, strategie digitali). Tutto in movimento, multi-pagina, ottimizzato SEO/GEO/AEO/LLM. Pagine che si compongono, 3D scroll bellissimi. Home con sezioni minimal, scritte, hero super. Fuori dal normale, super eroe.

## User Choices (gathered)
- Contenuti placeholder professionali italiani — generati lato agente
- Pagine: Home, Servizi (hub) + 1 pagina per servizio (10 totali), Case Studies, Chi Siamo (4 soci inventati), Contatti
- Form contatti → salvati in MongoDB
- AI Chat con Claude Sonnet 4.5 (Universal Key)
- Stile 3D: mix Three.js + parallax cinematografico (option C)

## Architecture
- **Backend**: FastAPI + MongoDB + emergentintegrations (Claude Sonnet 4.5)
- **Frontend**: React 19 + React Router 7 + Tailwind + Framer Motion + Lenis + raw Three.js
- **Universal Key**: EMERGENT_LLM_KEY in /app/backend/.env

## Endpoints
- `GET /api/health` — health/ping
- `POST /api/contact` — create lead
- `GET /api/leads` — list leads (desc by created_at, limit 100)
- `POST /api/chat` — Claude Sonnet 4.5 (anthropic/claude-sonnet-4-5-20250929), persists to MongoDB
- `GET /api/chat/history/{session_id}` — chat transcript
- `GET /api/sitemap.xml` — dynamic sitemap

## Pages
- `/` Home — 3D hero + philosophy + services bento + case study preview + CTA
- `/servizi` — services hub (10 services as huge list)
- `/servizi/:slug` — detail (seo, aeo, geo, growth-hacking, brand-strategy, performance-marketing, social, content, web-design, ai-marketing)
- `/case-studies` — bespoke philosophy + 5 case studies
- `/chi-siamo` — 4 invented founders + manifesto + Cattolica section
- `/contatti` — form + sidebar info
- `*` — 404 page

## Personas
- **Founder DTC / B2B SaaS** cerca crescita strutturata
- **Imprenditore locale / professionale** vuole presenza digitale forte ma non commodity
- **Visitor curioso del settore** valuta partner marketing premium

## SEO / AEO / GEO
- react-helmet-async per og:/twitter:/canonical/keywords per pagina
- JSON-LD `ProfessionalService` + `LocalBusiness` Cattolica RN
- Per servizio: JSON-LD `Service` con `OfferCatalog` + `FAQPage`
- `geo.region` / `ICBM` / `geo.placename` meta tags
- `/robots.txt` + `/api/sitemap.xml` linkato

## Implemented (Dec 2025)
- Backend Claude chat + lead form + sitemap (all tested)
- Frontend complete 15 pages route map, raw Three.js hero, Lenis smooth scroll, custom violet cursor, glass nav, AI chat widget bottom-right, contact form with toast feedback, Italian copy across all pages
- Data-testid on every interactive element
- 100% backend + 100% frontend tests (testing_agent_v3 iteration 1)

## Backlog
**P1**
- Email notification on new lead (Resend integration)
- Admin dashboard route /admin to view leads (with simple auth)
- Cookie banner / privacy policy page (Italian)
- Real founder photos / portraits

**P2**
- Blog / Insights section (long-form SEO content)
- Newsletter integration
- Pagine localizzate EN
- Sostituzione "Made with Emergent" badge per dominio produzione
- True scroll-pinned 3D sequences (gsap ScrollTrigger)
- Open Graph image generation

**Done Dec 2025**: MVP complete + e2e tested.
