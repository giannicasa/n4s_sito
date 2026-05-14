import React from "react";
import { Link } from "react-router-dom";
import { SERVICES } from "../data/services";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-black border-t border-white/5" data-testid="site-footer">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 pt-24 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <p className="text-xs font-mono uppercase tracking-[0.28em] text-violet-400 mb-6">
              Manifesto
            </p>
            <p className="font-display text-3xl md:text-5xl font-black uppercase leading-[0.95] tracking-tight text-balance">
              non siamo<br />in vendita.<br />
              <span className="text-violet-500">il tuo brand</span> sì.
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="text-xs font-mono uppercase tracking-[0.28em] text-neutral-500 mb-6">
              Studio
            </p>
            <ul className="space-y-3 text-neutral-300">
              <li>
                <Link to="/chi-siamo" data-testid="footer-link-chi-siamo" className="hover:text-violet-400">
                  Chi siamo
                </Link>
              </li>
              <li>
                <Link to="/case-studies" data-testid="footer-link-case-studies" className="hover:text-violet-400">
                  Case studies
                </Link>
              </li>
              <li>
                <Link to="/contatti" data-testid="footer-link-contatti" className="hover:text-violet-400">
                  Contatti
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="text-xs font-mono uppercase tracking-[0.28em] text-neutral-500 mb-6">
              Servizi
            </p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-neutral-300">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={`/servizi/${s.slug}`}
                    data-testid={`footer-link-service-${s.slug}`}
                    className="hover:text-violet-400 transition-colors"
                  >
                    {s.title.replace(/\s·\s.*/, "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-24 mb-10">
          <Link to="/" aria-label="not4sale" className="block group" data-testid="footer-wordmark">
            <span className="font-display font-black uppercase leading-none tracking-[-0.04em] block text-white text-[26vw] md:text-[18vw]">
              <span className="text-violet-500">[</span>NOT4SALE<span className="text-violet-500">]</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 text-xs font-mono uppercase tracking-[0.24em] text-neutral-500">
          <div>© {year} not4sale · Cattolica (RN), Italia</div>
          <div className="flex gap-6">
            <span>43.962°N · 12.737°E</span>
            <a href="mailto:hello@not4.sale" className="hover:text-violet-400" data-testid="footer-email">
              hello@not4.sale
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
