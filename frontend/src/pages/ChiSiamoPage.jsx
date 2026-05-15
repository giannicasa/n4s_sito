import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { Reveal, RevealLines } from "../components/Reveal";
import { FOUNDERS } from "../data/site";
import useLocale from "../hooks/useLocale";

const ChiSiamoPage = () => {
  const { t, r, locale } = useLocale();
  return (
    <>
      <SEOHead
        title={locale === "en" ? "About · 4 partners, one vision" : "Chi siamo · 4 soci, una visione"}
        description={t.about.body}
        path={r.about}
        ogKicker={t.nav.about}
        ogTitle={t.about.headlineLines.join(" ")}
        locale={locale}
        alternatePath={locale === "it" ? "/en/about" : "/chi-siamo"}
      />

      <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 grain">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            {t.about.kicker}
          </Reveal>
          <h1 className="h-display text-white text-6xl sm:text-8xl md:text-[11vw]" data-testid="about-headline">
            <RevealLines lines={[t.about.headlineLines[0], <><span key="2" className="text-violet-500">{t.about.headlineLines[1]}</span></>]} />
          </h1>
          <Reveal delay={0.3} className="mt-12 max-w-3xl text-lg md:text-xl text-neutral-300 leading-relaxed">
            {t.about.body}
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-ink-100">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {FOUNDERS.map((f, i) => (
            <Reveal as="div" key={f.name} delay={i * 0.1} className="bg-ink p-8 md:p-12 hover:bg-violet-900/10 transition-colors">
              <div className="w-14 h-14 mb-8 rounded-sm grid place-items-center font-display font-black text-2xl"
                   style={{ backgroundColor: f.color, color: f.color === "#ffffff" ? "#0a0a0a" : "#ffffff" }}>
                {f.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-3">
                {f.role[locale]}
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none mb-6">
                {f.name}
              </h2>
              <p className="text-neutral-300 leading-relaxed max-w-md">{f.bio[locale]}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
              {t.common.manifesto}
            </Reveal>
            <h2 className="h-display text-white text-4xl md:text-6xl">
              {t.about.manifestoLines[0]}<br />
              <span className="stroke-text">{t.about.manifestoLines[1]}</span><br />
              {t.about.manifestoLines[2]}<br />
              <span className="text-violet-500">{t.about.manifestoLines[3]}</span>
            </h2>
          </div>
          <div className="md:col-span-8 space-y-8 text-neutral-300 text-lg leading-relaxed">
            {t.about.manifestoP.map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>{p}</Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-black border-t border-white/5 text-center">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6 inline-flex items-center gap-2 justify-center">
            <MapPin size={12} /> {t.about.seatKicker}
          </Reveal>
          <h2 className="h-display text-white text-4xl md:text-[7vw] leading-[0.9]">
            <RevealLines lines={[t.about.seatLines[0], <span key="2" className="stroke-text-violet">{t.about.seatLines[1]}</span>]} />
          </h2>
          <Reveal delay={0.3} className="mt-10 inline-flex">
            <Link to={r.contact} data-testid="about-cta" className="inline-flex items-center gap-3 px-8 py-5 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-sm hover:bg-violet-500 hover:text-white transition-colors">
              {t.about.seatCta} <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default ChiSiamoPage;
