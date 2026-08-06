import React from "react";
import { Link } from "react-router-dom";
import useLocale from "../hooks/useLocale";
import SEOHead from "../components/SEOHead";
import { COMPANY, companyFullAddress } from "../data/company";

const UPDATED = { it: "6 agosto 2026", en: "August 6, 2026" };

const buildContent = (locale, r) => {
  const holder = `${COMPANY.name}, ${companyFullAddress(locale)}${COMPANY.piva ? ` — P.IVA ${COMPANY.piva}` : ""}`;
  if (locale === "it") {
    return {
      title: "Privacy Policy",
      kicker: "Informativa ai sensi degli artt. 13-14 Reg. UE 2016/679 (GDPR)",
      updated: `Ultimo aggiornamento: ${UPDATED.it}`,
      sections: [
        {
          h: "1. Titolare del trattamento",
          ps: [
            `Il titolare del trattamento dei dati personali raccolti tramite il sito not4.sale è ${holder}.`,
            `Per qualsiasi richiesta relativa ai tuoi dati puoi scriverci a ${COMPANY.email}.`,
          ],
        },
        {
          h: "2. Quali dati trattiamo",
          ps: [
            "Dati forniti volontariamente. Quando compili il form contatti o il calcolatore di preventivo raccogliamo: nome, indirizzo email, eventuale azienda e telefono, servizio di interesse, budget indicativo, obiettivi, timeline, URL del sito web e il contenuto del messaggio.",
            "Chat con l'assistente AI. I messaggi che scrivi all'assistente “N4S · AI” vengono salvati insieme a un identificativo di sessione anonimo generato dal browser (non collegato alla tua identità, salvo che tu non ti identifichi nel testo dei messaggi).",
            "Mini-audit del sito. Se richiedi un preventivo indicando l'URL del tuo sito, acquisiamo uno screenshot pubblico della homepage per generare un'analisi automatica.",
            "Dati di navigazione. I sistemi informatici acquisiscono, nel corso del loro normale esercizio, alcuni dati la cui trasmissione è implicita nell'uso dei protocolli internet: indirizzi IP, orari di accesso, pagine visitate, user agent. Sono usati solo per finalità di sicurezza e statistiche aggregate.",
            "Cookie e strumenti simili. Vedi la Cookie Policy per il dettaglio delle categorie e le modalità di gestione del consenso.",
          ],
        },
        {
          h: "3. Finalità e basi giuridiche",
          ps: [
            "a) Rispondere alle richieste di contatto e preventivo — base giuridica: misure precontrattuali su richiesta dell'interessato (art. 6.1.b GDPR).",
            "b) Generare stime, mini-audit e email di follow-up relative alla tua richiesta — base giuridica: misure precontrattuali (art. 6.1.b) e legittimo interesse a dare seguito a una richiesta commerciale ricevuta (art. 6.1.f).",
            "c) Far funzionare l'assistente AI e conservare la cronologia della conversazione nella tua sessione — base giuridica: esecuzione del servizio richiesto (art. 6.1.b).",
            "d) Sicurezza del sito e prevenzione di abusi — base giuridica: legittimo interesse (art. 6.1.f).",
            "e) Statistiche di utilizzo e misurazione delle campagne tramite cookie analitici e di marketing — base giuridica: consenso (art. 6.1.a), revocabile in ogni momento dal pannello “Preferenze cookie”.",
          ],
        },
        {
          h: "4. Trattamenti tramite intelligenza artificiale",
          ps: [
            "Le risposte dell'assistente, le stime del calcolatore di preventivo e i mini-audit sono generati da modelli linguistici di terze parti a cui inviamo il testo dei tuoi messaggi (e, per gli audit, lo screenshot pubblico del sito indicato). Il fornitore attuale è OpenRouter Inc. (USA), che instrada le richieste verso il modello selezionato.",
            "Ti invitiamo a non inserire nella chat dati personali non necessari, in particolare categorie particolari di dati (salute, opinioni, ecc.).",
            "Nessuna decisione produttiva di effetti giuridici viene presa in modo esclusivamente automatizzato: stime e analisi hanno valore puramente indicativo e commerciale.",
          ],
        },
        {
          h: "5. Destinatari e responsabili del trattamento",
          ps: [
            "I dati sono trattati da fornitori che agiscono come responsabili ex art. 28 GDPR o autonomi titolari, limitatamente ai rispettivi servizi:",
            "• Vercel Inc. (USA) — hosting del sito e delle API;",
            "• MongoDB Inc. / MongoDB Atlas (cloud) — database;",
            "• OpenRouter Inc. (USA) — elaborazione AI dei messaggi;",
            "• Resend (Plus Five Five, Inc., USA) — invio email transazionali;",
            "• Google Ireland Ltd — Google Tag Manager, Google Analytics 4 e servizi pubblicitari, solo previo consenso;",
            "• Cloudflare Inc. (USA) — DNS e sicurezza di rete.",
            "I dati non vengono venduti né ceduti a terzi per finalità loro proprie.",
          ],
        },
        {
          h: "6. Trasferimenti extra-UE",
          ps: [
            "Alcuni fornitori hanno sede negli Stati Uniti. I trasferimenti avvengono sulla base del EU-U.S. Data Privacy Framework, ove il fornitore vi aderisca, o delle Clausole Contrattuali Standard approvate dalla Commissione Europea (art. 46 GDPR), con misure supplementari ove necessarie.",
          ],
        },
        {
          h: "7. Tempi di conservazione",
          ps: [
            "• Richieste di contatto e preventivo: fino a 24 mesi dall'ultimo contatto, salvo instaurazione di un rapporto contrattuale.",
            "• Cronologia chat AI: collegata alla sessione del browser; puoi eliminarla cancellando i dati di navigazione. Lato server viene rimossa periodicamente.",
            "• Log tecnici: massimo 12 mesi.",
            "• Cookie: secondo le durate indicate nella Cookie Policy; il consenso viene comunque richiesto nuovamente dopo 6 mesi.",
          ],
        },
        {
          h: "8. I tuoi diritti",
          ps: [
            "Ai sensi degli artt. 15-22 GDPR hai diritto di ottenere: accesso ai tuoi dati, rettifica, cancellazione, limitazione del trattamento, portabilità, opposizione al trattamento basato su legittimo interesse e revoca del consenso in qualsiasi momento (senza pregiudicare la liceità del trattamento precedente).",
            `Puoi esercitare i diritti scrivendo a ${COMPANY.email}. Rispondiamo entro 30 giorni.`,
            "Se ritieni che il trattamento violi la normativa, puoi proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it) o all'autorità di controllo del tuo Paese UE.",
          ],
        },
        {
          h: "9. Minori",
          ps: [
            "Il sito e i servizi sono destinati a professionisti e imprese e non sono rivolti a minori di 18 anni. Non raccogliamo consapevolmente dati di minori.",
          ],
        },
        {
          h: "10. Modifiche a questa informativa",
          ps: [
            "Potremmo aggiornare questa informativa per riflettere cambiamenti normativi o dei servizi. La versione pubblicata su questa pagina, con la data in alto, è quella vigente.",
          ],
        },
      ],
      cookieLink: { pre: "Per i cookie consulta la ", label: "Cookie Policy", post: "." },
    };
  }
  return {
    title: "Privacy Policy",
    kicker: "Notice under articles 13-14 of EU Reg. 2016/679 (GDPR)",
    updated: `Last updated: ${UPDATED.en}`,
    sections: [
      {
        h: "1. Data controller",
        ps: [
          `The controller of personal data collected through not4.sale is ${holder}.`,
          `For any request about your data, write to ${COMPANY.email}.`,
        ],
      },
      {
        h: "2. What data we process",
        ps: [
          "Data you provide. When you fill in the contact form or the quote calculator we collect: name, email, company and phone (optional), service of interest, indicative budget, goals, timeline, website URL and the content of your message.",
          "AI assistant chat. Messages you write to “N4S · AI” are stored together with an anonymous session identifier generated by your browser (not linked to your identity, unless you identify yourself in the messages).",
          "Website mini-audit. If you request a quote and provide your website URL, we capture a public screenshot of its homepage to generate an automated analysis.",
          "Browsing data. IT systems acquire, during normal operation, data implicit in internet protocols: IP addresses, access times, pages visited, user agent. Used only for security and aggregate statistics.",
          "Cookies and similar tools. See the Cookie Policy for categories and consent management.",
        ],
      },
      {
        h: "3. Purposes and legal bases",
        ps: [
          "a) Answering contact and quote requests — legal basis: pre-contractual measures at your request (art. 6.1.b GDPR).",
          "b) Generating estimates, mini-audits and follow-up emails related to your request — legal basis: pre-contractual measures (art. 6.1.b) and legitimate interest in following up a received business request (art. 6.1.f).",
          "c) Operating the AI assistant and keeping the conversation history in your session — legal basis: performance of the requested service (art. 6.1.b).",
          "d) Site security and abuse prevention — legal basis: legitimate interest (art. 6.1.f).",
          "e) Usage statistics and campaign measurement via analytics and marketing cookies — legal basis: consent (art. 6.1.a), revocable anytime via “Cookie preferences”.",
        ],
      },
      {
        h: "4. AI-based processing",
        ps: [
          "Assistant replies, quote estimates and mini-audits are generated by third-party language models to which we send your message text (and, for audits, the public screenshot of the website you provide). The current provider is OpenRouter Inc. (USA), routing requests to the selected model.",
          "Please avoid sharing unnecessary personal data in the chat, in particular special categories of data (health, opinions, etc.).",
          "No decision producing legal effects is taken in a solely automated way: estimates and analyses are purely indicative and commercial.",
        ],
      },
      {
        h: "5. Recipients and processors",
        ps: [
          "Data is processed by providers acting as processors under art. 28 GDPR or independent controllers, strictly for their services:",
          "• Vercel Inc. (USA) — site and API hosting;",
          "• MongoDB Inc. / MongoDB Atlas (cloud) — database;",
          "• OpenRouter Inc. (USA) — AI processing of messages;",
          "• Resend (Plus Five Five, Inc., USA) — transactional email delivery;",
          "• Google Ireland Ltd — Google Tag Manager, Google Analytics 4 and advertising services, only upon consent;",
          "• Cloudflare Inc. (USA) — DNS and network security.",
          "Data is never sold or shared with third parties for their own purposes.",
        ],
      },
      {
        h: "6. Transfers outside the EU",
        ps: [
          "Some providers are based in the United States. Transfers rely on the EU-U.S. Data Privacy Framework, where the provider adheres to it, or on Standard Contractual Clauses approved by the European Commission (art. 46 GDPR), with supplementary measures where needed.",
        ],
      },
      {
        h: "7. Retention",
        ps: [
          "• Contact and quote requests: up to 24 months from the last contact, unless a contract follows.",
          "• AI chat history: tied to your browser session; you can delete it by clearing browsing data. Server-side it is periodically removed.",
          "• Technical logs: up to 12 months.",
          "• Cookies: per the durations in the Cookie Policy; consent is re-requested after 6 months in any case.",
        ],
      },
      {
        h: "8. Your rights",
        ps: [
          "Under articles 15-22 GDPR you have the right to: access your data, rectification, erasure, restriction of processing, portability, objection to processing based on legitimate interest, and withdrawal of consent at any time (without affecting prior lawful processing).",
          `Exercise your rights by writing to ${COMPANY.email}. We reply within 30 days.`,
          "If you believe the processing infringes the law, you can lodge a complaint with the Italian Garante (www.garanteprivacy.it) or your EU supervisory authority.",
        ],
      },
      {
        h: "9. Minors",
        ps: [
          "The site and services target professionals and businesses and are not directed at anyone under 18. We do not knowingly collect data from minors.",
        ],
      },
      {
        h: "10. Changes to this notice",
        ps: [
          "We may update this notice to reflect regulatory or service changes. The version published on this page, with the date above, is the one in force.",
        ],
      },
    ],
    cookieLink: { pre: "For cookies, see the ", label: "Cookie Policy", post: "." },
  };
};

