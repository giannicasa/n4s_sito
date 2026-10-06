# Guida editoriale — pagine territoriali e di settore

Vale per le pagine **comune** (`/agenzia-marketing/{comune}`), **settore** (`/settori/{settore}`) e **servizio in città** (`/agenzia-marketing/{comune}/{servizio}`).

Prima leggi `content/GUIDA-EDITORIALE.md`: tono di voce, regole su fatti inventati, prezzi, promesse e link valgono anche qui. Questa guida aggiunge le regole specifiche.

## Perché queste pagine sono rischiose

Google penalizza le **doorway pages**: pagine quasi identiche in cui cambia solo il nome della città. Se le nostre pagine comune si somigliano, rischiano di trascinare giù tutto il sito. Quindi:

- **Il test dello scambio:** sostituisci il nome del comune con quello di un comune vicino. Se il testo regge ancora, è da riscrivere.
- Ogni pagina comune deve parlare di **cose che esistono solo lì**: settori economici reali del comune, zone artigianali e industriali, frazioni, prodotti tipici, eventi, flussi turistici, distretti, posizione geografica (costa, collina, Appennino, confine con San Marino o con la Toscana), stagionalità, dimensione del tessuto d'impresa.
- **Struttura variabile:** non usare la stessa scaletta di H2 per tutti i comuni del tuo gruppo. Scegli gli argomenti in base a cosa conta in quel comune (per Gradara il turismo del castello, per Tavullia l'indotto legato al motociclismo, per Pesaro il distretto del mobile, per Cagli e l'Appennino lo spopolamento e il turismo lento…).

## Chi siamo sul territorio (fatti utilizzabili)

- Sede a **Cattolica (RN)**, al confine tra Romagna e Marche.
- **Incontriamo i clienti di persona**, in azienda o in sede. Nei comuni lontani alterniamo incontri in presenza e videochiamate.
- Abbiamo clienti sparsi nelle province di Rimini e Pesaro e Urbino, ma **non li citiamo**: niente nomi, niente "abbiamo lavorato con un hotel di Riccione", niente numeri di clienti per comune.
- Non abbiamo uffici in altri comuni: mai scrivere "la nostra sede di Pesaro" o simili.

## Ricerca obbligatoria

Per ogni comune **cerca sul web** (WebSearch / WebFetch) prima di scrivere: sito del comune, Wikipedia, Camera di commercio, siti turistici, notizie locali. Usa solo fatti che hai verificato:

- settori economici, distretti, zone produttive, aziende-simbolo del territorio **solo come contesto generale** (es. "la zona industriale di Villa Fastiggi"), mai come nostri clienti;
- frazioni, posizione, collegamenti (A14, SS16, Fondovalle, ferrovia), distanza da Cattolica;
- turismo: attrazioni, borghi, eventi ricorrenti, Bandiere arancioni, Bandiere blu, ecc.;
- curiosità che danno identità (prodotti DOP/IGP, tradizioni, festival).

Se un dato non lo trovi o non sei sicuro, **non scriverlo**. Niente cifre (abitanti, numero di imprese, presenze turistiche) se non le hai verificate su una fonte attendibile; nel dubbio usa formulazioni qualitative. Non riportare le fonti nel testo.

`distanceKm` e `travelMinutes`: distanza e tempo in auto **dal centro di Cattolica**, arrotondati (es. 25 km, 30 minuti). `geo`: coordinate del centro del comune (4 decimali).

## Pagina comune — formato

File `content/local/comuni/{batch}.json`:

