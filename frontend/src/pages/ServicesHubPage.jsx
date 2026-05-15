import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { Reveal, RevealLines } from "../components/Reveal";
import Marquee from "../components/Marquee";
import { SERVICES } from "../data/services";
import useLocale from "../hooks/useLocale";

const ServicesHubPage = () => {
  const { t, r, locale } = useLocale();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: locale === "en" ? "not4sale services" : "Servizi not4sale",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "ListItem", position: i + 1, name: s.title[locale],
      url: `https://not4.sale${r.serviceDetail(s.slug)}`
    }))
  };

  return (
    <>
      <SEOHead
        title={locale === "en" ? "Services · Integrated marketing" : "Servizi · Marketing integrato"}
        description={t.servicesHub.body}
        path={r.services}
        ogKicker={locale === "en" ? "Services" : "Servizi"}
        ogTitle={t.servicesHub.headlineLines.join(" ")}
        jsonLd={jsonLd}
        locale={locale}
        alternatePath={locale === "it" ? "/en/services" : "/servizi"}
      />

      <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 grain">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            {t.servicesHub.kicker}
          </Reveal>
          <h1 className="h-display text-white text-6xl sm:text-8xl md:text-[12vw]" data-testid="services-headline">
            <RevealLines
              lines={[
                t.servicesHub.headlineLines[0],
                <><span className="stroke-text">{t.servicesHub.headlineLines[1].split(" ")[0]}</span>{" "}<span className="text-violet-500">{t.servicesHub.headlineLines[1].split(" ").slice(1).join(" ")}</span></>
              ]}
            />
          </h1>
          <Reveal delay={0.3} className="mt-10 max-w-2xl text-lg md:text-xl text-neutral-300 leading-relaxed">
            {t.servicesHub.body}
          </Reveal>
        </div>
      </section>

      <section className="pb-24 md:pb-40">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <div className="border-t border-white/10">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                to={r.serviceDetail(s.slug)}
                data-testid={`service-row-${s.slug}`}
                className="group flex items-center justify-between gap-6 py-8 md:py-10 border-b border-white/10 hover:bg-violet-900/10 transition-colors px-4 md:px-6 -mx-4 md:-mx-6"
              >
                <div className="flex items-baseline gap-6 md:gap-10 min-w-0">
                  <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-violet-400 w-10">{s.code}</span>
                  <span className="font-display text-3xl md:text-6xl font-black uppercase tracking-tight text-white group-hover:text-violet-400 transition-colors truncate">
                    {s.title[locale].replace(/\s·\s.*/, "")}
                  </span>
                </div>
                <span className="hidden md:inline text-sm text-neutral-500 max-w-md text-right truncate">
                  {s.short[locale]}
                </span>
                <ArrowUpRight size={28} className="text-neutral-600 group-hover:text-violet-400 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-white/5 overflow-hidden">
        <Marquee items={locale === "en" ? ["MULTIDISCIPLINARY", "INTEGRATED", "ACCOUNTABLE", "DATA-LED", "CREATIVE"] : ["MULTIDISCIPLINARE", "INTEGRATO", "ACCOUNTABLE", "DATA-LED", "CREATIVO"]} speed="fast" />
      </section>
    </>
  );
};

export default ServicesHubPage;
