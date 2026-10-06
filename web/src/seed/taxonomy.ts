// Mappa servizi approvata (ottobre 2026): 13 macro-aree → sotto-servizi.
// Il seed crea tutto in bozza; le pagine si pubblicano quando hanno contenuto completo.
// wave: priorità editoriale (1 = da scrivere subito).

type L = { it: string; en: string }

export type SeedService = {
  slug: string
  title: L
  short: string
  wave: '1' | '2' | '3'
  // slug del vecchio /servizi/:slug che deve puntare a questa pagina
  legacy?: string
}

export type SeedArea = {
  slug: string
  code: string
  title: L
  headline: string
  short: L
  legacy?: string[]
  services: SeedService[]
}

const s = (slug: string, it: string, en: string, short: string, wave: SeedService['wave'], legacy?: string): SeedService => ({
  slug,
  title: { it, en },
  short,
  wave,
  legacy,
})

export const TAXONOMY: SeedArea[] = [
  {
    slug: 'strategia',
    code: '01',
    title: { it: 'Strategia & Consulenza', en: 'Strategy & Consulting' },
    headline: 'Consulenza di marketing strategico per PMI',
    short: {
      it: 'Diagnosi, posizionamento e piano marketing: prima di spendere, capiamo dove si vince.',
      en: 'Diagnosis, positioning and marketing plan: before spending, we find where you win.',
    },
    services: [
      s('analisi-di-mercato', 'Analisi di mercato', 'Market research', 'Domanda, trend e spazi liberi nel tuo mercato, letti con dati e non con impressioni.', '2'),
      s('analisi-competitiva', 'Analisi competitiva', 'Competitive analysis', 'Cosa fanno i concorrenti online, dove sono deboli e dove puoi superarli.', '2'),
      s('piano-marketing', 'Piano marketing', 'Marketing plan', 'Obiettivi, canali, budget e KPI messi in fila in un piano che si può eseguire.', '1'),
      s('brand-positioning', 'Brand positioning', 'Brand positioning', 'Una posizione chiara nella testa del cliente: per chi sei, contro chi, perché tu.', '2'),
      s('temporary-marketing-manager', 'Temporary marketing manager', 'Fractional marketing manager', 'Un responsabile marketing senior in azienda, a tempo, senza assumerlo.', '1'),
      s('digital-transformation', 'Digital transformation', 'Digital transformation', 'Processi, strumenti e competenze per portare il marketing della PMI nel digitale.', '3'),
      s('customer-experience', 'Customer experience', 'Customer experience', 'Mappiamo il percorso del cliente e togliamo gli attriti che fanno perdere vendite.', '3'),
    ],
  },
  {
    slug: 'growth',
    code: '02',
    title: { it: 'Growth', en: 'Growth' },
    headline: 'Growth marketing: crescita misurabile, esperimento dopo esperimento',
    short: {
      it: 'Esperimenti rapidi, ciclo dati→ipotesi→test→scala. Crescita senza permesso.',
      en: 'Rapid experiments, data→hypothesis→test→scale loop. Growth without permission.',
    },
    services: [
      s('growth-hacking', 'Growth hacking', 'Growth hacking', 'Sprint di esperimenti settimanali su tutto il funnel, tenendo solo ciò che sposta il fatturato.', '1', 'growth-hacking'),
      s('funnel-cro', 'Funnel e CRO', 'Funnel & CRO', 'Più conversioni dallo stesso traffico: analisi del funnel e ottimizzazione delle pagine chiave.', '1'),
      s('ab-test', 'A/B test', 'A/B testing', 'Test progettati per dare risposte statisticamente valide, non opinioni.', '3'),
      s('lead-generation', 'Lead generation', 'Lead generation', 'Un flusso costante di contatti qualificati per il tuo commerciale, B2B e B2C.', '1'),
      s('product-led-growth', 'Product-led growth', 'Product-led growth', 'Il prodotto come motore di acquisizione: onboarding, attivazione e referral.', '3'),
    ],
  },
  {
    slug: 'seo',
    code: '03',
    title: { it: 'SEO', en: 'SEO' },
    headline: 'Agenzia SEO: posizionamento su Google che porta clienti',
    short: {
      it: 'Strategia di visibilità organica end-to-end: technical, content, link.',
      en: 'End-to-end organic visibility strategy: technical, content, link.',
    },
    legacy: ['seo'],
    services: [
      s('seo-tecnico', 'SEO tecnico', 'Technical SEO', 'Scansione, indicizzazione, velocità e architettura: le fondamenta che Google deve poter leggere.', '1'),
      s('seo-locale', 'SEO locale', 'Local SEO', 'Primi su Google Maps e nelle ricerche "vicino a me" a Cattolica, Rimini e dintorni.', '1'),
      s('seo-ecommerce', 'SEO per e-commerce', 'E-commerce SEO', 'Categorie, schede prodotto e filtri ottimizzati per vendere da traffico organico.', '1'),
      s('audit-seo', 'Audit SEO', 'SEO audit', 'Una radiografia completa del sito con priorità chiare: cosa sistemare prima e perché.', '1'),
      s('link-building', 'Link building e digital PR', 'Link building & digital PR', 'Autorità reale con menzioni e link da testate e siti di settore.', '2'),
      s('seo-internazionale', 'SEO internazionale', 'International SEO', 'Siti multilingua e multi-paese impostati per posizionarsi in ogni mercato.', '3'),
      s('migrazione-seo', 'Migrazione SEO', 'SEO migration', 'Cambi sito o dominio senza perdere posizionamenti e traffico.', '2'),
      s('voice-search', 'SEO per ricerca vocale', 'Voice search SEO', 'Contenuti pensati per le domande fatte a voce ad assistenti e smartphone.', '3'),
    ],
  },
  {
    slug: 'ai-search',
    code: '04',
    title: { it: 'AI Search · AEO & GEO', en: 'AI Search · AEO & GEO' },
    headline: 'Visibilità nelle AI: farsi citare da ChatGPT, Perplexity e Google AI',
    short: {
      it: 'Le persone non cercano più, chiedono. Ti rendiamo la risposta che le AI citano.',
      en: "People don't search anymore, they ask. We make you the answer AI cites.",
    },
    services: [
      s('answer-engine-optimization', 'AEO · Answer Engine Optimization', 'AEO · Answer Engine Optimization', 'Ottimizzazione per ChatGPT, Perplexity, Google AI Overviews.', '1', 'aeo'),
      s('generative-engine-optimization', 'GEO · Generative Engine Optimization', 'GEO · Generative Engine Optimization', 'Essere citati dai modelli generativi. Visibili nelle risposte, non nelle SERP.', '1', 'geo'),
      s('visibilita-chatgpt', 'Visibilità su ChatGPT', 'ChatGPT visibility', 'Far comparire il tuo brand quando ChatGPT consiglia aziende del tuo settore.', '1'),
      s('google-ai-overviews', 'Google AI Overviews', 'Google AI Overviews', 'Contenuti strutturati per essere la fonte delle risposte AI in cima a Google.', '1'),
      s('perplexity', 'Visibilità su Perplexity', 'Perplexity visibility', 'Fonti, citazioni e contenuti che Perplexity sceglie come riferimento.', '2'),
      s('dati-strutturati', 'Dati strutturati e schema', 'Structured data & schema', 'Schema.org e segnali di entità per far capire a motori e AI chi sei e cosa fai.', '2'),
      s('monitoraggio-ai', 'Monitoraggio citazioni AI', 'AI citation tracking', 'Misuriamo quanto e come le AI parlano del tuo brand rispetto ai concorrenti.', '2'),
    ],
  },
  {
    slug: 'advertising',
    code: '05',
    title: { it: 'Advertising', en: 'Advertising' },
    headline: 'Campagne pubblicitarie online che si ripagano',
    short: {
      it: 'Media buying chirurgico su Meta, Google, TikTok, LinkedIn.',
      en: 'Surgical media buying on Meta, Google, TikTok, LinkedIn.',
    },
    legacy: ['performance-marketing'],
    services: [
      s('google-ads', 'Google Ads', 'Google Ads', 'Campagne Search, Performance Max e Display gestite su ritorno, non su clic.', '1'),
      s('meta-ads', 'Meta Ads', 'Meta Ads', 'Facebook e Instagram Ads con test creativi continui e tracciamento affidabile.', '1'),
      s('tiktok-ads', 'TikTok Ads', 'TikTok Ads', 'Creatività native e campagne TikTok per raggiungere pubblici che altrove non vedi.', '2'),
      s('linkedin-ads', 'LinkedIn Ads', 'LinkedIn Ads', 'Campagne B2B mirate per ruolo, settore e azienda: meno contatti, più decisori.', '2'),
      s('youtube-ads', 'YouTube Ads', 'YouTube Ads', 'Video advertising per notorietà e conversioni, con targeting per intento.', '3'),
      s('amazon-ads', 'Amazon Ads', 'Amazon Ads', 'Sponsored Products e Brands per vendere di più su Amazon a ACOS sotto controllo.', '3'),
      s('google-shopping', 'Google Shopping', 'Google Shopping', 'Feed prodotti ottimizzati e campagne Shopping per e-commerce.', '2'),
      s('retargeting', 'Retargeting', 'Retargeting', 'Riportare a comprare chi ha già visitato il sito, senza inseguirlo ovunque.', '3'),
    ],
  },
  {
    slug: 'social',
    code: '06',
    title: { it: 'Social Media', en: 'Social Media' },
    headline: 'Social media marketing: presenza che crea clienti, non solo like',
    short: {
      it: 'Presenza social che crea cultura, non solo contenuti.',
      en: 'Social presence that creates culture, not just content.',
    },
    legacy: ['social'],
    services: [
      s('gestione-social', 'Gestione social media', 'Social media management', 'Piano editoriale, contenuti, pubblicazione e report: i tuoi social gestiti da professionisti.', '1'),
      s('instagram', 'Instagram marketing', 'Instagram marketing', 'Reel, caroselli e storie con una linea chiara e obiettivi misurabili.', '1'),
      s('tiktok', 'TikTok marketing', 'TikTok marketing', 'Format nativi e creator per farsi scoprire su TikTok.', '2'),
      s('linkedin-aziendale', 'LinkedIn aziendale', 'LinkedIn for business', 'Pagina aziendale e profili dei manager che generano fiducia e contatti B2B.', '2'),
      s('influencer-marketing', 'Influencer marketing', 'Influencer marketing', 'Creator scelti sui dati, accordi chiari e risultati misurati.', '2'),
      s('social-listening', 'Social listening', 'Social listening', 'Ascoltare cosa si dice del tuo brand e del settore per decidere meglio.', '3'),
      s('community-management', 'Community management', 'Community management', 'Risposte, moderazione e relazione quotidiana con la tua community.', '3'),
    ],
  },
  {
    slug: 'branding',
    code: '07',
    title: { it: 'Branding & Comunicazione', en: 'Branding & Communication' },
    headline: 'Agenzia di branding: identità che si riconosce e si ricorda',
    short: {
      it: 'Posizionamento, narrativa, voce. Un brand che non si confonde.',
      en: "Positioning, narrative, voice. A brand that doesn't blend in.",
    },
    services: [
      s('brand-strategy', 'Brand strategy', 'Brand strategy', 'Chi sei, per chi sei e perché esisti: la strategia prima del logo.', '1', 'brand-strategy'),
      s('naming', 'Naming', 'Naming', 'Nomi di brand e prodotto distintivi, verificati e registrabili.', '2'),
      s('logo-identita-visiva', 'Logo e identità visiva', 'Logo & visual identity', 'Logo, colori, tipografia e sistema visivo coerente su ogni supporto.', '1'),
      s('immagine-coordinata', 'Immagine coordinata', 'Corporate identity', 'Biglietti, carta intestata, firme email, presentazioni: tutto con la stessa voce visiva.', '2'),
      s('brand-guidelines', 'Brand guidelines', 'Brand guidelines', 'Il manuale che permette a chiunque di usare il brand senza snaturarlo.', '3'),
      s('tone-of-voice', 'Tone of voice', 'Tone of voice', 'Come parla il tuo brand: regole ed esempi per scrivere sempre riconoscibili.', '3'),
      s('campagne-comunicazione', 'Campagne di comunicazione', 'Communication campaigns', 'Idee creative e campagne integrate online e offline.', '2'),
      s('packaging', 'Packaging design', 'Packaging design', 'Confezioni che si fanno notare a scaffale e raccontano il prodotto.', '3'),
      s('grafica-fiere', 'Grafica per fiere ed eventi', 'Trade show & event design', 'Stand, materiali ed eventi che portano contatti, non solo visitatori.', '3'),
    ],
  },
  {
    slug: 'content',
    code: '08',
    title: { it: 'Content & Produzione', en: 'Content & Production' },
    headline: 'Content marketing e produzione: contenuti che lavorano per anni',
    short: {
      it: 'Articoli, video, podcast, newsletter. Contenuti che lavorano per anni.',
      en: 'Articles, video, podcast, newsletter. Content that works for years.',
    },
    legacy: ['content'],
    services: [
      s('content-marketing', 'Content marketing', 'Content marketing', 'Strategia e produzione di contenuti che portano traffico, autorità e richieste.', '1'),
      s('copywriting', 'Copywriting', 'Copywriting', 'Testi per siti, landing, ads ed email scritti per convertire.', '1'),
      s('storytelling', 'Storytelling aziendale', 'Brand storytelling', 'La storia del tuo brand raccontata in modo che le persone la ricordino.', '3'),
      s('video-spot', 'Video e spot', 'Video & commercials', 'Spot, video aziendali e contenuti short-form, dall\'idea al montaggio.', '2'),
      s('fotografia', 'Fotografia', 'Photography', 'Foto di prodotto, di persone e di ambienti per sito, social e cataloghi.', '3'),
      s('podcast', 'Podcast aziendale', 'Branded podcast', 'Ideazione, registrazione e distribuzione di podcast di brand.', '3'),
      s('newsletter', 'Newsletter', 'Newsletter', 'Newsletter che le persone aprono davvero, con una linea editoriale riconoscibile.', '2'),
    ],
  },
  {
    slug: 'web-app',
    code: '09',
    title: { it: 'Web & App', en: 'Web & App' },
    headline: 'Realizzazione siti web e app che convertono',
    short: {
      it: 'Siti che convertono e che ti fanno sembrare due taglie più grande.',
      en: 'Websites that convert and make you look two sizes bigger.',
    },
    legacy: ['web-design'],
    services: [
      s('siti-web', 'Realizzazione siti web', 'Website design & development', 'Siti aziendali veloci, curati e pensati per generare contatti.', '1'),
      s('landing-page', 'Landing page', 'Landing pages', 'Pagine dedicate a una sola azione, costruite per campagne e lanci.', '1'),
      s('ux-ui-design', 'UX/UI design', 'UX/UI design', 'Interfacce chiare e piacevoli, progettate partendo da come le persone le usano.', '2'),
      s('web-app', 'Web app su misura', 'Custom web apps', 'Piattaforme, portali e gestionali web sviluppati sulle tue esigenze.', '2'),
      s('app-mobile', 'App mobile', 'Mobile apps', 'App iOS e Android, dal prototipo alla pubblicazione sugli store.', '3'),
      s('headless-cms', 'Headless CMS', 'Headless CMS', 'Contenuti gestiti da un pannello, pubblicati veloci su sito, app e altri canali.', '3'),
      s('hosting-manutenzione', 'Hosting e manutenzione', 'Hosting & maintenance', 'Sito sempre aggiornato, sicuro, con backup e assistenza.', '2'),
      s('accessibilita-web', 'Accessibilità web', 'Web accessibility', 'Siti conformi alle norme di accessibilità e usabili da tutti.', '3'),
    ],
  },
  {
    slug: 'ecommerce',
    code: '10',
    title: { it: 'E-commerce', en: 'E-commerce' },
    headline: 'Agenzia e-commerce: negozi online che vendono',
    short: {
      it: 'Dal negozio online ai marketplace: progettiamo, lanciamo e facciamo crescere le vendite.',
      en: 'From online store to marketplaces: we design, launch and grow sales.',
    },
    services: [
      s('shopify', 'E-commerce Shopify', 'Shopify e-commerce', 'Negozi Shopify su misura, veloci e pronti a scalare.', '1'),
      s('woocommerce', 'E-commerce WooCommerce', 'WooCommerce e-commerce', 'Negozi WooCommerce integrati con WordPress e i tuoi gestionali.', '2'),
      s('marketplace-amazon', 'Marketplace e Amazon', 'Marketplaces & Amazon', 'Vendere su Amazon e marketplace: apertura, schede, logistica e advertising.', '2'),
      s('gestione-ecommerce', 'Gestione e-commerce', 'E-commerce management', 'Catalogo, promozioni, ordini e crescita gestiti da un team dedicato.', '2'),
      s('pagamenti', 'Integrazione pagamenti', 'Payment integration', 'Checkout e pagamenti (Stripe, PayPal, Satispay) integrati senza attriti.', '3'),
      s('customer-care', 'Customer care e-commerce', 'E-commerce customer care', 'Assistenza clienti organizzata, anche con AI, che riduce resi e recensioni negative.', '3'),
    ],
  },
  {
    slug: 'crm-email',
    code: '11',
    title: { it: 'CRM & Email', en: 'CRM & Email' },
    headline: 'CRM, email marketing e automazioni che vendono mentre dormi',
    short: {
      it: 'Dati dei clienti, email e automazioni collegati in un unico sistema che vende.',
      en: 'Customer data, email and automations connected in one system that sells.',
    },
    services: [
      s('email-marketing', 'Email marketing', 'Email marketing', 'Campagne e newsletter che portano vendite, non solo aperture.', '1'),
      s('marketing-automation', 'Marketing automation', 'Marketing automation', 'Sequenze automatiche che accompagnano il contatto fino all\'acquisto.', '1'),
      s('hubspot', 'Consulenza HubSpot', 'HubSpot consulting', 'Implementazione, integrazione e uso quotidiano di HubSpot CRM.', '2'),
      s('loyalty', 'Programmi loyalty', 'Loyalty programs', 'Programmi fedeltà che fanno tornare i clienti e aumentano il valore nel tempo.', '3'),
      s('segmentazione', 'Segmentazione clienti', 'Customer segmentation', 'Gruppi di clienti costruiti sui dati per messaggi davvero pertinenti.', '3'),
      s('lead-nurturing', 'Lead nurturing', 'Lead nurturing', 'Contenuti e contatti al momento giusto per trasformare i lead in clienti.', '2'),
    ],
  },
  {
    slug: 'ai-automazione',
    code: '12',
    title: { it: 'AI & Automazione', en: 'AI & Automation' },
    headline: "Intelligenza artificiale per il marketing e l'azienda",
    short: {
      it: 'Automazioni, agenti, workflow LLM. Marketing che scala da solo.',
      en: 'Automations, agents, LLM workflows. Marketing that scales itself.',
    },
    legacy: ['ai-marketing'],
    services: [
      s('chatbot', 'Chatbot e assistenti virtuali', 'Chatbots & virtual assistants', 'Assistenti AI su sito e WhatsApp che rispondono e qualificano i contatti h24.', '1'),
      s('automazioni-n8n', 'Automazioni con n8n', 'n8n automations', 'Flussi automatici che collegano sito, CRM, email e gestionali.', '1'),
      s('agenti-ai', 'Agenti AI', 'AI agents', 'Agenti che svolgono compiti completi: ricerca, qualificazione, reportistica.', '2'),
      s('analisi-predittiva', 'Analisi predittiva', 'Predictive analytics', 'Previsioni su vendite, abbandono e valore cliente per decidere prima.', '3'),
      s('formazione-ai', 'Formazione AI per aziende', 'AI training for companies', 'Corsi pratici per usare l\'AI nel lavoro di tutti i giorni.', '2'),
    ],
  },
  {
    slug: 'data-analytics',
    code: '13',
    title: { it: 'Data & Analytics', en: 'Data & Analytics' },
    headline: 'Web analytics e tracciamento: decisioni sui numeri giusti',
    short: {
      it: 'Tracciamento affidabile e dashboard chiare: sapere cosa funziona e quanto rende.',
      en: 'Reliable tracking and clear dashboards: know what works and what it returns.',
    },
    services: [
      s('google-analytics-4', 'Google Analytics 4', 'Google Analytics 4', 'Configurazione GA4, eventi e conversioni impostati sui tuoi obiettivi.', '2'),
      s('tracking-gtm', 'Tracking e Google Tag Manager', 'Tracking & Google Tag Manager', 'Tag, pixel e conversioni ordinati in GTM, conformi al GDPR.', '2'),
      s('server-side-tracking', 'Server-side tracking', 'Server-side tracking', 'Dati di conversione completi nonostante blocchi e cookie: meglio per ads e analisi.', '2'),
      s('dashboard', 'Dashboard e reportistica', 'Dashboards & reporting', 'Un unico cruscotto con i numeri che contano, aggiornato in automatico.', '3'),
      s('attribuzione', 'Modelli di attribuzione', 'Attribution modeling', 'Capire quale canale porta davvero le vendite e dove spostare il budget.', '3'),
    ],
  },
]
