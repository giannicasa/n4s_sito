# Guida editoriale — pagine servizio not4sale

Questa guida vale per tutte le pagine di macro-area e di servizio del sito not4.sale. I file in `content/services/{area}.json` vengono importati nel CMS con `npm run content:import`.

## Chi siamo (fatti che si possono usare)

- **not4sale** (NOT4SALE Srl), studio di marketing con sede a **Cattolica (RN)**, Via Lungo Tavollo. Nato nel 2021.
- Tre soci, nessuna piramide di account: chi vende è chi lavora sul progetto.
  - **Giovanni Casagrande** — Head of Growth · Strategist, 25 anni nel digitale. E-commerce, SaaS, B2B, attività locali. Funnel di acquisizione, performance marketing, piattaforme su misura.
  - **Federico Rosa** — Sales Manager · Marketing Strategist, 10 anni a chiudere trattative con PMI e turismo.
  - **Gianluca Venturini** — Strategist · Commercial Mind, 25 anni di commerciale e marketing "nel mondo reale".
- Lavoriamo con aziende di **Cattolica, Rimini, Riccione, Pesaro, Romagna e Marche**, e da remoto con tutta Italia.
- Metodo: ipotesi → prototipo → test → dato → decisione. Niente pacchetti preconfezionati ("niente Ferrari a chi vuole una 500"). Selettivi: diciamo no quando non siamo il fit giusto.
- Risposta umana entro 24 ore lavorative. C'è un calcolatore di preventivo gratuito su `/preventivo`.

### Casi studio esistenti (gli unici risultati numerici citabili)

| slug | settore | titolo | risultato | leve |
|---|---|---|---|---|
| cs-001 | DTC · Wellness | Da founder-led brand a macchina di acquisizione | +312% revenue YoY | Brand Strategy, Performance Marketing, CRM |
| cs-002 | B2B · SaaS | Visibilità su Perplexity prima dei competitor | 63% share-of-voice AI | AEO, GEO, Content |
| cs-003 | Retail · Local | Locale, ma con la macchina di un brand nazionale | x4 lead qualificati | SEO locale, Social, Paid |
| cs-004 | Fashion · DTC | Riposizionamento + rilancio nella fascia premium | AOV +47% | Brand, Web Design, Content |
| cs-005 | Servizi professionali | Agente AI che qualifica i lead h24 | -58% costo per lead qualificato | AI Marketing, Web Design, Funnel |

I clienti sono anonimi: non dare nomi, città o dettagli che non sono in tabella.

## Regole che non si violano

1. **Niente fatti inventati.** Non inventare numeri di clienti, anni di esperienza oltre a quelli sopra, premi, certificazioni (es. "Google Partner"), partnership, nomi di clienti, testimonianze, statistiche di settore con cifre precise e fonti. Se un dato non è nella guida, non scriverlo. Si possono fare affermazioni generali vere e verificabili (es. "Google Analytics 4 ha sostituito Universal Analytics nel 2023").
2. **Niente prezzi.** Il campo prezzo non esiste nei file: lo compila lo studio. Nel testo si può dire che il preventivo dipende da X e Y e rimandare a `/preventivo`.
3. **Niente promesse di risultato** ("primi su Google garantito", "raddoppi le vendite"). Si promettono metodo, trasparenza, misurazione.
4. **Ogni pagina è unica.** Non riciclare paragrafi tra servizi: cambiano problema, metodo, esempi, FAQ. Il test: se scambi il nome del servizio e il testo regge ancora, è da riscrivere.
5. **Solo italiano.** Termini tecnici inglesi ammessi quando sono quelli che usa il mercato (funnel, lead, CRO, SEO), spiegati la prima volta se non ovvi.

## Tono di voce

Diretto, concreto, un po' ironico, mai arrogante. Frasi brevi. Si parla al "tu" all'imprenditore. Si chiamano le cose col loro nome. Esempi del tono già sul sito:

- "Costruiamo la macchina giusta per ogni cliente. Niente Ferrari a chi vuole una 500."
- "SEO non è una lista di parole chiave. È architettura, intento, autorità."
- "Le persone non cercano più, chiedono."
- "Niente vanity metric, solo numeri che spostano fatturato."

Da evitare: "a 360 gradi", "soluzioni su misura per ogni esigenza", "il partner ideale", "nell'era digitale", "in un mondo in continua evoluzione", elenchi di aggettivi, superlativi vuoti, emoji.

