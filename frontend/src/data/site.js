const T = (it, en) => ({ it, en });

export const FOUNDERS = [
  {
    name: "Giovanni Casagrande",
    role: T("Head of Growth · Strategist", "Head of Growth · Strategist"),
    years: "25Y",
    yearsLabel: T("nel digital", "in digital"),
    bio: T(
      "25 anni a smontare business, trovare il collo di bottiglia e rimetterli in pista. E-commerce, SaaS, B2B, locali: ha visto di tutto e ha la cicatrice giusta per ogni settore. Nei suoi progetti porta a casa fatturati da 10k a 50k€ in più nei primi 6 mesi — non perché 'crede nell'awareness', ma perché disegna funnel che funzionano e li misura ogni giorno.",
      "25 years dismantling businesses, finding the bottleneck and putting them back on track. E-commerce, SaaS, B2B, local: he's seen it all and has the right scar for every industry. He lands his clients between €10k and €50k of new revenue in the first 6 months — not by 'believing in awareness', but by designing funnels that work and measuring them every day."
    ),
    skills: T(
      ["Strategia di crescita", "Funnel di acquisizione", "Performance marketing", "Piattaforme su misura"],
      ["Growth strategy", "Acquisition funnels", "Performance marketing", "Custom platforms"]
    ),
    vibe: T("Diagnosi rapida. Cure precise.", "Fast diagnosis. Precise cure."),
    color: "#9D4CDD"
  },
  {
    name: "Federico Rosa",
    role: T("Sales Manager · Marketing Strategist", "Sales Manager · Marketing Strategist"),
    years: "10Y",
    yearsLabel: T("a chiudere", "closing deals"),
    bio: T(
      "Dieci anni passati a parlare con gli imprenditori veri, quelli che firmano. PMI, turismo, deal da centinaia di migliaia di euro: dall'apertura della trattativa alla stretta di mano. Lo chiamano quando un progetto deve ritornare 5 volte il budget — e fin qui non ha deluso le aspettative. Niente script da call center, solo conversazioni che chiudono.",
      "Ten years talking to real entrepreneurs — the ones who actually sign. SMEs, tourism, deals worth hundreds of thousands of euros: from the first email to the handshake. He gets called when a project must return 5x the budget — and so far he hasn't disappointed. No call-center scripts, just conversations that close."
    ),
    skills: T(
      ["Strategia commerciale", "Acquisizione clienti", "Sales process", "Gestione trattative"],
      ["Commercial strategy", "Client acquisition", "Sales process", "Deal management"]
    ),
    vibe: T("Vende. Anche quando sembra che chiacchieri.", "He sells. Even when it looks like he's just chatting."),
    color: "#ffffff"
  },
  {
    name: "Valentino Piemonti",
    role: T("Digital Photo Strategist · Communication", "Digital Photo Strategist · Communication"),
    years: "20Y",
    yearsLabel: T("dietro la lente", "behind the lens"),
    bio: T(
      "20 anni a guardare il mondo da dietro una lente — e a capire prima degli altri come voleva farsi raccontare. Ha lavorato con brand di fascia alta su progetti nazionali, costruendo immagini che non sono solo 'belle': sono posizionamento. Per lui un'immagine ha un solo lavoro: cambiare la percezione che il mercato ha di te. Tutto il resto è stock photo.",
      "20 years looking at the world through a lens — and figuring out before everyone else how it wanted to be told. He's worked with premium brands on national-scale projects, crafting images that aren't just 'pretty': they're positioning. To him an image has one job — change how the market sees you. Everything else is stock photo."
    ),
    skills: T(
      ["Strategia visiva", "Produzione foto · video", "Brand communication", "Direzione creativa"],
      ["Visual strategy", "Photo · video production", "Brand communication", "Creative direction"]
    ),
    vibe: T("Estetica solo se è anche strategia.", "Aesthetics only if they're also strategy."),
    color: "#9D4CDD"
  },
  {
    name: "Gianluca Venturini",
    role: T("Strategist · Commercial Mind", "Strategist · Commercial Mind"),
    years: "25Y",
    yearsLabel: T("sul campo", "in the field"),
    bio: T(
      "25 anni a fare commerciale e marketing nel mondo reale, quello in cui i clienti pagano e non like-ano. Ha visto mode passare, slide morire e dashboard riempirsi di vanity metric: lui invece resta attaccato a una sola domanda — 'sta portando soldi?'. Strateghi così non si trovano nelle classifiche LinkedIn, si trovano per fortuna.",
      "25 years in sales and marketing in the real world — the one where customers pay, not like. He's seen trends fade, slides die and dashboards fill up with vanity metrics: he sticks to one question — 'is this making money?'. Strategists like him aren't found in LinkedIn rankings. You find them by luck."
    ),
    skills: T(
      ["Visione commerciale", "Posizionamento", "Sales · marketing alignment", "Senso pratico"],
      ["Commercial vision", "Positioning", "Sales · marketing alignment", "Common sense"]
    ),
    vibe: T("Allergico alle vanity metric.", "Allergic to vanity metrics."),
    color: "#ffffff"
  }
];

