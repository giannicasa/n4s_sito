import React from "react";
import { Link } from "react-router-dom";
import { SERVICES } from "../data/services";
import useLocale from "../hooks/useLocale";
import { CharReveal } from "./CharReveal";
import { COMPANY, companyFullAddress } from "../data/company";
import { openPreferences } from "../lib/consent";

export const Footer = () => {
  const { t, r, locale } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-white/5" data-testid="site-footer">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 pt-24 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <p className="text-xs font-mono uppercase tracking-[0.28em] text-violet-400 mb-6">
              {t.footer.manifesto}
            </p>
            <CharReveal
              lines={[
                t.footer.manifestoLines[0],
                t.footer.manifestoLines[1],
                [
                  { text: t.footer.manifestoLines[2], highlight: true },
                  { text: ` ${t.footer.manifestoLines[3]}` },
                ],
              ]}
              className="font-display text-3xl md:text-5xl font-black uppercase leading-[0.95] tracking-tight text-balance"
              stagger={0.022}
              duration={0.85}
            />
          </div>
          <div className="md:col-span-3">
            <p className="text-xs font-mono uppercase tracking-[0.28em] text-neutral-500 mb-6">
              {t.footer.studio}
            </p>
            <ul className="space-y-3 text-neutral-300">
              <li><Link to={r.about} data-testid="footer-link-about" className="hover:text-violet-400">{t.nav.about}</Link></li>
              <li><Link to={r.cases} data-testid="footer-link-cases" className="hover:text-violet-400">{t.nav.caseStudies}</Link></li>
              <li><Link to={r.insights} data-testid="footer-link-insights" className="hover:text-violet-400">{t.nav.insights}</Link></li>
              <li><Link to={r.quote} data-testid="footer-link-quote" className="hover:text-violet-400">{t.nav.quote}</Link></li>
              <li><Link to={r.contact} data-testid="footer-link-contact" className="hover:text-violet-400">{t.nav.contact}</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="text-xs font-mono uppercase tracking-[0.28em] text-neutral-500 mb-6">
              {t.footer.services}
            </p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-neutral-300">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={r.serviceDetail(s.slug)}
                    data-testid={`footer-link-service-${s.slug}`}
                    className="hover:text-violet-400 transition-colors"
                  >
                    {s.title[locale].replace(/\s·\s.*/, "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-24 mb-10">
          <Link to={r.home} aria-label="not4sale" className="block group" data-testid="footer-wordmark">
            {/* SVG fluido: textLength forza la scritta a occupare esattamente
                la larghezza disponibile, su qualsiasi viewport */}
            <svg
              viewBox="0 38 1200 118"
              className="block w-full h-auto select-none"
              aria-hidden="true"
              focusable="false"
            >
              <text
                x="600"
                y="150"
                textAnchor="middle"
                textLength="1190"
                lengthAdjust="spacingAndGlyphs"
                fontSize="150"
                className="font-display font-black uppercase"
                fill="#ffffff"
              >
                <tspan fill="#9D4CDD">[</tspan>NOT4SALE<tspan fill="#9D4CDD">]</tspan>
              </text>
            </svg>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono uppercase tracking-[0.18em] text-neutral-500 border-t border-white/5 pt-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to={r.privacy} data-testid="footer-link-privacy" className="hover:text-violet-400 transition-colors">
              {t.footer.privacy}
            </Link>
            <Link to={r.cookiePolicy} data-testid="footer-link-cookies" className="hover:text-violet-400 transition-colors">
              {t.footer.cookies}
            </Link>
            <button
              type="button"
              onClick={openPreferences}
              data-testid="footer-cookie-prefs"
              className="uppercase tracking-[0.18em] hover:text-violet-400 transition-colors"
            >
              {t.footer.cookiePrefs}
            </button>
          </div>
          <div className="flex gap-6">
            <span>43.962°N · 12.737°E</span>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-violet-400" data-testid="footer-email">
              {COMPANY.email}
            </a>
          </div>
        </div>

        <div className="mt-6 text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-600" data-testid="footer-company-info">
          © {year} {COMPANY.name} · {companyFullAddress(locale)}
          {COMPANY.piva ? ` · P.IVA ${COMPANY.piva}` : ""}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
