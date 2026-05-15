import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowUpRight, Loader2 } from "lucide-react";
import useLocale from "../hooks/useLocale";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SERVICES_OPTIONS_IT = [
  "Growth Hacking", "SEO", "AEO", "GEO", "Brand Strategy",
  "Performance Marketing", "Social Media", "Content",
  "Web Design", "AI Marketing", "Non lo so ancora"
];
const SERVICES_OPTIONS_EN = [
  "Growth Hacking", "SEO", "AEO", "GEO", "Brand Strategy",
  "Performance Marketing", "Social Media", "Content",
  "Web Design", "AI Marketing", "Not sure yet"
];

const BUDGETS_IT = ["< 5k€", "5–15k€", "15–40k€", "40k€+", "Da definire"];
const BUDGETS_EN = ["< €5k", "€5–15k", "€15–40k", "€40k+", "To be defined"];

export const ContactForm = ({ defaultService }) => {
  const { t, locale } = useLocale();
  const labels = t.contact.formLabels;
  const services = locale === "en" ? SERVICES_OPTIONS_EN : SERVICES_OPTIONS_IT;
  const budgets = locale === "en" ? BUDGETS_EN : BUDGETS_IT;

  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "",
    service: defaultService || "", budget: "", message: ""
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!form.name || !form.email || !form.message) {
      toast.error(locale === "en" ? "Name, email and message are required." : "Nome, email e messaggio sono obbligatori.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, { ...form, source: "contact-form", locale });
      setDone(true);
      toast.success(locale === "en" ? "Request sent. We'll reply within 24h." : "Richiesta inviata. Ti rispondiamo entro 24h.");
    } catch (err) {
      toast.error(locale === "en" ? "Something went wrong. Try again or write to hello@not4.sale." : "Qualcosa è andato storto. Riprova o scrivi a hello@not4.sale.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="border border-violet-500/40 p-8 md:p-12 bg-violet-900/10" data-testid="contact-form-success">
        <p className="text-xs font-mono uppercase tracking-[0.28em] text-violet-400 mb-4">
          {t.contact.successKicker}
        </p>
        <h3 className="font-display text-4xl md:text-5xl font-black uppercase leading-none mb-6">
          {t.contact.successTitle} <span className="text-violet-500">{form.name.split(" ")[0]}</span>.
        </h3>
        <p className="text-neutral-300 text-lg max-w-xl">{t.contact.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8" data-testid="contact-form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Field label={labels.name + " *"} name="name" value={form.name} onChange={onChange} required testId="contact-input-name" />
        <Field label={labels.email + " *"} name="email" type="email" value={form.email} onChange={onChange} required testId="contact-input-email" />
        <Field label={labels.company} name="company" value={form.company} onChange={onChange} testId="contact-input-company" />
        <Field label={labels.phone} name="phone" value={form.phone} onChange={onChange} testId="contact-input-phone" />
        <SelectField label={labels.service} name="service" value={form.service} onChange={onChange} options={services} testId="contact-select-service" placeholder={locale === "en" ? "— select —" : "— seleziona —"} />
        <SelectField label={labels.budget} name="budget" value={form.budget} onChange={onChange} options={budgets} testId="contact-select-budget" placeholder={locale === "en" ? "— select —" : "— seleziona —"} />
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-3">
          {labels.message + " *"}
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={onChange}
          rows={5}
          required
          data-testid="contact-input-message"
          placeholder={labels.messagePlaceholder}
          className="w-full bg-transparent border-b border-white/15 focus:border-violet-500 outline-none text-white placeholder-neutral-600 py-3 px-0 text-lg transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        data-testid="contact-submit"
        className="group inline-flex items-center gap-3 px-8 py-5 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-sm hover:bg-violet-500 hover:text-white transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
        {loading ? t.common.sending : t.common.sendRequest}
      </button>

      <p className="text-xs font-mono uppercase tracking-[0.24em] text-neutral-600 max-w-xl">
        {labels.consent}
      </p>
    </form>
  );
};

const Field = ({ label, name, value, onChange, type = "text", required, testId }) => (
  <div>
    <label className="block text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-3">
      {label}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      data-testid={testId}
      className="w-full bg-transparent border-b border-white/15 focus:border-violet-500 outline-none text-white placeholder-neutral-600 py-3 px-0 text-lg transition-colors"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, testId, placeholder }) => (
  <div>
    <label className="block text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-3">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      data-testid={testId}
      className="w-full bg-transparent border-b border-white/15 focus:border-violet-500 outline-none text-white py-3 px-0 text-lg appearance-none cursor-pointer transition-colors"
    >
      <option value="" className="bg-black">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o} className="bg-black">{o}</option>
      ))}
    </select>
  </div>
);

export default ContactForm;
