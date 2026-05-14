import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { Reveal, RevealLines } from "../components/Reveal";
import { FOUNDERS } from "../data/site";

const ChiSiamoPage = () => (
  <>
    <SEOHead
      title="Chi siamo · 4 soci, una visione"
      description="Quattro soci fondatori. Una squadra fatta di growth, brand, AI e performance. Studio di marketing con sede a Cattolica."
      path="/chi-siamo"
    />

    <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 grain">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10">
        <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
          Studio · 4 soci · Cattolica
        </Reveal>
        <h1 className="h-display text-white text-6xl sm:text-8xl md:text-[11vw]" data-testid="about-headline">
          <RevealLines lines={["quattro teste.", <>una <span className="text-violet-500">macchina</span>.</>]} />
        </h1>
        <Reveal delay={0.3} className="mt-12 max-w-3xl text-lg md:text-xl text-neutral-300 leading-relaxed">
          Siamo nati come studio nel 2021 a Cattolica. Quattro soci, profili complementari: strategia,
          creatività, tecnologia, dati. Niente piramide infinita di account. Quando lavori con noi,
          lavori con noi.
        </Reveal>
      </div>
    </section>

    <section className="py-24 md:py-32 bg-ink-100">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
        {FOUNDERS.map((f, i) => (
          <Reveal
            as="div"
            key={f.name}
            delay={i * 0.1}
            className="bg-ink p-8 md:p-12 hover:bg-violet-900/10 transition-colors"
          >
            <div
              className="w-14 h-14 mb-8 rounded-sm grid place-items-center font-display font-black text-2xl"
              style={{ backgroundColor: f.color, color: f.color === "#ffffff" ? "#0a0a0a" : "#ffffff" }}
            >
              {f.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-3">
              {f.role}
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none mb-6">
              {f.name}
            </h2>
            <p className="text-neutral-300 leading-relaxed max-w-md">{f.bio}</p>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="py-24 md:py-32">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            Manifesto
          </Reveal>
          <h2 className="h-display text-white text-4xl md:text-6xl">
            Non siamo<br />
            <span className="stroke-text">in vendita</span>.<br />
            Il tuo brand<br />
            <span className="text-violet-500">sì</span>.
          </h2>
        </div>
        <div className="md:col-span-8 space-y-8 text-neutral-300 text-lg leading-relaxed">
          <Reveal>
            Lavoriamo con clienti, non con loghi. Selezioniamo i progetti su cui possiamo davvero
            fare la differenza. Diciamo no più spesso di quanto vorresti, e questa è la migliore
            garanzia che il sì lo prendiamo sul serio.
          </Reveal>
          <Reveal delay={0.1}>
            Il nostro metodo è iterativo: ipotesi, prototipo, test, dato, decisione. Niente
            piani strategici da 80 slide che muoiono in un cassetto. Solo macchine che girano.
          </Reveal>
          <Reveal delay={0.2}>
            Non ti vendiamo ore. Ti vendiamo risultati e relazione. Per questo siamo selettivi:
            non possiamo essere tutto per tutti, ma vogliamo essere tutto per pochi.
          </Reveal>
        </div>
      </div>
    </section>

    <section className="py-24 md:py-32 bg-black border-t border-white/5 text-center">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10">
        <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6 inline-flex items-center gap-2 justify-center">
          <MapPin size={12} /> Sede · Cattolica (RN)
        </Reveal>
        <h2 className="h-display text-white text-4xl md:text-[7vw] leading-[0.9]">
          <RevealLines lines={["dalla riviera,", <span key="2" className="stroke-text-violet">per chiunque.</span>]} />
        </h2>
        <Reveal delay={0.3} className="mt-10 inline-flex">
          <Link
            to="/contatti"
            data-testid="about-cta"
            className="inline-flex items-center gap-3 px-8 py-5 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-sm hover:bg-violet-500 hover:text-white transition-colors"
          >
            Vieni a trovarci <ArrowUpRight size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  </>
);

export default ChiSiamoPage;