export const PrivacyPolicyPage = () => {
  const { locale, r } = useLocale();
  const c = buildContent(locale, r);

  return (
    <div className="pt-32 pb-24">
      <SEOHead
        title={c.title}
        description={locale === "it" ? "Informativa privacy di NOT4SALE Srl: quali dati trattiamo, perché, per quanto tempo e quali sono i tuoi diritti." : "NOT4SALE Srl privacy notice: what data we process, why, for how long, and your rights."}
        path={r.privacy}
        locale={locale}
        alternatePath={locale === "it" ? "/en/privacy-policy" : "/privacy-policy"}
      />
      <div className="max-w-[900px] mx-auto px-5 md:px-10">
        <p className="text-xs font-mono uppercase tracking-[0.28em] text-violet-400 mb-4">{c.kicker}</p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tight mb-3">{c.title}</h1>
        <p className="text-sm font-mono text-neutral-500 mb-14">{c.updated}</p>

        {c.sections.map((s) => (
          <section key={s.h} className="mb-10">
            <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight mb-4 text-white">{s.h}</h2>
            {s.ps.map((p, i) => (
              <p key={i} className="text-neutral-300 leading-relaxed mb-3 text-[15px]">{p}</p>
            ))}
          </section>
        ))}

        <p className="text-neutral-400 text-[15px] mt-12 border-t border-white/10 pt-8">
          {c.cookieLink.pre}
          <Link to={r.cookiePolicy} className="text-violet-400 underline hover:text-violet-300">{c.cookieLink.label}</Link>
          {c.cookieLink.post}
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
