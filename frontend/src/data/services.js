// Bilingual service catalog. Use getService(slug, locale).

const T = (it, en) => ({ it, en });

export const SERVICES = [
  {
    slug: "growth-hacking",
    code: "01",
    title: T("Growth Hacking", "Growth Hacking"),
    short: T(
      "Esperimenti rapidi, ciclo dati→ipotesi→test→scala. Crescita senza permesso.",
      "Rapid experiments, data→hypothesis→test→scale loop. Growth without permission."
    ),
    long: T(
      "Disegniamo un funnel come una macchina da corsa: acquisition, activation, retention, revenue, referral. Ogni settimana ipotesi, test, kill o scala. Niente vanity metric, solo numeri che spostano fatturato.",
      "We design the funnel like a race car: acquisition, activation, retention, revenue, referral. Every week, hypotheses, tests, kill or scale. No vanity metrics — only numbers that move revenue."
    ),
    deliverables: {
      it: ["Audit growth + north star metric", "Sprint backlog di esperimenti settimanali", "Dashboard unica con KPI accionabili", "Playbook ripetibile post-engagement"],
      en: ["Growth audit + north star metric", "Weekly experiment sprint backlog", "Single dashboard with actionable KPIs", "Repeatable post-engagement playbook"]
    },
    faq: {
      it: [["Quanto dura un ciclo growth?", "Sprint di 2 settimane. In 90 giorni vedi un trend, in 6 mesi una macchina."], ["Serve già del traffico?", "No. Possiamo partire anche da zero, ma il time-to-impact si allunga."]],
      en: [["How long is a growth cycle?", "2-week sprints. In 90 days you see a trend, in 6 months a machine."], ["Do I need existing traffic?", "No. We can start from zero — but time-to-impact stretches."]]
    },
    keywords: T("growth hacking Cattolica, growth marketing Italia, experiment-led growth", "growth hacking Italy, experiment-led growth, growth marketing studio")
  },
  {
    slug: "seo",
    code: "02",
    title: T("SEO", "SEO"),
    short: T(
      "Strategia di visibilità organica end-to-end: technical, content, link.",
      "End-to-end organic visibility strategy: technical, content, link."
    ),
    long: T(
      "SEO non è una lista di parole chiave. È architettura, intento, autorità. Lavoriamo sui tre assi: technical SEO (crawl, render, performance), semantic SEO (intent, cluster, entità) e brand authority (PR, citazioni, link).",
      "SEO isn't a keyword list. It's architecture, intent, authority. We work on three axes: technical SEO (crawl, render, performance), semantic SEO (intent, clusters, entities) and brand authority (PR, mentions, links)."
    ),
    deliverables: {
      it: ["Technical audit e roadmap di priorità", "Topical map e content cluster", "Calendario editoriale 90 giorni", "Outreach e digital PR mirate"],
      en: ["Technical audit and priority roadmap", "Topical map and content clusters", "90-day editorial calendar", "Targeted outreach and digital PR"]
    },
    faq: {
      it: [["In quanto tempo si vedono i risultati?", "Quick wins tecnici in 30 giorni. Crescita organica strutturale dai 3 ai 6 mesi."], ["SEO è morto con le AI?", "No. È mutato. Vedi AEO e GEO."]],
      en: [["How long until results?", "Technical quick wins in 30 days. Structural organic growth from 3 to 6 months."], ["Is SEO dead with AI?", "No. It mutated. See AEO and GEO."]]
    },
    keywords: T("SEO Cattolica, SEO Rimini, consulenza SEO Italia", "SEO consultancy Italy, technical SEO, semantic SEO")
  },
  {
    slug: "aeo",
    code: "03",
    title: T("AEO · Answer Engine Optimization", "AEO · Answer Engine Optimization"),
    short: T(
      "Ottimizzazione per ChatGPT, Perplexity, Google AI Overviews.",
      "Optimization for ChatGPT, Perplexity, Google AI Overviews."
    ),
    long: T(
      "Le persone non cercano più, chiedono. AEO posiziona il tuo brand come risposta diretta nei motori conversazionali e nelle AI Overviews. Strutturiamo contenuti, schema, citazioni e brand entity per essere la fonte che le AI citano.",
      "People don't search anymore — they ask. AEO positions your brand as a direct answer in conversational engines and AI Overviews. We structure content, schema, citations and brand entity to be the source AI cites."
    ),
    deliverables: {
      it: ["Audit di visibilità su ChatGPT / Perplexity / AI Overviews", "Strutturazione FAQ + schema.org dedicato", "Brand entity hardening (Wikipedia/Wikidata, knowledge panel)", "Reporting share-of-voice nelle risposte AI"],
      en: ["Visibility audit on ChatGPT / Perplexity / AI Overviews", "FAQ + dedicated schema.org structure", "Brand entity hardening (Wikipedia/Wikidata, knowledge panel)", "Share-of-voice reporting in AI answers"]
    },
    faq: {
      it: [["Come misurate l'AEO?", "Prompt set rappresentativo + tracking di citazioni e share-of-voice nelle risposte."], ["AEO sostituisce la SEO?", "No, la moltiplica. Funzionano in sinergia."]],
      en: [["How do you measure AEO?", "Representative prompt set + citation tracking and share-of-voice in answers."], ["Does AEO replace SEO?", "No, it multiplies it. They work in synergy."]]
    },
    keywords: T("AEO answer engine optimization, ottimizzazione ChatGPT, Perplexity SEO", "AEO, answer engine optimization, ChatGPT visibility, Perplexity ranking")
  },
  {
    slug: "geo",
    code: "04",
    title: T("GEO · Generative Engine Optimization", "GEO · Generative Engine Optimization"),
    short: T(
      "Essere citati dai modelli generativi. Visibili nelle risposte, non nelle SERP.",
      "Get cited by generative models. Visible in answers, not in SERPs."
    ),
    long: T(
      "GEO è la disciplina di influenzare come i modelli generativi rappresentano il tuo brand. Lavoriamo su corpus, training-friendly content, fact density, sourcing autoritativo e segnali entity. Obiettivo: quando un LLM parla del tuo settore, parla anche di te.",
      "GEO is the discipline of influencing how generative models represent your brand. We work on corpus, training-friendly content, fact density, authoritative sourcing and entity signals. Goal: when an LLM talks about your industry, it talks about you too."
    ),
    deliverables: {
      it: ["Mappatura prompt-territori per il tuo brand", "Content engineering per LLM (struttura, citabilità, fact density)", "Strategia citazioni e seeding su fonti autoritative", "Monitoring delle menzioni generative nel tempo"],
      en: ["Prompt-territory mapping for your brand", "LLM content engineering (structure, citability, fact density)", "Citation strategy and seeding on authoritative sources", "Monitoring of generative mentions over time"]
    },
    faq: {
      it: [["Funziona davvero?", "I LLM si allenano e indicizzano in modo continuo. I segnali corretti spostano risultati misurabili."], ["Differenza tra AEO e GEO?", "AEO ottimizza risposte runtime. GEO punta a essere parte della 'conoscenza' del modello."]],
      en: [["Does it really work?", "LLMs train and index continuously. The right signals move measurable results."], ["Difference between AEO and GEO?", "AEO optimizes runtime answers. GEO aims to be part of the model's 'knowledge'."]]
    },
    keywords: T("GEO generative engine optimization, LLM SEO, AI search optimization", "GEO, generative engine optimization, LLM SEO, AI search")
  },
  {
    slug: "brand-strategy",
    code: "05",
    title: T("Brand Strategy", "Brand Strategy"),
    short: T(
      "Posizionamento, narrativa, voce. Un brand che non si confonde.",
      "Positioning, narrative, voice. A brand that doesn't blend in."
    ),
    long: T(
      "Definiamo chi sei, per chi sei, e perché esisti. Positioning, brand archetype, manifesto, tono di voce, naming. Ti diamo un'identità che resiste al rumore e si scolpisce nella memoria.",
      "We define who you are, who you're for, and why you exist. Positioning, brand archetype, manifesto, tone of voice, naming. An identity that resists noise and carves itself into memory."
    ),
    deliverables: {
      it: ["Brand positioning canvas + competitive matrix", "Brand archetype e personality", "Manifesto, payoff, key messages", "Tone of voice guidelines"],
      en: ["Brand positioning canvas + competitive matrix", "Brand archetype and personality", "Manifesto, payoff, key messages", "Tone of voice guidelines"]
    },
    faq: {
      it: [["Brand strategy è per startup o per aziende grandi?", "Entrambe. Cambiano gli output, non la disciplina."], ["Quanto dura un progetto?", "4-8 settimane per definire il core. Poi vive nei prodotti, nelle campagne, nelle persone."]],
      en: [["Is brand strategy for startups or large companies?", "Both. The outputs change, the discipline doesn't."], ["How long is a project?", "4-8 weeks to define the core. Then it lives in products, campaigns, people."]]
    },
    keywords: T("brand strategy Italia, posizionamento brand, tone of voice", "brand strategy, positioning, tone of voice, brand identity")
  },
  {
    slug: "performance-marketing",
    code: "06",
    title: T("Performance Marketing", "Performance Marketing"),
    short: T(
      "Media buying chirurgico su Meta, Google, TikTok, LinkedIn.",
      "Surgical media buying on Meta, Google, TikTok, LinkedIn."
    ),
    long: T(
      "Gestione paid che parte dal funnel, non dalla piattaforma. Bidding strategy, creative testing, audience layering, attribution. Ogni euro tracciato, ogni KPI difeso.",
      "Paid management starting from the funnel, not the platform. Bidding strategy, creative testing, audience layering, attribution. Every euro tracked, every KPI defended."
    ),
    deliverables: {
      it: ["Account audit e ristrutturazione", "Creative production sprint-based", "Bidding e audience strategy", "Reporting decisionale settimanale"],
      en: ["Account audit and restructure", "Sprint-based creative production", "Bidding and audience strategy", "Weekly decision-driven reporting"]
    },
    faq: {
      it: [["Quale budget minimo?", "Lavoriamo da 3k€/mese in su per avere segnale statistico."], ["Gestite la creatività?", "Sì. Performance senza creative non esiste."]],
      en: [["Minimum budget?", "We start from €3k/month for statistical signal."], ["Do you manage creatives?", "Yes. Performance without creative doesn't exist."]]
    },
    keywords: T("performance marketing Italia, media buying, Meta ads Google ads", "performance marketing, media buying, Meta Google TikTok ads")
  },
  {
    slug: "social",
    code: "07",
    title: T("Social Media", "Social Media"),
    short: T(
      "Presenza social che crea cultura, non solo contenuti.",
      "Social presence that creates culture, not just content."
    ),
    long: T(
      "Costruiamo un sistema social fatto di pillar, format ricorrenti, distribuzione cross-platform, community management. L'obiettivo non è postare, è essere ricordati.",
      "We build a social system made of pillars, recurring formats, cross-platform distribution, community management. The goal isn't to post — it's to be remembered."
    ),
    deliverables: {
      it: ["Strategy + content pillar", "Format e moodboard editoriali", "Calendario + produzione mensile", "Community management e crisis playbook"],
      en: ["Strategy + content pillars", "Editorial formats and moodboards", "Calendar + monthly production", "Community management and crisis playbook"]
    },
    faq: {
      it: [["Su quali piattaforme?", "Quelle in cui il tuo target dorme, lavora e si annoia. Niente di più."], ["Quanti contenuti al mese?", "Quanti ne servono per essere rilevanti. Tipicamente 12-30."]],
      en: [["On which platforms?", "Those where your target sleeps, works and gets bored. No more."], ["How many posts per month?", "As many as needed to stay relevant. Typically 12-30."]]
    },
    keywords: T("social media agency, content social Cattolica, instagram tiktok strategy", "social media strategy, Instagram TikTok content")
  },
  {
    slug: "content",
    code: "08",
    title: T("Content", "Content"),
    short: T(
      "Articoli, video, podcast, newsletter. Contenuti che lavorano per anni.",
      "Articles, video, podcast, newsletter. Content that works for years."
    ),
    long: T(
      "Produciamo contenuti come asset patrimoniali. Long-form SEO + AEO ready, video short-form, newsletter distintive. Ogni pezzo è progettato per generare traffico, autorità o conversione.",
      "We produce content as financial assets. SEO + AEO-ready long-form, short-form video, distinctive newsletters. Each piece is designed to generate traffic, authority or conversion."
    ),
    deliverables: {
      it: ["Topical map e content strategy", "Produzione editoriale (testi, video, audio)", "Distribuzione e ripurpose multi-canale", "Performance review trimestrale"],
      en: ["Topical map and content strategy", "Editorial production (text, video, audio)", "Multi-channel distribution and repurpose", "Quarterly performance review"]
    },
    faq: {
      it: [["Producete in-house?", "Studio interno + rete di registi, copy, voice artist."], ["Quanto pesa il content sul totale?", "È spesso la leva con il ROI più lungo e più alto. Da 6 mesi in poi."]],
      en: [["Do you produce in-house?", "In-house studio + network of directors, copywriters, voice artists."], ["How much weight does content have?", "Often the lever with the longest and highest ROI. From 6 months in."]]
    },
    keywords: T("content marketing Italia, long-form SEO content, video short-form", "content marketing, long-form SEO, short-form video")
  },
  {
    slug: "web-design",
    code: "09",
    title: T("Web Design", "Web Design"),
    short: T(
      "Siti che convertono e che ti fanno sembrare due taglie più grande.",
      "Websites that convert and make you look two sizes bigger."
    ),
    long: T(
      "Design + development di siti e landing che combinano impatto creativo e conversion engineering. Stack moderno, performance Lighthouse 95+, accessibilità, SEO-ready e copy che vende.",
      "Design + development of sites and landing pages that combine creative impact and conversion engineering. Modern stack, Lighthouse 95+ performance, accessibility, SEO-ready and copy that sells."
    ),
    deliverables: {
      it: ["UX research e architettura informativa", "Art direction e prototipo high-fidelity", "Sviluppo headless (React / Next)", "Conversion rate optimization continua"],
      en: ["UX research and information architecture", "Art direction and high-fidelity prototype", "Headless development (React / Next)", "Continuous conversion rate optimization"]
    },
    faq: {
      it: [["Stack consigliato?", "Headless React/Next + CMS, oppure Webflow per progetti rapidi."], ["Quanto dura?", "6-12 settimane per un sito multi-pagina con design originale."]],
      en: [["Recommended stack?", "Headless React/Next + CMS, or Webflow for fast builds."], ["How long?", "6-12 weeks for a multi-page site with original design."]]
    },
    keywords: T("web design Cattolica, siti web headless, landing page conversion", "web design, headless websites, conversion landing pages")
  },
  {
    slug: "ai-marketing",
    code: "10",
    title: T("AI Marketing", "AI Marketing"),
    short: T(
      "Automazioni, agenti, workflow LLM. Marketing che scala da solo.",
      "Automations, agents, LLM workflows. Marketing that scales itself."
    ),
    long: T(
      "Integriamo AI nei processi: agenti che qualificano lead, workflow di content generation, scoring automatico, ricerca di mercato continua. Non è hype, è leva operativa.",
      "We integrate AI into processes: agents that qualify leads, content generation workflows, automatic scoring, continuous market research. Not hype — operational leverage."
    ),
    deliverables: {
      it: ["Audit dei processi marketing automatizzabili", "Implementazione agenti LLM + tooling", "Workflow di content generation custom", "Monitoring qualità e cost-per-output"],
      en: ["Audit of automatable marketing processes", "LLM agent implementation + tooling", "Custom content generation workflows", "Quality and cost-per-output monitoring"]
    },
    faq: {
      it: [["Quali modelli usate?", "Claude, GPT, Gemini. Stack agnostico, scelta sul caso d'uso."], ["Sostituisce le persone?", "No. Le libera dalle attività ripetitive."]],
      en: [["Which models?", "Claude, GPT, Gemini. Stack-agnostic, chosen per use case."], ["Does it replace people?", "No. It frees them from repetitive tasks."]]
    },
    keywords: T("AI marketing, agenti LLM, automazione marketing", "AI marketing, LLM agents, marketing automation")
  }
];

export const getService = (slug) => SERVICES.find((s) => s.slug === slug);
