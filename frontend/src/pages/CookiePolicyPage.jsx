import React from "react";
import { Link } from "react-router-dom";
import useLocale from "../hooks/useLocale";
import SEOHead from "../components/SEOHead";
import { COMPANY, companyFullAddress } from "../data/company";
import { openPreferences } from "../lib/consent";

const UPDATED = { it: "6 agosto 2026", en: "August 6, 2026" };

const CONTENT = {
  it: {
    title: "Cookie Policy",
    kicker: "Informativa estesa sui cookie · Linee guida Garante Privacy",
    updatedLabel: `Ultimo aggiornamento: ${UPDATED.it}`,
    intro: [
      "Questa informativa descrive i cookie e gli strumenti simili (localStorage, pixel, tag) usati dal sito not4.sale, gestito da NOT4SALE Srl, e come puoi controllarli.",
      "Un cookie è un piccolo file di testo che il sito invia al tuo dispositivo, dove viene memorizzato per essere ritrasmesso alle visite successive. Strumenti come il localStorage del browser svolgono funzioni simili senza trasmissione automatica.",
    ],
    manageTitle: "Gestisci le tue preferenze",
    manageText:
      "Alla prima visita ti chiediamo il consenso tramite banner: puoi accettare tutto, rifiutare tutto o scegliere le singole categorie. I cookie non necessari NON vengono installati prima del consenso (blocco preventivo). Puoi modificare o revocare la scelta in qualsiasi momento:",
    manageButton: "Apri preferenze cookie",
    consentNote:
      "La scelta viene memorizzata per 6 mesi, dopodiché il banner viene riproposto. La revoca del consenso blocca i tag e i cookie delle categorie disattivate dalla visita successiva; puoi comunque eliminare i cookie già installati dalle impostazioni del browser.",
    categoriesTitle: "Categorie utilizzate",
    tableHead: { name: "Nome", provider: "Fornitore", purpose: "Finalità", duration: "Durata" },
    categories: [
      {
        h: "1. Strettamente necessari (senza consenso)",
        desc: "Indispensabili al funzionamento del sito. Base giuridica: legittimo interesse; non richiedono consenso ai sensi dell'art. 122 Codice Privacy.",
        rows: [
          ["n4s_cookie_consent_v1 (localStorage)", "not4.sale", "Memorizza le tue preferenze sui cookie", "6 mesi"],
          ["n4s_chat_sid (localStorage)", "not4.sale", "Identificativo anonimo della sessione della chat AI, per ritrovare la tua conversazione", "Fino a cancellazione dati browser"],
        ],
      },
      {
        h: "2. Analitici (solo con consenso)",
        desc: "Statistiche d'uso del sito tramite Google Analytics 4, caricato via Google Tag Manager solo dopo il tuo consenso, con Google Consent Mode v2 attivo.",
        rows: [
          ["_ga", "Google", "Distingue gli utenti per le statistiche", "2 anni"],
          ["_ga_*", "Google", "Mantiene lo stato della sessione di misurazione", "2 anni"],
        ],
      },
      {
        h: "3. Marketing (solo con consenso)",
        desc: "Misurazione delle campagne e annunci pertinenti su piattaforme terze (es. Google Ads). Attivi solo se acconsenti alla categoria Marketing.",
        rows: [
          ["_gcl_au e simili", "Google", "Attribuzione delle conversioni pubblicitarie", "3 mesi"],
        ],
      },
    ],
    thirdTitle: "Cookie di terze parti",
    thirdText:
      "Per i cookie installati da terze parti, il trattamento è descritto nelle rispettive informative: Google (policies.google.com/privacy e policies.google.com/technologies/cookies). NOT4SALE Srl non controlla direttamente tali cookie.",
    browserTitle: "Gestione dal browser",
    browserText:
      "Puoi bloccare o eliminare i cookie anche dalle impostazioni del browser (Chrome, Safari, Firefox, Edge). La disattivazione dei cookie tecnici può compromettere alcune funzioni del sito, come la chat.",
    holderTitle: "Titolare",
    outro: "Per ogni dettaglio sul trattamento dei dati personali consulta la ",
    privacyLabel: "Privacy Policy",
  },
  en: {
    title: "Cookie Policy",
    kicker: "Extended cookie notice · Italian DPA guidelines",
    updatedLabel: `Last updated: ${UPDATED.en}`,
    intro: [
      "This notice describes the cookies and similar tools (localStorage, pixels, tags) used by not4.sale, operated by NOT4SALE Srl, and how you can control them.",
      "A cookie is a small text file the site sends to your device, where it is stored and sent back on subsequent visits. Tools like browser localStorage perform similar functions without automatic transmission.",
    ],
    manageTitle: "Manage your preferences",
    manageText:
      "On your first visit we ask for consent via a banner: accept all, reject all, or pick individual categories. Non-necessary cookies are NOT installed before consent (preventive blocking). You can change or withdraw your choice at any time:",
    manageButton: "Open cookie preferences",
    consentNote:
      "Your choice is stored for 6 months, after which the banner is shown again. Withdrawing consent blocks tags and cookies of the disabled categories from the next visit; you can also delete already-installed cookies from your browser settings.",
    categoriesTitle: "Categories used",
    tableHead: { name: "Name", provider: "Provider", purpose: "Purpose", duration: "Duration" },
    categories: [
      {
        h: "1. Strictly necessary (no consent required)",
        desc: "Essential for the site to work. Legal basis: legitimate interest; exempt from consent under art. 122 of the Italian Privacy Code.",
        rows: [
          ["n4s_cookie_consent_v1 (localStorage)", "not4.sale", "Stores your cookie preferences", "6 months"],
          ["n4s_chat_sid (localStorage)", "not4.sale", "Anonymous AI chat session identifier, to restore your conversation", "Until browser data is cleared"],
        ],
      },
      {
        h: "2. Analytics (consent only)",
        desc: "Site usage statistics via Google Analytics 4, loaded through Google Tag Manager only after your consent, with Google Consent Mode v2 enabled.",
        rows: [
          ["_ga", "Google", "Distinguishes users for statistics", "2 years"],
          ["_ga_*", "Google", "Maintains measurement session state", "2 years"],
        ],
      },
      {
        h: "3. Marketing (consent only)",
        desc: "Campaign measurement and relevant ads on third-party platforms (e.g. Google Ads). Active only if you consent to the Marketing category.",
        rows: [["_gcl_au and similar", "Google", "Ad conversion attribution", "3 months"]],
      },
    ],
    thirdTitle: "Third-party cookies",
    thirdText:
      "For cookies set by third parties, processing is described in their notices: Google (policies.google.com/privacy and policies.google.com/technologies/cookies). NOT4SALE Srl does not directly control those cookies.",
    browserTitle: "Browser controls",
    browserText:
      "You can also block or delete cookies from your browser settings (Chrome, Safari, Firefox, Edge). Disabling technical cookies may break some site features, such as the chat.",
    holderTitle: "Controller",
    outro: "For full details on personal data processing, see the ",
    privacyLabel: "Privacy Policy",
  },
};

