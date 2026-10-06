# Analisi delle ricerche — ottobre 2026

## Metodo

Senza dati di Search Console né accesso a Keyword Planner, la domanda è stata misurata con i **suggerimenti di ricerca di Google** (autocomplete, `hl=it`, `gl=it`). Google suggerisce una ricerca solo se un numero sufficiente di persone la fa davvero: è un segnale di esistenza della domanda, non un volume mensile.

- **Servizio × comune:** 34 parole chiave × 77 comuni. Prima i 24 centri principali; nei comuni piccoli una parola chiave è stata testata solo se aveva domanda in almeno 6 centri principali. Le combinazioni testate sono 1.732.
- **Servizio × settore:** 15 formulazioni ("siti web per", "social media manager per", "marketing per"…) × 14 settori. Le ricerche testate sono 330.
- **Pulizia:** il comune deve comparire come parola intera ("Cagli" non vale per "Cagliari"). Sono scartate le ricerche non commerciali, cioè lavoro, corsi, recensioni, festival e i loghi di comuni e squadre.

Script e dati grezzi sono in `content/local/analisi/`. Per ripetere l'analisi: `python3 run.py` e `python3 sectors.py`.

## Risultati: servizio × comune

La domanda locale è concentrata nei centri maggiori.

| Ricerca | Comuni con domanda confermata |
|---|---|
| agenzia marketing / comunicazione / pubblicitaria | Rimini, Pesaro, Fano, Riccione, Cattolica, Urbino, Urbania |
| realizzazione siti web / web agency / web designer | Rimini, Pesaro, Riccione, Fano, Cattolica, Misano Adriatico |
| social media manager / gestione social | Rimini, Riccione, Pesaro, Fano, Cattolica |
| grafico / studio grafico | Rimini, Riccione, Cattolica, Pesaro, Fano |
| video maker | Rimini, Pesaro, Fano, Riccione |
| agenzia / consulente SEO | Pesaro |
| google ads, copywriter | Rimini |

Le 48 pagine servizio × città già pubblicate coprivano quasi tutta questa domanda. Sono state aggiunte le combinazioni mancanti: video maker a Rimini, Pesaro, Fano e Riccione, copywriter a Rimini e siti web a Misano Adriatico.

## Risultati: servizio × settore

La domanda per settore è nazionale e più ampia di quella per comune. Le ricerche confermate:

- **Hotel:** marketing, siti web, social media manager, SEO, Google Ads
- **Studi professionali:** marketing per avvocati, siti web per avvocati, logo per commercialisti, SEO, Google Ads
- **Sanità privata:** marketing e siti web per dentisti, SEO per studi medici, logo per studio dentistico
- **Ristorazione:** marketing, siti web, SEO, Google Ads, social, logo per ristoranti
- **Wellness:** social media manager per centri estetici, marketing per palestre, logo per palestre e spa
- **Immobiliare:** siti web, marketing e logo per agenzie immobiliari, social media manager immobiliare
- **Moda:** logo per abbigliamento, social media manager abbigliamento, sito per vendere abbigliamento
- **Edilizia:** logo per imprese edili, siti web imprese edili
- **Agroalimentare:** siti web e logo per aziende agricole

Per queste combinazioni sono state create 31 pagine `/settori/{settore}/{servizio}`.

## Prossima revisione

Tra 2–3 mesi, con i dati di Search Console (query con impressioni), conviene ripetere l'analisi. Poi rafforzare le pagine che compaiono senza click e aggiungere le combinazioni nuove che emergono.
