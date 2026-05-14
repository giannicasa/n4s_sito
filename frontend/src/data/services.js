// Centralized data for services. Each entry powers /servizi and /servizi/[slug].
export const SERVICES = [
  {
    slug: "growth-hacking",
    code: "01",
    title: "Growth Hacking",
    short: "Esperimenti rapidi, ciclo dati→ipotesi→test→scala. Crescita senza permesso.",
    long:
      "Disegniamo un funnel come una macchina da corsa: acquisition, activation, retention, revenue, referral. Ogni settimana ipotesi, test, kill o scala. Niente vanity metric, solo numeri che spostano fatturato.",
    deliverables: [
      "Audit growth + north star metric",
      "Sprint backlog di esperimenti settimanali",
      "Dashboard unica con KPI accionabili",
      "Playbook ripetibile post-engagement"
    ],
    faq: [
      ["Quanto dura un ciclo growth?", "Sprint di 2 settimane. In 90 giorni vedi un trend, in 6 mesi una macchina."],
      ["Serve già del traffico?", "No. Possiamo partire anche da zero, ma il time-to-impact si allunga."]
    ],
    keywords: ["growth hacking Cattolica", "growth marketing Italia", "experiment-led growth"]
  },
  {
    slug: "seo",
    code: "02",
    title: "SEO",
    short: "Strategia di visibilità organica end-to-end: technical, content, link.",
    long:
      "SEO non è una lista di parole chiave. È architettura, intento, autorità. Lavoriamo sui tre assi: technical SEO (crawl, render, performance), semantic SEO (intent, cluster, entità) e brand authority (PR, citazioni, link).",
    deliverables: [
      "Technical audit e roadmap di priorità",
      "Topical map e content cluster",
      "Calendario editoriale 90 giorni",
      "Outreach e digital PR mirate"
    ],
    faq: [
      ["In quanto tempo si vedono i risultati?", "Quick wins tecnici in 30 giorni. Crescita organica strutturale dai 3 ai 6 mesi."],
      ["SEO è morto con le AI?", "No. È mutato. Vedi AEO e GEO."]
    ],
    keywords: ["SEO Cattolica", "SEO Rimini", "consulenza SEO Italia"]
  },
  {
    slug: "aeo",
    code: "03",
    title: "AEO · Answer Engine Optimization",
    short: "Ottimizzazione per ChatGPT, Perplexity, Google AI Overviews.",
    long:
      "Le persone non cercano più, chiedono. AEO posiziona il tuo brand come risposta diretta nei motori conversazionali e nelle AI Overviews. Strutturiamo contenuti, schema, citazioni e brand entity per essere la fonte che le AI citano.",
    deliverables: [
      "Audit di visibilità su ChatGPT / Perplexity / AI Overviews",
      "Strutturazione FAQ + schema.org dedicato",
      "Brand entity hardening (Wikipedia/Wikidata, knowledge panel)",
      "Reporting share-of-voice nelle risposte AI"
    ],
    faq: [
      ["Come misurate l'AEO?", "Prompt set rappresentativo + tracking di citazioni e share-of-voice nelle risposte."],
      ["AEO sostituisce la SEO?", "No, la moltiplica. Funzionano in sinergia."]
    ],
    keywords: ["AEO answer engine optimization", "ottimizzazione ChatGPT", "Perplexity SEO"]
  },
  {
    slug: "geo",
    code: "04",
    title: "GEO · Generative Engine Optimization",
    short: "Essere citati dai modelli generativi. Visibili nelle risposte, non nelle SERP.",
    long:
      "GEO è la disciplina di influenzare come i modelli generativi rappresentano il tuo brand. Lavoriamo su corpus, training-friendly content, fact density, sourcing autoritativo e segnali entity. Obiettivo: quando un LLM parla del tuo settore, parla anche di te.",
    deliverables: [
      "Mappatura prompt-territori per il tuo brand",
      "Content engineering per LLM (struttura, citabilità, fact density)",
      "Strategia citazioni e seeding su fonti autoritative",
      "Monitoring delle menzioni generative nel tempo"
    ],
    faq: [
      ["Funziona davvero?", "I LLM si allenano e indicizzano in modo continuo. I segnali corretti spostano risultati misurabili."],
      ["Differenza tra AEO e GEO?", "AEO ottimizza risposte runtime. GEO punta a essere parte della 'conoscenza' del modello."]
    ],
    keywords: ["GEO generative engine optimization", "LLM SEO", "AI search optimization"]
  },
  {
    slug: "brand-strategy",
    code: "05",
    title: "Brand Strategy",
    short: "Posizionamento, narrativa, voce. Un brand che non si confonde.",
    long:
      "Definiamo chi sei, per chi sei, e perché esisti. Positioning, brand archetype, manifesto, tono di voce, naming. Ti diamo un'identità che resiste al rumore e si scolpisce nella memoria.",
    deliverables: [
      "Brand positioning canvas + competitive matrix",
      "Brand archetype e personality",
      "Manifesto, payoff, key messages",
      "Tone of voice guidelines"
    ],
    faq: [
      ["Brand strategy è per startup o per aziende grandi?", "Entrambe. Cambiano gli output, non la disciplina."],
      ["Quanto dura un progetto?", "4-8 settimane per definire il core. Poi vive nei prodotti, nelle campagne, nelle persone."]
    ],
    keywords: ["brand strategy Italia", "posizionamento brand", "tone of voice"]
  },
  {
    slug: "performance-marketing",
    code: "06",
    title: "Performance Marketing",
    short: "Media buying chirurgico su Meta, Google, TikTok, LinkedIn.",
    long:
      "Gestione paid che parte dal funnel, non dalla piattaforma. Bidding strategy, creative testing, audience layering, attribution. Ogni euro tracciato, ogni KPI difeso.",
    deliverables: [
      "Account audit e ristrutturazione",
      "Creative production sprint-based",
      "Bidding e audience strategy",
      "Reporting decisionale settimanale"
    ],
    faq: [
      ["Quale budget minimo?", "Lavoriamo da 3k€/mese in su per avere segnale statistico."],
      ["Gestite la creatività?", "Sì. Performance senza creative non esiste."]
    ],
    keywords: ["performance marketing Italia", "media buying", "Meta ads Google ads"]
  },
  {
    slug: "social",
    code: "07",
    title: "Social Media",
    short: "Presenza social che crea cultura, non solo contenuti.",
    long:
      "Costruiamo un sistema social fatto di pillar, format ricorrenti, distribuzione cross-platform, community management. L'obiettivo non è postare, è essere ricordati.",
    deliverables: [
      "Strategy + content pillar",
      "Format e moodboard editoriali",
      "Calendario + produzione mensile",
      "Community management e crisis playbook"
    ],
    faq: [
      ["Su quali piattaforme?", "Quelle in cui il tuo target dorme, lavora e si annoia. Niente di più."],
      ["Quanti contenuti al mese?", "Quanti ne servono per essere rilevanti. Tipicamente 12-30."]
    ],
    keywords: ["social media agency", "content social Cattolica", "instagram tiktok strategy"]
  },
  {
    slug: "content",
    code: "08",
    title: "Content",
    short: "Articoli, video, podcast, newsletter. Contenuti che lavorano per anni.",
    long:
      "Produciamo contenuti come asset patrimoniali. Long-form SEO + AEO ready, video short-form, newsletter distintive. Ogni pezzo è progettato per generare traffico, autorità o conversione.",
    deliverables: [
      "Topical map e content strategy",
      "Produzione editoriale (testi, video, audio)",
      "Distribuzione e ripurpose multi-canale",
      "Performance review trimestrale"
    ],
    faq: [
      ["Producete in-house?", "Studio interno + rete di registi, copy, voice artist."],
      ["Quanto pesa il content sul totale?", "È spesso la leva con il ROI più lungo e più alto. Da 6 mesi in poi."]
    ],
    keywords: ["content marketing Italia", "long-form SEO content", "video short-form"]
  },
  {
    slug: "web-design",
    code: "09",
    title: "Web Design",
    short: "Siti che convertono e che ti fanno sembrare due taglie più grande.",
    long:
      "Design + development di siti e landing che combinano impatto creativo e conversion engineering. Stack moderno, performance Lighthouse 95+, accessibilità, SEO-ready e copy che vende.",
    deliverables: [
      "UX research e architettura informativa",
      "Art direction e prototipo high-fidelity",
      "Sviluppo headless (React / Next)",
      "Conversion rate optimization continua"
    ],
    faq: [
      ["Stack consigliato?", "Headless React/Next + CMS, oppure Webflow per progetti rapidi."],
      ["Quanto dura?", "6-12 settimane per un sito multi-pagina con design originale."]
    ],
    keywords: ["web design Cattolica", "siti web headless", "landing page conversion"]
  },
  {
    slug: "ai-marketing",
    code: "10",
    title: "AI Marketing",
    short: "Automazioni, agenti, workflow LLM. Marketing che scala da solo.",
    long:
      "Integriamo AI nei processi: agenti che qualificano lead, workflow di content generation, scoring automatico, ricerca di mercato continua. Non è hype, è leva operativa.",
    deliverables: [
      "Audit dei processi marketing automatizzabili",
      "Implementazione agenti LLM + tooling",
      "Workflow di content generation custom",
      "Monitoring qualità e cost-per-output"
    ],
    faq: [
      ["Quali modelli usate?", "Claude, GPT, Gemini. Stack agnostico, scelta sul caso d'uso."],
      ["Sostituisce le persone?", "No. Le libera dalle attività ripetitive."]
    ],
    keywords: ["AI marketing", "agenti LLM", "automazione marketing"]
  }
];

export const getService = (slug) => SERVICES.find((s) => s.slug === slug);
