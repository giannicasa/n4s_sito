import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowUpRight, Loader2 } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { Reveal, RevealLines } from "../components/Reveal";
import useLocale from "../hooks/useLocale";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InsightsHubPage = () => {
  const { t, r, locale } = useLocale();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/articles?locale=${locale}`)
      .then((res) => setArticles(res.data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [locale]);

  return (
    <>
      <SEOHead
        title={locale === "en" ? "Insights · long-form thoughts" : "Insights · pensieri long-form"}
        description={t.insights.body}
        path={r.insights}
        ogKicker={t.nav.insights}
        ogTitle={t.insights.headlineLines.join(" ")}
        locale={locale}
        alternatePath={locale === "it" ? "/en/insights" : "/insights"}
      />

      <section className="relative pt-40 pb-16 md:pt-56 md:pb-24 grain">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <Reveal className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-6">
            {t.insights.kicker}
          </Reveal>
          <h1 className="h-display text-white text-6xl sm:text-8xl md:text-[11vw]" data-testid="insights-headline">
            <RevealLines lines={[t.insights.headlineLines[0], <span key="2" className="text-violet-500">{t.insights.headlineLines[1]}</span>]} />
          </h1>
          <Reveal delay={0.3} className="mt-12 max-w-3xl text-lg md:text-xl text-neutral-300 leading-relaxed">
            {t.insights.body}
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-violet-400">
              <Loader2 size={28} className="animate-spin" />
            </div>
          ) : articles.length === 0 ? (
            <p className="text-neutral-400 py-24 text-center">
              {locale === "en" ? "No articles yet." : "Ancora nessun articolo."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
              {articles.map((a, idx) => (
                <Link
                  key={a.id}
                  to={r.insightDetail(a.slug)}
                  data-testid={`insight-card-${a.slug}`}
                  className="group p-8 md:p-12 bg-ink hover:bg-violet-900/10 transition-colors flex flex-col"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 mb-8">
                    <span className="text-violet-400">N4S · {String(idx + 1).padStart(2, "0")}</span>
                    <span>{a.read_minutes} {t.common.readMin}</span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-none tracking-tight text-white mb-4 group-hover:text-violet-400 transition-colors">
                    {a.title}
                  </h2>
                  {a.subtitle && <p className="text-violet-400 mb-4">{a.subtitle}</p>}
                  <p className="text-neutral-400 leading-relaxed mb-8 flex-1">{a.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {a.tags.map((tg) => (
                        <span key={tg} className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-400 border border-white/10 px-2 py-1">{tg}</span>
                      ))}
                    </div>
                    <ArrowUpRight size={20} className="text-neutral-600 group-hover:text-violet-400 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default InsightsHubPage;
