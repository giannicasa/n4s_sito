import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useLocale from "../hooks/useLocale";
import {
  CONSENT_EVENT,
  defaultPrefs,
  initConsent,
  readConsent,
  saveConsent,
} from "../lib/consent";

const TEXT = {
  it: {
    title: "Cookie e privacy",
    body:
      "Usiamo cookie tecnici necessari al funzionamento del sito e, solo con il tuo consenso, cookie analitici e di marketing. Puoi accettare tutto, rifiutare tutto o scegliere le singole categorie. Puoi cambiare idea in ogni momento da “Preferenze cookie” nel footer.",
    acceptAll: "Accetta tutti",
    rejectAll: "Rifiuta tutti",
    customize: "Personalizza",
    save: "Salva preferenze",
    back: "Indietro",
    policy: "Cookie Policy",
    privacy: "Privacy Policy",
    categories: {
      necessary: {
        name: "Necessari",
        desc: "Indispensabili per il funzionamento del sito: salvataggio delle preferenze cookie e della sessione della chat. Non richiedono consenso.",
        always: "Sempre attivi",
      },
      analytics: {
        name: "Analitici",
        desc: "Ci aiutano a capire come viene usato il sito (Google Analytics 4 via Google Tag Manager), con statistiche aggregate su pagine visitate e interazioni.",
      },
      marketing: {
        name: "Marketing",
        desc: "Usati per misurare le campagne pubblicitarie e mostrare annunci pertinenti su piattaforme terze (es. Google Ads).",
      },
    },
  },
  en: {
    title: "Cookies & privacy",
    body:
      "We use technical cookies required for the site to work and, only with your consent, analytics and marketing cookies. You can accept all, reject all, or pick individual categories. You can change your mind anytime via “Cookie preferences” in the footer.",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    customize: "Customize",
    save: "Save preferences",
    back: "Back",
    policy: "Cookie Policy",
    privacy: "Privacy Policy",
    categories: {
      necessary: {
        name: "Necessary",
        desc: "Essential for the site to work: cookie preference storage and chat session. No consent required.",
        always: "Always on",
      },
      analytics: {
        name: "Analytics",
        desc: "Help us understand how the site is used (Google Analytics 4 via Google Tag Manager), with aggregate stats on pages and interactions.",
      },
      marketing: {
        name: "Marketing",
        desc: "Used to measure ad campaigns and show relevant ads on third-party platforms (e.g. Google Ads).",
      },
    },
  },
};

const Toggle = ({ checked, disabled, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange && onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
      checked ? "bg-violet-500" : "bg-neutral-700"
    } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
        checked ? "translate-x-[22px]" : "translate-x-0.5"
      }`}
      style={{ left: 0 }}
    />
  </button>
);

export const CookieBanner = () => {
  const { locale, r } = useLocale();
  const tx = TEXT[locale];
  const [visible, setVisible] = useState(false);
  const [panel, setPanel] = useState(false);
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    const existing = initConsent();
    if (!existing) setVisible(true);
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setPrefs(readConsent() || defaultPrefs);
      setPanel(true);
      setVisible(true);
    };
    window.addEventListener(CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_EVENT, onOpen);
  }, []);

  const close = () => {
    setVisible(false);
    setPanel(false);
  };

  const acceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    close();
  };
  const rejectAll = () => {
    saveConsent({ analytics: false, marketing: false });
    close();
  };
  const savePrefs = () => {
    saveConsent(prefs);
    close();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25, ease: [0.2, 0.6, 0.2, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-[480px] z-[9800] glass-strong border border-violet-500/30 rounded-sm"
          role="dialog"
          aria-modal="false"
          aria-label={tx.title}
          data-testid="cookie-banner"
        >
          <div className="p-6">
            <p className="text-xs font-mono uppercase tracking-[0.28em] text-violet-400 mb-3">
              {tx.title}
            </p>

            {!panel ? (
              <>
                <p className="text-sm text-neutral-300 leading-relaxed mb-3">{tx.body}</p>
                <p className="text-xs text-neutral-500 mb-5">
                  <Link to={r.cookiePolicy} className="underline hover:text-violet-400" data-testid="cookie-banner-policy-link">
                    {tx.policy}
                  </Link>
                  {" · "}
                  <Link to={r.privacy} className="underline hover:text-violet-400">
                    {tx.privacy}
                  </Link>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={acceptAll}
                    data-testid="cookie-accept-all"
                    className="px-4 py-2.5 bg-violet-500 hover:bg-violet-400 text-white text-xs font-mono uppercase tracking-[0.18em] transition-colors"
                  >
                    {tx.acceptAll}
                  </button>
                  <button
                    type="button"
                    onClick={rejectAll}
                    data-testid="cookie-reject-all"
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-[0.18em] transition-colors"
                  >
                    {tx.rejectAll}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanel(true)}
                    data-testid="cookie-customize"
                    className="px-4 py-2.5 border border-white/20 hover:border-violet-400 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-[0.18em] transition-colors"
                  >
                    {tx.customize}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-5 max-h-[45vh] overflow-y-auto pr-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">{tx.categories.necessary.name}</p>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-1">{tx.categories.necessary.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Toggle checked disabled label={tx.categories.necessary.name} />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                        {tx.categories.necessary.always}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-sm font-bold text-white">{tx.categories.analytics.name}</p>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-1">{tx.categories.analytics.desc}</p>
                    </div>
                    <Toggle
                      checked={prefs.analytics}
                      onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
                      label={tx.categories.analytics.name}
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-sm font-bold text-white">{tx.categories.marketing.name}</p>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-1">{tx.categories.marketing.desc}</p>
                    </div>
                    <Toggle
                      checked={prefs.marketing}
                      onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
                      label={tx.categories.marketing.name}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={savePrefs}
                    data-testid="cookie-save-prefs"
                    className="px-4 py-2.5 bg-violet-500 hover:bg-violet-400 text-white text-xs font-mono uppercase tracking-[0.18em] transition-colors"
                  >
                    {tx.save}
                  </button>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-[0.18em] transition-colors"
                  >
                    {tx.acceptAll}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanel(false)}
                    className="px-4 py-2.5 border border-white/20 hover:border-violet-400 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-[0.18em] transition-colors"
                  >
                    {tx.back}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