export const CASE_STUDIES = [
  {
    code: "CS·001",
    industry: T("DTC · Wellness", "DTC · Wellness"),
    title: T("Da founder-led brand a macchina di acquisizione", "From founder-led brand to acquisition machine"),
    metric: T("+312% revenue YoY", "+312% revenue YoY"),
    excerpt: T(
      "Marchio nato su Instagram. Ristrutturato funnel, brand, performance e CRM in 9 mesi.",
      "Brand born on Instagram. Funnel, brand, performance and CRM restructured in 9 months."
    ),
    levers: T(["Brand Strategy", "Performance Marketing", "CRM"], ["Brand Strategy", "Performance Marketing", "CRM"])
  },
  {
    code: "CS·002",
    industry: T("B2B · SaaS", "B2B · SaaS"),
    title: T("Visibilità su Perplexity prima dei competitor", "Perplexity visibility before competitors"),
    metric: T("63% share-of-voice AI", "63% AI share-of-voice"),
    excerpt: T(
      "Posizionato un B2B SaaS come risposta default nei motori AI nel suo segmento.",
      "Positioned a B2B SaaS as the default answer in AI engines for its segment."
    ),
    levers: T(["AEO", "GEO", "Content"], ["AEO", "GEO", "Content"])
  },
  {
    code: "CS·003",
    industry: T("Retail · Local", "Retail · Local"),
    title: T("Locale, ma con la macchina di un brand nazionale", "Local, with a national-grade machine"),
    metric: T("x4 lead qualificati", "x4 qualified leads"),
    excerpt: T(
      "Attività locale trasformata in punto di riferimento del territorio. SEO locale, social, paid.",
      "Local business turned into a regional reference. Local SEO, social, paid."
    ),
    levers: T(["SEO Local", "Social", "Paid"], ["Local SEO", "Social", "Paid"])
  },
  {
    code: "CS·004",
    industry: T("Fashion · DTC", "Fashion · DTC"),
    title: T("Riposizionamento + rilancio nella fascia premium", "Repositioning + premium relaunch"),
    metric: T("AOV +47%", "AOV +47%"),
    excerpt: T(
      "Brand fashion riposizionato dalla fascia media a quella alta. Nuova identità, nuovo pubblico.",
      "Fashion brand repositioned from mid to high tier. New identity, new audience."
    ),
    levers: T(["Brand", "Web Design", "Content"], ["Brand", "Web Design", "Content"])
  },
  {
    code: "CS·005",
    industry: T("Servizi Pro", "Pro Services"),
    title: T("Agente AI che qualifica i lead h24", "AI agent qualifying leads 24/7"),
    metric: T("-58% costo per lead qualificato", "-58% cost per qualified lead"),
    excerpt: T(
      "Studio professionale: agente LLM custom integrato nel sito e nei DM, lead già caldi al primo contatto.",
      "Professional studio: custom LLM agent integrated in site and DMs, leads already warm on first touch."
    ),
    levers: T(["AI Marketing", "Web Design", "Funnel"], ["AI Marketing", "Web Design", "Funnel"])
  }
];