export const CookiePolicyPage = () => {
  const { locale, r } = useLocale();
  const c = CONTENT[locale];
  const holder = `${COMPANY.name}, ${companyFullAddress(locale)}${COMPANY.piva ? ` — P.IVA ${COMPANY.piva}` : ""} — ${COMPANY.email}`;

  return (
    <div className="pt-32 pb-24">
      <SEOHead
        title={c.title}
        description={locale === "it" ? "Quali cookie usa not4.sale, a cosa servono e come gestire o revocare il consenso." : "Which cookies not4.sale uses, what they are for, and how to manage or withdraw consent."}
        path={r.cookiePolicy}
        locale={locale}
        alternatePath={locale === "it" ? "/en/cookie-policy" : "/cookie-policy"}
      />
      <div className="max-w-[900px] mx-auto px-5 md:px-10">
        <p className="text-xs font-mono uppercase tracking-[0.28em] text-violet-400 mb-4">{c.kicker}</p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tight mb-3">{c.title}</h1>
        <p className="text-sm font-mono text-neutral-500 mb-14">{c.updatedLabel}</p>

        {c.intro.map((p, i) => (
          <p key={i} className="text-neutral-300 leading-relaxed mb-3 text-[15px]">{p}</p>
        ))}

        <section className="my-12 border border-violet-500/30 bg-violet-500/5 p-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-3">{c.manageTitle}</h2>
          <p className="text-neutral-300 leading-relaxed text-[15px] mb-5">{c.manageText}</p>
          <button
            type="button"
            onClick={openPreferences}
            data-testid="cookie-policy-open-prefs"
            className="px-5 py-3 bg-violet-500 hover:bg-violet-400 text-white text-xs font-mono uppercase tracking-[0.18em] transition-colors"
          >
            {c.manageButton}
          </button>
          <p className="text-neutral-500 text-xs leading-relaxed mt-5">{c.consentNote}</p>
        </section>

        <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-6">{c.categoriesTitle}</h2>
        {c.categories.map((cat) => (
          <section key={cat.h} className="mb-10">
            <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-2 text-white">{cat.h}</h3>
            <p className="text-neutral-400 leading-relaxed text-[15px] mb-4">{cat.desc}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border border-white/10">
                <thead>
                  <tr className="bg-white/5 text-xs font-mono uppercase tracking-wider text-neutral-400">
                    <th className="px-4 py-3 font-medium">{c.tableHead.name}</th>
                    <th className="px-4 py-3 font-medium">{c.tableHead.provider}</th>
                    <th className="px-4 py-3 font-medium">{c.tableHead.purpose}</th>
                    <th className="px-4 py-3 font-medium">{c.tableHead.duration}</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.rows.map((row) => (
                    <tr key={row[0]} className="border-t border-white/10 text-neutral-300 align-top">
                      {row.map((cell, i) => (
                        <td key={i} className="px-4 py-3">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <section className="mb-10">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-3">{c.thirdTitle}</h2>
          <p className="text-neutral-300 leading-relaxed text-[15px]">{c.thirdText}</p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-3">{c.browserTitle}</h2>
          <p className="text-neutral-300 leading-relaxed text-[15px]">{c.browserText}</p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-3">{c.holderTitle}</h2>
          <p className="text-neutral-300 leading-relaxed text-[15px]">{holder}</p>
        </section>

        <p className="text-neutral-400 text-[15px] mt-12 border-t border-white/10 pt-8">
          {c.outro}
          <Link to={r.privacy} className="text-violet-400 underline hover:text-violet-300">{c.privacyLabel}</Link>.
        </p>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
