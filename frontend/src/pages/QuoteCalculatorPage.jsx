import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowLeft, ArrowRight, Loader2, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

import SEOHead from "../components/SEOHead";
import { Reveal, RevealLines } from "../components/Reveal";
import { SERVICES } from "../data/services";
import useLocale from "../hooks/useLocale";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuoteCalculatorPage = () => {
  const { t, r, locale } = useLocale();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    objective: "",
    services: [],
    budget: "",
    timeline: "",
    name: "",
    email: "",
    company: "",
    website_url: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleService = (label) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(label)
        ? f.services.filter((s) => s !== label)
        : [...f.services, label]
    }));

  const canAdvance = () => {
    if (step === 0) return !!form.objective;
    if (step === 1) return form.services.length > 0;
    if (step === 2) return !!form.budget && !!form.timeline;
    if (step === 3) return !!form.name && !!form.email;
    return false;
  };

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/quote/estimate`, { ...form, locale });
      setResult(res.data);
    } catch (e) {
      toast.error(locale === "en" ? "Estimate failed. Try again." : "Errore. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const altPath = locale === "it" ? "/en/quote" : "/preventivo";

  return (
    <>
      <SEOHead
        title={locale === "en" ? "Quote calculator" : "Calcolatore preventivo"}
        description={t.quote.body}
        path={r.quote}
        ogKicker={t.nav.quote}
        ogTitle={t.quote.headlineLines.join(" ")}
        locale={locale}
        alternatePath={altPath}
      />

      <section className="relative pt-40 pb-12 md:pt-56 md:pb-16 grain">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6 flex items-center gap-2">
            <Sparkles size={12} /> {t.quote.kicker}
          </Reveal>
          <h1 className="h-display text-white text-6xl sm:text-8xl md:text-[10vw]" data-testid="quote-headline">
            <RevealLines lines={[t.quote.headlineLines[0], <span key="2" className="text-violet-500">{t.quote.headlineLines[1]}</span>]} />
          </h1>
          <Reveal delay={0.3} className="mt-10 max-w-3xl text-lg md:text-xl text-neutral-300 leading-relaxed">
            {t.quote.body}
          </Reveal>
        </div>
      </section>

      <section className="pb-32 md:pb-48">
        <div className="max-w-[1100px] mx-auto px-5 md:px-10">
          {!result ? (
            <div className="border border-white/10 bg-ink/40 backdrop-blur-sm" data-testid="quote-wizard">
              {/* Stepper */}
              <div className="flex items-center justify-between gap-2 px-6 md:px-10 pt-6 md:pt-8 pb-4 border-b border-white/10">
                {t.quote.steps.map((label, i) => (
                  <div key={i} className="flex-1 flex items-center gap-2">
                    <div
                      className={`w-7 h-7 grid place-items-center text-[10px] font-mono font-bold ${
                        i < step
                          ? "bg-violet-500 text-white"
                          : i === step
                          ? "border border-violet-500 text-violet-400"
                          : "border border-white/15 text-neutral-500"
                      }`}
                      data-testid={`quote-step-${i}`}
                    >
                      {i < step ? <Check size={12} /> : i + 1}
                    </div>
                    <span className={`hidden sm:inline text-[10px] font-mono uppercase tracking-[0.24em] ${i === step ? "text-white" : "text-neutral-500"}`}>
                      {label}
                    </span>
                    {i < t.quote.steps.length - 1 && (
                      <span className={`flex-1 h-px ${i < step ? "bg-violet-500" : "bg-white/10"}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="px-6 md:px-10 py-10 md:py-14 min-h-[420px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25, ease: [0.2, 0.6, 0.2, 1] }}
                  >
                    {step === 0 && (
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-6">
                          {t.quote.labels.objective}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {t.quote.objectives.map((o) => (
                            <button
                              key={o}
                              type="button"
                              onClick={() => update("objective", o)}
                              data-testid={`quote-objective-${o}`}
                              className={`text-left p-4 md:p-5 border transition-colors font-display uppercase text-base md:text-lg tracking-tight ${
                                form.objective === o
                                  ? "border-violet-500 bg-violet-900/20 text-white"
                                  : "border-white/10 hover:border-violet-500/50 text-neutral-300"
                              }`}
                            >
                              {o}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-6">
                          {t.quote.labels.services}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SERVICES.map((s) => {
                            const lbl = s.title[locale].replace(/\s·\s.*/, "");
                            const sel = form.services.includes(lbl);
                            return (
                              <button
                                key={s.slug}
                                type="button"
                                onClick={() => toggleService(lbl)}
                                data-testid={`quote-service-${s.slug}`}
                                className={`text-left p-4 md:p-5 border transition-colors flex items-center justify-between ${
                                  sel
                                    ? "border-violet-500 bg-violet-900/20 text-white"
                                    : "border-white/10 hover:border-violet-500/50 text-neutral-300"
                                }`}
                              >
                                <span className="font-display uppercase text-base md:text-lg tracking-tight">{lbl}</span>
                                <span className={`w-5 h-5 grid place-items-center text-xs font-mono ${sel ? "bg-violet-500 text-white" : "border border-white/20"}`}>
                                  {sel ? "✓" : ""}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-10">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-6">
                            {t.quote.labels.budget}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {t.quote.budgets.map((b) => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => update("budget", b)}
                                data-testid={`quote-budget-${b}`}
                                className={`text-left p-4 border transition-colors font-display uppercase text-base tracking-tight ${
                                  form.budget === b
                                    ? "border-violet-500 bg-violet-900/20 text-white"
                                    : "border-white/10 hover:border-violet-500/50 text-neutral-300"
                                }`}
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-6">
                            {t.quote.labels.timeline}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {t.quote.timelines.map((tl) => (
                              <button
                                key={tl}
                                type="button"
                                onClick={() => update("timeline", tl)}
                                data-testid={`quote-timeline-${tl}`}
                                className={`text-left p-4 border transition-colors font-display uppercase text-base tracking-tight ${
                                  form.timeline === tl
                                    ? "border-violet-500 bg-violet-900/20 text-white"
                                    : "border-white/10 hover:border-violet-500/50 text-neutral-300"
                                }`}
                              >
                                {tl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6">
                        <label className="block text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-2">
                          {locale === "en" ? "Where do we reply?" : "Dove ti rispondiamo?"}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FieldQ label={t.quote.labels.name + " *"} value={form.name} onChange={(v) => update("name", v)} testId="quote-input-name" />
                          <FieldQ label={t.quote.labels.email + " *"} value={form.email} onChange={(v) => update("email", v)} type="email" testId="quote-input-email" />
                          <FieldQ label={t.quote.labels.company} value={form.company} onChange={(v) => update("company", v)} testId="quote-input-company" />
                          <FieldQ label={t.quote.labels.website} value={form.website_url} onChange={(v) => update("website_url", v)} placeholder="https://" testId="quote-input-website" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-3">
                            {t.quote.labels.notes}
                          </label>
                          <textarea
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                            rows={3}
                            data-testid="quote-input-notes"
                            className="w-full bg-transparent border-b border-white/15 focus:border-violet-500 outline-none text-white py-3 text-lg"
                          />
                        </div>
                        {form.website_url && (
                          <div className="border border-violet-500/30 bg-violet-900/10 p-4 flex items-start gap-3">
                            <Sparkles size={16} className="text-violet-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-neutral-200 leading-relaxed">
                              {locale === "en"
                                ? "Nice. After you submit, our AI agent will email you a mini-audit of your homepage within 60 seconds — 1 screenshot + 3 concrete observations."
                                : "Bene. Dopo l'invio, il nostro agente AI ti manderà via email entro 60 secondi un mini-audit della tua homepage — 1 screenshot + 3 osservazioni concrete."}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="px-6 md:px-10 py-5 border-t border-white/10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  data-testid="quote-prev"
                  className="inline-flex items-center gap-2 px-5 py-3 text-xs font-mono uppercase tracking-[0.24em] text-neutral-300 border border-white/10 hover:border-white/30 disabled:opacity-40"
                >
                  <ArrowLeft size={14} /> {t.quote.prev}
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canAdvance()}
                    data-testid="quote-next"
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-display font-bold uppercase tracking-[0.18em] bg-white text-black hover:bg-violet-500 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    {t.quote.next} <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={loading || !canAdvance()}
                    data-testid="quote-submit"
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-display font-bold uppercase tracking-[0.18em] bg-violet-500 text-white hover:bg-violet-400 disabled:opacity-40 transition-colors"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {loading ? t.quote.submitting : t.quote.submit}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-violet-500/40 p-8 md:p-12 bg-violet-900/10" data-testid="quote-result">
              <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-4 flex items-center gap-2">
                <Sparkles size={12} /> {t.quote.result.kicker}
              </div>
              <h2 className="font-display text-4xl md:text-7xl font-black uppercase leading-none tracking-tight text-white mb-3">
                {result.estimate_range}
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-12">
                {t.quote.result.rangeLabel}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-7">
                  <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-4">
                    {t.quote.result.approachLabel}
                  </div>
                  <p className="text-lg md:text-xl text-neutral-200 leading-relaxed mb-10">
                    {result.recommended_approach}
                  </p>

                  <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-4">
                    {t.quote.result.nextStepsLabel}
                  </div>
                  <ol className="space-y-3">
                    {result.next_steps.map((s, i) => (
                      <li key={i} className="flex gap-4 text-neutral-200">
                        <span className="font-mono text-violet-500 text-sm">0{i + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="md:col-span-5">
                  <div className="border border-white/10 p-6">
                    <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-3">
                      {t.quote.result.fitLabel}
                    </div>
                    <div className="font-display text-6xl font-black text-violet-500 leading-none mb-2">
                      {result.fit_score}<span className="text-2xl text-neutral-500">/100</span>
                    </div>
                    <p className="text-xs text-neutral-400 mb-6">{t.quote.result.fitHint}</p>
                    <div className="w-full h-1 bg-white/10">
                      <div className="h-full bg-violet-500" style={{ width: `${result.fit_score}%` }} />
                    </div>
                  </div>

                  <p className="mt-6 text-sm text-neutral-400">{t.quote.result.sentInfo}</p>

                  <Link
                    to={r.contact}
                    data-testid="quote-result-cta"
                    className="mt-6 inline-flex items-center gap-3 px-6 py-4 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-sm hover:bg-violet-500 hover:text-white transition-colors"
                  >
                    {t.quote.result.cta} <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>

              {result.audit_scheduled && (
                <div className="mt-12 border border-violet-500/40 bg-violet-900/10 p-6 md:p-8" data-testid="quote-audit-banner">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-sm bg-violet-500 grid place-items-center text-white animate-pulse-violet shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-2">
                        {t.quote.result.auditKicker}
                      </div>
                      <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-none mb-3">
                        {t.quote.result.auditTitle}
                      </h3>
                      <p className="text-neutral-300 leading-relaxed mb-2">{t.quote.result.auditBody}</p>
                      <p className="text-xs font-mono uppercase tracking-[0.2em] text-violet-400">{t.quote.result.auditPending}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

const FieldQ = ({ label, value, onChange, type = "text", testId, placeholder }) => (
  <div>
    <label className="block text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-3">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testId}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-white/15 focus:border-violet-500 outline-none text-white py-3 text-lg transition-colors placeholder-neutral-700"
    />
  </div>
);

export default QuoteCalculatorPage;