## Struttura SEO / AEO / GEO

Ogni pagina deve rispondere bene a chi cerca su Google **e** a chi chiede a ChatGPT/Perplexity. Quindi:

- **Keyword principale** nell'H1 (`headline`), nel `metaTitle`, nella prima frase di `answer` e in almeno un H2 del `body`. Varianti e sinonimi nel resto del testo, in modo naturale.
- **`answer`**: 40–60 parole, autosufficiente (si capisce senza leggere altro), risponde a "cos'è e cosa fate", contiene "not4sale" e almeno una volta il territorio solo dove è naturale. È il paragrafo che le AI citano: niente battute, solo chiarezza.
- **`body`**: H2 formulati come domande o affermazioni che una persona cercherebbe ("Quanto tempo serve per vedere risultati con la SEO?"). Sotto ogni H2, la prima frase risponde subito, poi si approfondisce. Elenchi puntati e numerati dove aiutano. Una tabella è benvenuta dove confronta opzioni.
- **Territorio**: Cattolica / Rimini / Riccione / Pesaro / Romagna / Marche citati 1–2 volte per pagina dove ha senso (soprattutto servizi locali). Mai liste di città riempitive.
- **Link interni**: 3–6 link Markdown nel `body` (e se utile nel `problem`) verso altri servizi o aree, con anchor text descrittivo (non "clicca qui"). Usa solo URL presenti in `content/MAPPA-URL.md` o queste pagine: `/preventivo`, `/contatti`, `/case-studies`, `/chi-siamo`, `/blog/aeo-vs-seo-cosa-cambia`, `/blog/growth-hacking-perche-funziona`, `/blog/brand-strategy-non-e-il-logo`, `/blog/ai-marketing-cosa-automatizzare`.
- **FAQ**: domande vere che un imprenditore fa prima di comprare (tempi, costi da cosa dipendono, cosa serve da parte sua, differenze tra opzioni, cosa succede se...). Risposte 40–90 parole, dirette, senza ripetere la domanda.

## Formato del file `content/services/{area}.json`

```json
{
  "area": {
    "slug": "seo",
    "headline": "Agenzia SEO a Cattolica: posizionamento su Google che porta clienti",
    "short": "Una riga (max 140 caratteri) per card ed elenchi.",
    "answer": "40–60 parole.",
    "body": "Markdown, 500–800 parole. H2 con ##, H3 con ###. Panoramica dell'area: quando serve, come si combinano i servizi, come lavoriamo, per chi è. Deve linkare i servizi dell'area.",
    "faq": [{ "question": "…", "answer": "…" }],
    "metaTitle": "max 60 caratteri, keyword all'inizio, finisce con | not4sale",
    "metaDescription": "140–155 caratteri, keyword + beneficio + invito all'azione"
  },
  "services": [
    {
      "slug": "seo-locale",
      "headline": "H1 con keyword principale (max ~70 caratteri)",
      "short": "Una riga (max 140 caratteri).",
      "answer": "40–60 parole.",
      "problem": "Markdown, 120–200 parole: cosa non funziona oggi per il cliente tipo e perché costa soldi. Niente H2.",
      "process": [{ "title": "Nome passo (2–4 parole)", "description": "1–2 frasi." }],
      "deliverables": ["Deliverable concreto", "…"],
      "body": "Markdown, 600–900 parole, 3–5 sezioni ##.",
      "faq": [{ "question": "…", "answer": "…" }],
      "related": ["slug-servizio", "…"],
      "caseStudies": ["cs-003"],
      "metaTitle": "…",
      "metaDescription": "…"
    }
  ]
}
```

Vincoli:

- `area.faq`: 5 domande. `services[].faq`: 5–6 domande.
- `process`: 4–5 passi. `deliverables`: 5–7 voci concrete (documenti, configurazioni, report, campagne — cose che il cliente riceve davvero).
- `related`: 3–4 slug di servizi, anche di altre aree, scelti perché un cliente li combina davvero.
- `caseStudies`: 0–2 slug tra cs-001…cs-005, solo se le leve coincidono davvero. Altrimenti `[]`.
- Totale per servizio (answer + problem + body + process + faq): almeno 1.000 parole.
- I servizi vanno nell'ordine della mappa, tutti presenti, con gli slug esatti.
- JSON valido UTF-8; nei testi Markdown usa `\n` per gli a capo (il file è JSON).