```json
{
  "locations": [
    {
      "slug": "san-leo",
      "name": "San Leo",
      "province": "RN",
      "zone": "Alta Valmarecchia",
      "headline": "Agenzia di marketing per le imprese di San Leo",
      "short": "max 140 caratteri",
      "answer": "40–60 parole: chi siamo per le aziende di quel comune, cosa facciamo, che veniamo di persona. Nomina il comune.",
      "economy": "Markdown, 180–320 parole. Il tessuto economico e il territorio del comune, con fatti verificati. Niente H2.",
      "challenges": "Markdown, 130–250 parole. Le sfide di marketing tipiche delle aziende di QUEL comune (stagionalità, distanza dai centri, concorrenza della costa, export, ricambio generazionale…). Niente H2.",
      "body": "Markdown, 350–650 parole, 2–4 sezioni ##. Come lavoriamo lì: quali servizi servono davvero a quel territorio e perché, con link ai servizi e ai settori. Una sezione sul come ci incontriamo (in presenza, distanza da Cattolica).",
      "faq": [{ "question": "…", "answer": "…" }],
      "highlights": ["4–6 elementi del territorio, brevi: 'Rocca di San Leo', 'Fiera del tartufo'…"],
      "distanceKm": 35,
      "travelMinutes": 45,
      "geo": { "lat": 43.8966, "lng": 12.3439 },
      "sectors": ["slug-settore", "…"],
      "services": ["slug-servizio", "…"],
      "nearby": ["slug-comune", "…"],
      "metaTitle": "max 60 caratteri, es. 'Agenzia marketing San Leo: siti, social e SEO | not4sale'",
      "metaDescription": "120–160 caratteri"
    }
  ]
}
```

Vincoli:
- `faq`: 4–5 domande **specifiche del comune** (es. "Lavorate anche con le aziende delle frazioni di …?", "Ha senso la SEO locale per un B&B a …?"). Non ripetere le stesse domande per tutti i comuni.
- `sectors`: 2–4 slug da `MAPPA-URL-LOCAL.md`, solo settori davvero presenti nel comune.
- `services`: 4–6 slug di servizi (da `content/MAPPA-URL.md`), scelti per quel territorio.
- `nearby`: 3–5 comuni confinanti o vicini, tra quelli in `MAPPA-URL-LOCAL.md` (anche di altre province o di altri gruppi).
- Link nel Markdown: 3–6, solo verso URL presenti in `content/MAPPA-URL.md` o `content/local/MAPPA-URL-LOCAL.md`.
- Totale pagina (answer + economy + challenges + body + faq): **almeno 900 parole**.

## Pagina settore — formato

File `content/local/settori/{batch}.json`:

```json
{
  "sectors": [
    {
      "slug": "nautica",
      "title": "Nautica",
      "headline": "Marketing per la nautica: cantieri, rimessaggi e noleggi",
      "short": "…",
      "answer": "40–60 parole.",
      "problem": "Markdown 150–250 parole: le sfide di marketing del settore. Niente H2.",
      "process": [{ "title": "…", "description": "…" }],
      "body": "Markdown 700–1000 parole, 4–6 sezioni ##. Deve includere una sezione sul settore nelle province di Rimini e Pesaro e Urbino (dove è concentrato, con link ai comuni), e quali servizi funzionano e perché.",
      "faq": [{ "question": "…", "answer": "…" }],
      "services": ["4–6 slug di servizi"],
      "locations": ["3–10 slug di comuni dove il settore è forte"],
      "caseStudies": [],
      "metaTitle": "…",
      "metaDescription": "…"
    }
  ]
}
```

Vincoli: `process` 4–5 passi; `faq` 5–6; totale pagina almeno 1.100 parole; casi studio solo se le leve coincidono davvero (vedi tabella nella guida principale).

## Servizio in città — formato

File `content/local/servizi-citta/{comune}.json`:

```json
{
  "location": "rimini",
  "items": [
    {
      "service": "google-ads",
      "headline": "Google Ads a Rimini: campagne per chi cerca adesso",
      "short": "…",
      "answer": "40–60 parole, servizio + città.",
      "body": "Markdown 500–800 parole, 3–4 sezioni ##. Il servizio applicato a QUELLA città: chi cerca cosa, stagionalità, concorrenza, settori locali, esempi di ricerche locali plausibili. Link alla pagina generale del servizio e alla pagina del comune.",
      "faq": [{ "question": "…", "answer": "…" }],
      "metaTitle": "…",
      "metaDescription": "…"
    }
  ]
}
```

Vincoli: `faq` 4–5; totale almeno 700 parole; la pagina generale del servizio è già lunga: qui non ripeterla, scrivi **solo ciò che cambia in quella città**. Le 6 pagine della stessa città non devono ripetersi tra loro.

## Validazione

`npx tsx content/local/validate-local.mts [file ...]` controlla struttura, lunghezze, slug, link e frasi duplicate. Correggi finché stampa "Tutto valido".
