import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";

import SEOHead from "../components/SEOHead";
import Hero3D from "../components/Hero3D";
import { Reveal, RevealLines } from "../components/Reveal";
import Marquee from "../components/Marquee";
import { SERVICES } from "../data/services";
import { CASE_STUDIES } from "../data/site";

const HomePage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress: heroProg } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroScale = useTransform(heroProg, [0, 1], [1, 0.85]);
  const heroOpacity = useTransform(heroProg, [0, 0.8], [1, 0]);
  const heroY = useTransform(heroProg, [0, 1], [0, -80]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "not4sale",
    description:
      "Studio di marketing a Cattolica. Growth hacking, SEO, AEO, GEO, brand strategy, performance marketing, AI marketing.",
    url: "https://not4.sale",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cattolica",
      addressRegion: "RN",
      addressCountry: "IT"
    },
    areaServed: "IT",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servizi di marketing",
      itemListElement: SERVICES.map((s, idx) => ({
        "@type": "Offer",
        position: idx + 1,
        itemOffered: { "@type": "Service", name: s.title, url: `https://not4.sale/servizi/${s.slug}` }
      }))
    }
  };

  return (
    <>
      <SEOHead
        title="Marketing fuori dal coro · Cattolica"
        description="not4sale è lo studio di marketing a Cattolica che costruisce la macchina giusta per ogni cliente. Growth hacking, SEO/AEO/GEO, brand, AI marketing."
        path="/"
        keywords="marketing Cattolica, growth hacking, SEO AEO GEO, brand strategy, AI marketing, agenzia marketing Romagna"
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[680px] overflow-hidden grain">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0">
          <Hero3D />
        </motion.div>

        <div className="relative z-10 h-full max-w-[1600px] mx-auto px-5 md:px-10 flex flex-col justify-end pb-16 md:pb-24">
          <motion.div style={{ y: heroY }}>
            <div className="flex items-center gap-3 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.32em] text-neutral-400">
                Studio · Cattolica · Italia
              </span>
            </div>

            <h1
              className="h-display text-white text-[14vw] sm:text-[12vw] md:text-[9vw] lg:text-[8.5vw] text-balance"
              data-testid="hero-headline"
            >
              <RevealLines
                lines={[
                  <>marketing<span className="text-violet-500">.</span></>,
                  <>fuori dal coro<span className="text-violet-500">.</span></>
                ]}
              />
            </h1>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
              <div className="md:col-span-6">
                <Reveal delay={0.3} className="text-base md:text-xl text-neutral-300 leading-relaxed max-w-xl">
                  Costruiamo la macchina giusta per ogni cliente. Niente Ferrari a chi vuole una 500.
                  Niente strategie copia-incolla. Growth, SEO, AEO, GEO, brand, AI: integrati,
                  non a slot.
                </Reveal>
              </div>
              <div className="md:col-span-6 flex flex-wrap items-center gap-4 md:justify-end">
                <Link
                  to="/servizi"
                  data-testid="hero-cta-services"
                  className="inline-flex items-center gap-3 px-6 py-4 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-xs hover:bg-violet-500 hover:text-white transition-colors"
                >
                  Esplora i servizi <ArrowUpRight size={16} />
                </Link>
                <Link
                  to="/contatti"
                  data-testid="hero-cta-contact"
                  className="inline-flex items-center gap-3 px-6 py-4 border border-white/20 text-white hover:border-violet-500 hover:text-violet-400 font-display font-bold uppercase tracking-[0.18em] text-xs transition-colors"
                >
                  Parliamo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-6 right-6 z-10 hidden md:flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.32em] text-neutral-500">
          <span>scroll</span>
          <span className="w-10 h-px bg-neutral-700 relative overflow-hidden">
            <span className="absolute inset-0 bg-violet-500 animate-[marquee_2s_linear_infinite]" />
          </span>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-12 border-y border-white/5 overflow-hidden">
        <Marquee
          items={[
            "GROWTH",
            "BRAND",
            "SEO",
            "AEO",
            "GEO",
            "AI MARKETING",
            "PERFORMANCE",
            "CONTENT"
          ]}
        />
      </section>

      {/* PHILOSOPHY */}
      <section className="relative py-32 md:py-56 grain">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-2">
            <Reveal>
              <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 md:sticky md:top-32">
                01 · Filosofia
              </div>
            </Reveal>
          </div>
          <div className="md:col-span-10">
            <h2 className="h-display text-white text-5xl sm:text-7xl lg:text-[7vw] text-balance">
              <RevealLines
                lines={[
                  "non mostriamo",
                  <>una ferrari <span className="text-violet-500">a chi</span></>,
                  <>vuole una <span className="stroke-text">500</span>.</>
                ]}
              />
            </h2>
            <Reveal delay={0.25} className="mt-10 max-w-3xl text-lg md:text-2xl text-neutral-300 leading-relaxed">
              Ogni cliente è diverso. Ogni mercato è diverso. Per questo non vendiamo pacchetti
              pronti: studiamo il tuo business e costruiamo la macchina che ti serve. A volte è
              un'utilitaria perfetta, a volte è una bestia da pista. Mai un finto SUV per
              fare scena.
            </Reveal>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="relative py-24 md:py-40 bg-black">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <div className="flex items-end justify-between gap-8 mb-16">
            <div>
              <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-4">
                02 · Servizi
              </Reveal>
              <Reveal as="h2" className="h-display text-white text-5xl md:text-7xl lg:text-[7vw]">
                tutto<br />in un posto.
              </Reveal>
            </div>
            <Link
              to="/servizi"
              data-testid="home-services-cta"
              className="hidden md:inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.24em] text-neutral-400 hover:text-violet-400"
            >
              vedi tutti <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-white/10">
            {SERVICES.map((s, i) => (
              <Link
                key={s.slug}
                to={`/servizi/${s.slug}`}
                data-testid={`home-service-card-${s.slug}`}
                className="group relative p-6 md:p-8 border-r border-b border-white/10 min-h-[200px] flex flex-col justify-between hover:bg-violet-900/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500">
                    {s.code}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-neutral-600 group-hover:text-violet-400 transition-all group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold uppercase leading-none tracking-tight text-white group-hover:text-violet-400 transition-colors">
                    {s.title.replace(/\s·\s.*/, "")}
                  </h3>
                  <p className="mt-3 text-sm text-neutral-500 line-clamp-2">{s.short}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDIES PREVIEW */}
      <section className="relative py-32 md:py-48 bg-ink-100">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-6">
              <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-4">
                03 · Lavori
              </Reveal>
              <Reveal as="h2" className="h-display text-white text-5xl md:text-7xl lg:text-[6vw]">
                la macchina<br />
                <span className="stroke-text-violet">su misura.</span>
              </Reveal>
            </div>
            <div className="md:col-span-6 md:pt-8">
              <Reveal delay={0.2} className="text-base md:text-lg text-neutral-400 leading-relaxed max-w-xl">
                Non mostriamo logoglio: ogni progetto è una macchina costruita su misura. Qui sotto
                qualche segnale di cosa succede quando il fit tra studio e cliente è giusto.
              </Reveal>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
            {CASE_STUDIES.slice(0, 4).map((cs) => (
              <Link
                key={cs.code}
                to="/case-studies"
                data-testid={`home-case-${cs.code}`}
                className="group p-8 md:p-12 bg-ink-100 hover:bg-violet-900/10 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-8">
                  <span>{cs.code}</span>
                  <span>{cs.industry}</span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-black uppercase leading-none tracking-tight text-white mb-6 group-hover:text-violet-400 transition-colors">
                  {cs.title}
                </h3>
                <div className="text-violet-500 font-mono text-sm uppercase tracking-[0.18em] mb-4">
                  {cs.metric}
                </div>
                <p className="text-neutral-400">{cs.excerpt}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex justify-end">
            <Link
              to="/case-studies"
              data-testid="home-case-cta"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.24em] text-neutral-400 hover:text-violet-400"
            >
              tutti i case studies <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="relative py-32 md:py-48 overflow-hidden grain">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 50%, rgba(157,76,221,0.35) 0%, rgba(0,0,0,0) 70%)"
          }}
        />
        <div className="relative max-w-[1600px] mx-auto px-5 md:px-10 text-center">
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            04 · Pronti?
          </Reveal>
          <h2 className="h-display text-white text-5xl sm:text-7xl md:text-[10vw] leading-[0.9] text-balance">
            <RevealLines lines={["scriviamoci.", <span key="2" className="stroke-text-violet">facciamoci sentire.</span>]} />
          </h2>
          <Reveal delay={0.4} className="mt-10 inline-flex items-center gap-3">
            <Link
              to="/contatti"
              data-testid="home-bottom-cta"
              className="inline-flex items-center gap-3 px-8 py-5 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-sm hover:bg-violet-500 hover:text-white transition-colors"
            >
              Inizia il progetto <ArrowUpRight size={18} />
            </Link>
          </Reveal>
          <Reveal delay={0.5} className="mt-8 flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-[0.28em] text-neutral-500">
            <MapPin size={12} /> Cattolica · Emilia-Romagna · 43.962°N 12.737°E
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default HomePage;
