import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import SEOHead from "../components/SEOHead";
import Hero3D from "../components/Hero3D";
import { Reveal, RevealLines } from "../components/Reveal";
import Marquee from "../components/Marquee";
import { SERVICES } from "../data/services";
import { CASE_STUDIES } from "../data/site";
import useLocale from "../hooks/useLocale";

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const { t, r, locale } = useLocale();
  const heroRef = useRef(null);
  const horizontalRef = useRef(null);
  const trackRef = useRef(null);

  const { scrollYProgress: heroProg } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroScale = useTransform(heroProg, [0, 1], [1, 0.85]);
  const heroOpacity = useTransform(heroProg, [0, 0.8], [1, 0]);
  const heroY = useTransform(heroProg, [0, 1], [0, -80]);

  // GSAP horizontal scroll-pinned services
  useEffect(() => {
    const section = horizontalRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;

    const ctx = gsap.context(() => {
      const totalScroll = track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => `-${totalScroll}px`,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${totalScroll + window.innerHeight * 0.5}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
      return () => tween.kill();
    }, section);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "not4sale",
    description: locale === "en"
      ? "Marketing studio in Cattolica, Italy. Growth hacking, SEO, AEO, GEO, brand strategy, performance marketing, AI marketing."
      : "Studio di marketing a Cattolica. Growth hacking, SEO, AEO, GEO, brand strategy, performance marketing, AI marketing.",
    url: locale === "en" ? "https://not4.sale/en" : "https://not4.sale",
    address: { "@type": "PostalAddress", addressLocality: "Cattolica", addressRegion: "RN", addressCountry: "IT" },
    areaServed: "IT",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "en" ? "Marketing services" : "Servizi di marketing",
      itemListElement: SERVICES.map((s, idx) => ({
        "@type": "Offer",
        position: idx + 1,
        itemOffered: { "@type": "Service", name: s.title[locale], url: `https://not4.sale${r.serviceDetail(s.slug)}` }
      }))
    }
  };

  return (
    <>
      <SEOHead
        title={locale === "en" ? "Marketing out of tune · Cattolica" : "Marketing fuori dal coro · Cattolica"}
        description={t.hero.sub}
        path={locale === "en" ? "/en" : "/"}
        keywords={locale === "en" ? "marketing Italy, growth hacking, SEO AEO GEO, AI marketing" : "marketing Cattolica, growth hacking, SEO AEO GEO, AI marketing"}
        ogKicker={locale === "en" ? "Studio" : "Studio"}
        ogTitle={locale === "en" ? "Marketing out of tune." : "Marketing fuori dal coro."}
        jsonLd={jsonLd}
        locale={locale}
        alternatePath={locale === "it" ? "/en" : "/"}
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
                {t.hero.kicker}
              </span>
            </div>

            <h1
              className="h-display text-white text-[14vw] sm:text-[12vw] md:text-[9vw] lg:text-[8.5vw] text-balance"
              data-testid="hero-headline"
            >
              <RevealLines
                lines={[
                  <>{t.hero.headlineA.replace(".", "")}<span className="text-violet-500">.</span></>,
                  <>{t.hero.headlineB.replace(".", "")}<span className="text-violet-500">.</span></>
                ]}
              />
            </h1>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
              <div className="md:col-span-6">
                <Reveal delay={0.3} className="text-base md:text-xl text-neutral-300 leading-relaxed max-w-xl">
                  {t.hero.sub}
                </Reveal>
              </div>
              <div className="md:col-span-6 flex flex-wrap items-center gap-4 md:justify-end">
                <Link
                  to={r.services}
                  data-testid="hero-cta-services"
                  className="inline-flex items-center gap-3 px-6 py-4 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-xs hover:bg-violet-500 hover:text-white transition-colors"
                >
                  {t.hero.ctaServices} <ArrowUpRight size={16} />
                </Link>
                <Link
                  to={r.quote}
                  data-testid="hero-cta-quote"
                  className="inline-flex items-center gap-3 px-6 py-4 border border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white font-display font-bold uppercase tracking-[0.18em] text-xs transition-colors"
                >
                  {t.hero.ctaQuote}
                </Link>
                <Link
                  to={r.contact}
                  data-testid="hero-cta-contact"
                  className="inline-flex items-center gap-3 px-6 py-4 border border-white/20 text-white hover:border-white font-display font-bold uppercase tracking-[0.18em] text-xs transition-colors"
                >
                  {t.hero.ctaContact}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 right-6 z-10 hidden md:flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.32em] text-neutral-500">
          <span>{t.common.scroll}</span>
          <span className="w-10 h-px bg-neutral-700 relative overflow-hidden">
            <span className="absolute inset-0 bg-violet-500 animate-[marquee_2s_linear_infinite]" />
          </span>
        </div>
      </section>

      <section className="py-12 border-y border-white/5 overflow-hidden">
        <Marquee items={["GROWTH", "BRAND", "SEO", "AEO", "GEO", "AI MARKETING", "PERFORMANCE", "CONTENT"]} />
      </section>

      {/* PHILOSOPHY */}
      <section className="relative py-32 md:py-56 grain">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-2">
            <Reveal>
              <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 md:sticky md:top-32">
                {t.home.sec1}
              </div>
            </Reveal>
          </div>
          <div className="md:col-span-10">
            <h2 className="h-display text-white text-5xl sm:text-7xl lg:text-[7vw] text-balance">
              <RevealLines
                lines={[
                  t.home.philLines[0],
                  <span key="2">{t.home.philLines[1].split(/(\d+)/).map((p, i) => /\d/.test(p) ? <span key={i} className="text-violet-500">{p}</span> : p)}</span>,
                  <>{t.home.philLines[2].split(/(500)/).map((p, i) => p === "500" ? <span key={i} className="stroke-text">500</span> : p)}</>
                ]}
              />
            </h2>
            <Reveal delay={0.25} className="mt-10 max-w-3xl text-lg md:text-2xl text-neutral-300 leading-relaxed">
              {t.home.philBody}
            </Reveal>
          </div>
        </div>
      </section>

      {/* SERVICES — GSAP horizontal scroll on desktop, grid on mobile */}
      <section ref={horizontalRef} className="relative bg-black overflow-hidden lg:h-screen">
        <div className="lg:absolute lg:top-0 lg:left-0 lg:w-full px-5 md:px-10 pt-24 lg:pt-16 pb-8 z-10">
          <div className="max-w-[1600px] mx-auto flex items-end justify-between gap-8">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-4">
                {t.home.sec2}
              </p>
              <h2 className="h-display text-white text-4xl md:text-6xl whitespace-pre-line">
                {t.home.servicesTitle}
              </h2>
            </div>
            <Link
              to={r.services}
              data-testid="home-services-cta"
              className="hidden md:inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.24em] text-neutral-400 hover:text-violet-400"
            >
              {t.home.seeAll} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Desktop horizontal track */}
        <div className="hidden lg:flex h-full items-center pt-48">
          <div ref={trackRef} className="flex gap-6 pl-10 pr-[40vw] will-change-transform">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                to={r.serviceDetail(s.slug)}
                data-testid={`home-service-card-${s.slug}`}
                className="group relative w-[420px] h-[440px] border border-white/10 hover:border-violet-500 bg-ink/40 p-8 flex flex-col justify-between hover:bg-violet-900/10 transition-colors shrink-0"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400">{s.code}</span>
                  <ArrowUpRight size={22} className="text-neutral-600 group-hover:text-violet-400 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <div>
                  <h3 className="font-display text-4xl md:text-5xl font-black uppercase leading-none tracking-tight text-white group-hover:text-violet-400 transition-colors mb-4">
                    {s.title[locale].replace(/\s·\s.*/, "")}
                  </h3>
                  <p className="text-sm text-neutral-400 line-clamp-3">{s.short[locale]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile / tablet grid */}
        <div className="lg:hidden max-w-[1600px] mx-auto px-5 md:px-10 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-l border-white/10">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                to={r.serviceDetail(s.slug)}
                data-testid={`home-service-card-m-${s.slug}`}
                className="group relative p-6 border-r border-b border-white/10 min-h-[200px] flex flex-col justify-between hover:bg-violet-900/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500">{s.code}</span>
                  <ArrowUpRight size={18} className="text-neutral-600 group-hover:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase leading-none tracking-tight text-white group-hover:text-violet-400 transition-colors">
                    {s.title[locale].replace(/\s·\s.*/, "")}
                  </h3>
                  <p className="mt-3 text-sm text-neutral-500 line-clamp-2">{s.short[locale]}</p>
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
                {t.home.sec3}
              </Reveal>
              <Reveal as="h2" className="h-display text-white text-5xl md:text-7xl lg:text-[6vw]">
                {t.home.worksTitle.split("\n").map((l, i) => i === 1 ? <span key={i} className="stroke-text-violet block">{l}</span> : <span key={i} className="block">{l}</span>)}
              </Reveal>
            </div>
            <div className="md:col-span-6 md:pt-8">
              <Reveal delay={0.2} className="text-base md:text-lg text-neutral-400 leading-relaxed max-w-xl">
                {t.home.worksBody}
              </Reveal>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
            {CASE_STUDIES.slice(0, 4).map((cs) => (
              <Link
                key={cs.code}
                to={r.cases}
                data-testid={`home-case-${cs.code}`}
                className="group p-8 md:p-12 bg-ink-100 hover:bg-violet-900/10 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-8">
                  <span>{cs.code}</span>
                  <span>{cs.industry[locale]}</span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-black uppercase leading-none tracking-tight text-white mb-6 group-hover:text-violet-400 transition-colors">
                  {cs.title[locale]}
                </h3>
                <div className="text-violet-500 font-mono text-sm uppercase tracking-[0.18em] mb-4">
                  {cs.metric[locale]}
                </div>
                <p className="text-neutral-400">{cs.excerpt[locale]}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex justify-end">
            <Link to={r.cases} data-testid="home-case-cta" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.24em] text-neutral-400 hover:text-violet-400">
              {locale === "en" ? "all case studies" : "tutti i case studies"} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="relative py-32 md:py-48 overflow-hidden grain">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          background: "radial-gradient(60% 50% at 50% 50%, rgba(157,76,221,0.35) 0%, rgba(0,0,0,0) 70%)"
        }} />
        <div className="relative max-w-[1600px] mx-auto px-5 md:px-10 text-center">
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            {t.home.sec4}
          </Reveal>
          <h2 className="h-display text-white text-5xl sm:text-7xl md:text-[10vw] leading-[0.9] text-balance">
            <RevealLines lines={[t.home.finalLines[0], <span key="2" className="stroke-text-violet">{t.home.finalLines[1]}</span>]} />
          </h2>
          <Reveal delay={0.4} className="mt-10 inline-flex flex-wrap items-center justify-center gap-4">
            <Link to={r.quote} data-testid="home-bottom-cta-quote" className="inline-flex items-center gap-3 px-8 py-5 bg-violet-500 text-white font-display font-bold uppercase tracking-[0.18em] text-sm hover:bg-violet-400 transition-colors">
              {t.hero.ctaQuote} <ArrowUpRight size={18} />
            </Link>
            <Link to={r.contact} data-testid="home-bottom-cta" className="inline-flex items-center gap-3 px-8 py-5 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-sm hover:bg-violet-500 hover:text-white transition-colors">
              {t.common.newProject} <ArrowUpRight size={18} />
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
