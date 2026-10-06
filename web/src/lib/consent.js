// Gestione del consenso cookie — GDPR + Linee guida Garante.
// Blocco preventivo: GTM viene caricato SOLO dopo un consenso esplicito
// ad almeno una categoria non necessaria. Google Consent Mode v2.

const STORAGE_KEY = "n4s_cookie_consent_v1";
const GTM_ID = "GTM-KQSFH6TG";
const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 180; // 6 mesi: poi si richiede di nuovo

export const CONSENT_EVENT = "n4s:cookie-preferences";

export const defaultPrefs = { necessary: true, analytics: false, marketing: false };

export function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.prefs || !data.ts) return null;
    if (Date.now() - data.ts > CONSENT_MAX_AGE_MS) return null; // scaduto
    return data.prefs;
  } catch {
    return null;
  }
}

export function saveConsent(prefs) {
  const merged = { ...defaultPrefs, ...prefs, necessary: true };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, ts: Date.now(), prefs: merged }));
  } catch {
    /* storage pieno o bloccato: il banner ricomparirà */
  }
  applyConsent(merged);
  return merged;
}

function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

// Aggiorna i segnali Consent Mode v2 e carica GTM se serve.
export function applyConsent(prefs) {
  gtag("consent", "update", {
    analytics_storage: prefs.analytics ? "granted" : "denied",
    ad_storage: prefs.marketing ? "granted" : "denied",
    ad_user_data: prefs.marketing ? "granted" : "denied",
    ad_personalization: prefs.marketing ? "granted" : "denied",
  });
  if (prefs.analytics || prefs.marketing) loadGtm();
}

let gtmLoaded = false;
function loadGtm() {
  if (gtmLoaded || document.getElementById("n4s-gtm")) return;
  gtmLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.id = "n4s-gtm";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

// Da chiamare all'avvio dell'app: riapplica un consenso già espresso.
export function initConsent() {
  const prefs = readConsent();
  if (prefs) applyConsent(prefs);
  return prefs;
}

// Apre il pannello preferenze da qualsiasi punto del sito (es. footer).
export function openPreferences() {
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}
