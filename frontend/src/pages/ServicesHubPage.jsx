import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { Reveal, RevealLines } from "../components/Reveal";
import Marquee from "../components/Marquee";
import { SERVICES } from "../data/services";

const ServicesHubPage = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Servizi not4sale",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: `https://not4.sale/servizi/${s.slug}`
    }))
  };

  return (
    <>
      <SEOHead
        title="Servizi · Marketing integrato"
        description="Tutti i servizi di not4sale: growth hacking, SEO, AEO, GEO, brand strategy, performance marketing, social, content, web design, AI marketing."
        path="/servizi"
        jsonLd={jsonLd}
      />

      <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 grain">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            Indice · 10 servizi
          </Reveal>
          <h1 className="h-display text-white text-6xl sm:text-8xl md:text-[12vw]" data-testid="services-headline">
            <RevealLines
              lines={[
                "Servizi",
                <>
                  <span className="stroke-text">come</span>{" "}
                  <span className="text-violet-500">leve</span>
                </>
              ]}
            />
          </h1>
          <Reveal delay={0.3} className="mt-10 max-w-2xl text-lg md:text-xl text-neutral-300 leading-relaxed">
            Non lavoriamo a silos. Ogni servizio è una leva. Le combiniamo per costruire la macchina
            che ti serve, niente di più, niente di meno.
          </Reveal>
        </div>
      </section>

      <section className="pb-24 md:pb-40">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <div className="border-t border-white/10">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                to={`/servizi/${s.slug}`}
                data-testid={`service-row-${s.slug}`}
                className="group flex items-center justify-between gap-6 py-8 md:py-10 border-b border-white/10 hover:bg-violet-900/10 transition-colors px-4 md:px-6 -mx-4 md:-mx-6"
              >
                <div className="flex items-baseline gap-6 md:gap-10 min-w-0">
                  <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-violet-400 w-10">
                    {s.code}
                  </span>
                  <span className="font-display text-3xl md:text-6xl font-black uppercase tracking-tight text-white group-hover:text-violet-400 transition-colors truncate">
                    {s.title.replace(/\s·\s.*/, "")}
                  </span>
                </div>
                <span className="hidden md:inline text-sm text-neutral-500 max-w-md text-right truncate">
                  {s.short}
                </span>
                <ArrowUpRight
                  size={28}
                  className="text-neutral-600 group-hover:text-violet-400 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-white/5 overflow-hidden">
        <Marquee items={["MULTIDISCIPLINARE", "INTEGRATO", "ACCOUNTABLE", "DATA-LED", "CREATIVO"]} speed="fast" />
      </section>
    </>
  );
};

export default ServicesHubPage;
