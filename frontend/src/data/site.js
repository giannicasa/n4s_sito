const T = (it, en) => ({ it, en });

export const FOUNDERS = [
  {
    name: "Matteo Bertozzi",
    role: T("CEO · Growth Strategist", "CEO · Growth Strategist"),
    bio: T(
      "Quindici anni a smontare e rimontare funnel. Crede che la strategia sia sempre più importante del canale.",
      "Fifteen years dismantling and rebuilding funnels. Believes strategy always beats channel."
    ),
    color: "#9D4CDD"
  },
  {
    name: "Giulia Marconi",
    role: T("Creative Director · Brand", "Creative Director · Brand"),
    bio: T(
      "Direttrice creativa con un occhio per la cultura e uno per il copy che converte. Da Milano a Cattolica perché 'qui si lavora meglio'.",
      "Creative director with one eye on culture, the other on copy that converts. From Milan to Cattolica because 'we work better here'."
    ),
    color: "#ffffff"
  },
  {
    name: "Luca Severini",
    role: T("CTO · AI & MarTech Lead", "CTO · AI & MarTech Lead"),
    bio: T(
      "Ingegnere, builder, agent designer. Costruisce sistemi che lavorano mentre dormiamo.",
      "Engineer, builder, agent designer. Builds systems that work while we sleep."
    ),
    color: "#9D4CDD"
  },
  {
    name: "Sofia Pellegrini",
    role: T("Head of Performance · Data", "Head of Performance · Data"),
    bio: T(
      "Ex media buyer da agenzia internazionale. Difende ogni euro speso come fosse suo.",
      "Ex media buyer from international agencies. Defends every euro spent as her own."
    ),
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
