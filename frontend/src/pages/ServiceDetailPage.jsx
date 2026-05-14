import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";

import SEOHead from "../components/SEOHead";
import { Reveal, RevealLines } from "../components/Reveal";
import { SERVICES, getService } from "../data/services";
import ContactForm from "../components/ContactForm";

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const service = getService(slug);
  if (!service) return <Navigate to="/servizi" replace />;

  const idx = SERVICES.findIndex((s) => s.slug === slug);
  const next = SERVICES[(idx + 1) % SERVICES.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.title,
    description: service.short,
    provider: { "@type": "ProfessionalService", name: "not4sale", address: { "@type": "PostalAddress", addressLocality: "Cattolica", addressCountry: "IT" } },
    areaServed: "IT",
    url: `https://not4.sale/servizi/${service.slug}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.title} deliverables`,
      itemListElement: service.deliverables.map((d, i) => ({ "@type": "Offer", position: i + 1, itemOffered: { "@type": "Service", name: d } }))
    },
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: service.faq.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a }
      }))
    }
  };

  return (
    <>
      <SEOHead
        title={`${service.title} · Servizi`}
        description={service.short}
        path={`/servizi/${service.slug}`}
        keywords={service.keywords.join(", ")}
        jsonLd={jsonLd}
      />

      {/* hero */}
      <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 grain">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <Reveal className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            <Link to="/servizi" className="hover:text-white" data-testid={`service-back-${service.slug}`}>← Servizi</Link>
            <span className="text-neutral-700">/</span>
            <span>{service.code}</span>
          </Reveal>

          <h1
            className="h-display text-white text-6xl sm:text-8xl md:text-[11vw] leading-[0.85] text-balance"
            data-testid={`service-headline-${service.slug}`}
          >
            <RevealLines lines={[service.title.replace(/\s·\s.*/, ""), <span key="2" className="text-violet-500">.</span>]} />
          </h1>

          <Reveal delay={0.3} className="mt-12 max-w-3xl text-xl md:text-2xl text-neutral-200 leading-relaxed">
            {service.short}
          </Reveal>
        </div>
      </section>

      {/* long copy + deliverables */}
      <section className="py-24 md:py-32 bg-ink-100">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
              Come lavoriamo
            </Reveal>
            <Reveal as="p" className="text-xl md:text-2xl text-neutral-200 leading-relaxed max-w-2xl">
              {service.long}
            </Reveal>
          </div>
          <div className="md:col-span-5">
            <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
              Cosa ricevi
            </Reveal>
            <ul className="space-y-4">
              {service.deliverables.map((d, i) => (
                <Reveal as="li" key={i} delay={0.05 * i} className="flex gap-4 border-b border-white/10 pb-4">
                  <Check size={20} className="text-violet-500 mt-1 shrink-0" />
                  <span className="text-neutral-200">{d}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <Reveal as="h2" className="h-display text-white text-5xl md:text-6xl">
              Domande<br />
              <span className="stroke-text">vere.</span>
            </Reveal>
          </div>
          <div className="md:col-span-8">
            <div className="border-t border-white/10">
              {service.faq.map(([q, a], i) => (
                <Reveal key={i} delay={0.05 * i} className="py-6 md:py-8 border-b border-white/10">
                  <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight text-white mb-3">
                    {q}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed text-base md:text-lg">{a}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* mini contact + next service */}
      <section className="py-24 md:py-32 bg-black border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <Reveal as="h2" className="h-display text-white text-4xl md:text-6xl mb-3">
              Iniziamo da {service.title.replace(/\s·\s.*/, "")}.
            </Reveal>
            <Reveal delay={0.2} className="text-neutral-400 max-w-xl mb-10">
              Compila il form e riceverai entro 24 ore una risposta umana. Niente bot, niente loop.
            </Reveal>
            <ContactForm defaultService={service.title.replace(/\s·\s.*/, "")} />
          </div>

          <div className="lg:col-span-5">
            <Link
              to={`/servizi/${next.slug}`}
              data-testid={`service-next-${next.slug}`}
              className="group block border border-white/10 hover:border-violet-500 p-8 md:p-12 transition-colors"
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
                Prossimo · {next.code}
              </div>
              <div className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-white group-hover:text-violet-400 transition-colors leading-none">
                {next.title.replace(/\s·\s.*/, "")}
              </div>
              <div className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.24em] text-neutral-400 group-hover:text-violet-400">
                vai <ArrowUpRight size={14} />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServiceDetailPage;
