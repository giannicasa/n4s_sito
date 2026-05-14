import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SEOHead from "../components/SEOHead";

const NotFoundPage = () => (
  <>
    <SEOHead title="404 · Pagina non trovata" description="La pagina che cercavi non esiste." path="/404" />
    <section className="min-h-[100svh] grid place-items-center px-5 grain">
      <div className="text-center max-w-3xl">
        <p className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-4">
          Errore · 404
        </p>
        <h1 className="h-display text-white text-[30vw] md:text-[18vw] leading-none">
          <span className="text-violet-500">[</span>404<span className="text-violet-500">]</span>
        </h1>
        <p className="mt-8 text-lg text-neutral-300">
          La pagina che cerchi non esiste. O l'abbiamo già rottamata. Torna alla home.
        </p>
        <Link
          to="/"
          data-testid="404-home-link"
          className="mt-10 inline-flex items-center gap-3 px-8 py-5 bg-white text-black font-display font-bold uppercase tracking-[0.18em] text-sm hover:bg-violet-500 hover:text-white transition-colors"
        >
          Torna alla home <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  </>
);

export default NotFoundPage;
