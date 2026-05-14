import React from "react";
import { MapPin, Mail, Clock } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { Reveal, RevealLines } from "../components/Reveal";
import ContactForm from "../components/ContactForm";

const ContattiPage = () => (
  <>
    <SEOHead
      title="Contatti · Cattolica"
      description="Scrivici. Studio di marketing a Cattolica. Risposta entro 24 ore lavorative. hello@not4.sale"
      path="/contatti"
    />

    <section className="relative pt-40 pb-16 md:pt-56 md:pb-24 grain">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10">
        <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
          Contatti · Cattolica · Italia
        </Reveal>
        <h1 className="h-display text-white text-6xl sm:text-8xl md:text-[11vw]" data-testid="contact-headline">
          <RevealLines lines={["parliamone.", <span key="2" className="stroke-text-violet">davvero.</span>]} />
        </h1>
        <Reveal delay={0.3} className="mt-12 max-w-3xl text-lg md:text-xl text-neutral-300 leading-relaxed">
          Compila il form qui sotto. Ti risponde un essere umano (uno dei soci), entro 24 ore
          lavorative. Se siamo il fit giusto, partiamo. Se non lo siamo, te lo diciamo. Tempo
          tuo, rispettato.
        </Reveal>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
          <ContactForm />
        </div>

        <aside className="lg:col-span-4 space-y-12 lg:sticky lg:top-32 self-start">
          <InfoBlock icon={<MapPin size={16} />} label="Sede">
            <p className="text-white text-lg">Cattolica (RN)</p>
            <p className="text-neutral-500">Emilia-Romagna · Italia</p>
            <p className="text-neutral-500 mt-1 text-xs font-mono uppercase tracking-[0.24em]">
              43.962°N · 12.737°E
            </p>
          </InfoBlock>
          <InfoBlock icon={<Mail size={16} />} label="Email">
            <a
              href="mailto:hello@not4.sale"
              className="text-white text-lg hover:text-violet-400 transition-colors"
              data-testid="contact-page-email"
            >
              hello@not4.sale
            </a>
          </InfoBlock>
          <InfoBlock icon={<Clock size={16} />} label="Risposta">
            <p className="text-white text-lg">Entro 24 ore</p>
            <p className="text-neutral-500">Lun – Ven, 9–19 CET</p>
          </InfoBlock>

          <div className="border border-white/10 p-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-3">
              Quando lavoriamo insieme
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Quando una proposta diventa progetto, dedichiamo un team senior. Non passi mai da un
              account a un junior a uno specialista: parli con chi fa.
            </p>
          </div>
        </aside>
      </div>
    </section>
  </>
);

const InfoBlock = ({ icon, label, children }) => (
  <div>
    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-3">
      <span className="text-violet-500">{icon}</span>
      {label}
    </div>
    {children}
  </div>
);

export default ContattiPage;
