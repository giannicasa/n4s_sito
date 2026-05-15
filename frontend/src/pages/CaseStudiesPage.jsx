import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { Reveal, RevealLines } from "../components/Reveal";
import { CASE_STUDIES } from "../data/site";
import useLocale from "../hooks/useLocale";

const CaseStudiesPage = () => {
  const { t, r, locale } = useLocale();
  return (
    <>
      <SEOHead
        title={locale === "en" ? "Case Studies · Tailored machines" : "Case Studies · Macchine su misura"}
        description={t.cases.body}
        path={r.cases}
        ogKicker={t.nav.caseStudies}
        ogTitle={t.cases.headlineLines.join(" ")}
        locale={locale}
        alternatePath={locale === "it" ? "/en/case-studies" : "/case-studies"}
      />

      <section className="relative pt-40 pb-16 md:pt-56 md:pb-24 grain">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            {t.cases.kicker}
          </Reveal>
          <h1 className="h-display text-white text-6xl sm:text-8xl md:text-[11vw]" data-testid="case-headline">
            <RevealLines lines={[t.cases.headlineLines[0], <><span key="2" className="text-violet-500">{t.cases.headlineLines[1]}</span></>]} />
          </h1>
          <Reveal delay={0.3} className="mt-12 max-w-3xl text-lg md:text-xl text-neutral-300 leading-relaxed">
            {t.cases.body}
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 space-y-px bg-white/5 border-y border-white/10">
          {CASE_STUDIES.map((cs) => (
            <div
              key={cs.code}
              className="group bg-ink relative p-8 md:p-16 hover:bg-violet-900/10 transition-colors"
              data-testid={`case-row-${cs.code}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-2">
                  <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400">{cs.code}</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-neutral-500 mt-2">{cs.industry[locale]}</div>
                </div>
                <div className="md:col-span-6">
                  <h3 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none mb-4 group-hover:text-violet-400 transition-colors">
                    {cs.title[locale]}
                  </h3>
                  <p className="text-neutral-400 max-w-xl">{cs.excerpt[locale]}</p>
                </div>
                <div className="md:col-span-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-2">
                    {locale === "en" ? "Result" : "Risultato"}
                  </div>
                  <div className="font-display text-2xl md:text-3xl font-bold text-violet-500">
                    {cs.metric[locale]}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {cs.levers[locale].map((l) => (
                      <span key={l} className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-300 border border-white/10 px-2 py-1">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-1 flex md:justify-end">
                  <ArrowUpRight size={28} className="text-neutral-600 group-hover:text-violet-400 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-32 text-center">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <h2 className="h-display text-white text-5xl md:text-[9vw] leading-[0.9]">
            <RevealLines lines={[t.cases.yourTurnLines[0], <span key="2" className="stroke-text-violet">{t.cases.yourTurnLines[1]}</span>]} />
          </h2>
          <Reveal delay={0.3} className="mt-10 inline-flex flex-wrap items-center justify-center gap-4">
            <Link to={r.quote} data-testid="case-cta-quote" className="inline-flex items-center gap-3 px-8 py-5 bg-violet-500 text-white font-display font-bold uppercase tracking-[0.18em] text-sm hover:bg-violet-400 transition-colors">
              {t.hero.ctaQuote} <ArrowUpRight size={18} />
            </Link>
            <Link to={r.contact} data-testid="case-cta" className="inline-flex items-center gap-3 px-8 py-5 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-sm hover:bg-violet-500 hover:text-white transition-colors">
              {t.common.newProject} <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default CaseStudiesPage;
