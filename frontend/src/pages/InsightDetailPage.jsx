import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUpRight, ArrowLeft, Loader2 } from "lucide-react";
import SEOHead from "../components/SEOHead";
import useLocale from "../hooks/useLocale";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InsightDetailPage = () => {
  const { slug } = useParams();
  const { t, r, locale } = useLocale();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    axios
      .get(`${API}/articles/${slug}?locale=${locale}`)
      .then((res) => setArticle(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, locale]);

  if (loading) {
    return (
      <section className="min-h-[60vh] grid place-items-center">
        <Loader2 size={28} className="animate-spin text-violet-400" />
      </section>
    );
  }

  if (notFound || !article) {
    return (
      <section className="min-h-[60vh] grid place-items-center px-5">
        <div className="text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-4">404</p>
          <h1 className="h-display text-4xl md:text-6xl text-white">{locale === "en" ? "Article not found" : "Articolo non trovato"}</h1>
          <Link to={r.insights} className="mt-8 inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-xs font-mono uppercase tracking-[0.24em] hover:border-violet-500 hover:text-violet-400">
            <ArrowLeft size={14} /> {t.nav.insights}
          </Link>
        </div>
      </section>
    );
  }

  const altPath = locale === "it" ? `/en/insights/${slug}` : `/insights/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Organization", name: article.author },
    datePublished: article.published_at,
    publisher: { "@type": "Organization", name: "not4sale", logo: { "@type": "ImageObject", url: "https://not4.sale/og.png" } },
    keywords: article.tags.join(", "),
    inLanguage: locale === "en" ? "en" : "it"
  };

  return (
    <>
      <SEOHead
        title={article.title}
        description={article.excerpt}
        path={r.insightDetail(slug)}
        type="article"
        ogKicker={t.nav.insights}
        ogTitle={article.title}
        jsonLd={jsonLd}
        locale={locale}
        alternatePath={altPath}
        keywords={article.tags.join(", ")}
      />

      <article className="relative pt-40 pb-24 md:pt-48 md:pb-32 grain">
        <div className="max-w-[900px] mx-auto px-5 md:px-10">
          <Link to={r.insights} className="text-[10px] font-mono uppercase tracking-[0.32em] text-violet-400 mb-8 inline-flex items-center gap-2 hover:text-white">
            <ArrowLeft size={12} /> {t.nav.insights}
          </Link>

          <h1 className="h-display text-white text-5xl sm:text-6xl md:text-7xl mb-6 text-balance" data-testid="insight-title">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-2xl text-violet-400 mb-10">{article.subtitle}</p>
          )}

          <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-500 border-y border-white/10 py-4 mb-12">
            <span>{article.author}</span>
            <span>·</span>
            <span>{article.read_minutes} {t.common.readMin}</span>
            <span>·</span>
            <span>{new Date(article.published_at).toLocaleDateString(locale === "en" ? "en-US" : "it-IT", { year: "numeric", month: "short", day: "numeric" })}</span>
          </div>

          <div className="prose prose-invert prose-violet max-w-none article-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content_md}</ReactMarkdown>
          </div>

          <div className="mt-16 pt-10 border-t border-white/10 flex flex-wrap gap-2">
            {article.tags.map((tg) => (
              <span key={tg} className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-400 border border-white/10 px-3 py-1.5">{tg}</span>
            ))}
          </div>

          <div className="mt-16 border border-violet-500/30 p-8 md:p-10 bg-violet-900/10">
            <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-violet-400 mb-3">
              {locale === "en" ? "Like what you read?" : "Ti è piaciuto?"}
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-none mb-6">
              {locale === "en" ? "Let's apply this to your brand." : "Applichiamolo al tuo brand."}
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link to={r.quote} className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-white font-display font-bold uppercase tracking-[0.18em] text-xs hover:bg-violet-400 transition-colors" data-testid="insight-cta-quote">
                {t.hero.ctaQuote} <ArrowUpRight size={14} />
              </Link>
              <Link to={r.contact} className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-display font-bold uppercase tracking-[0.18em] text-xs hover:border-violet-500 hover:text-violet-400 transition-colors" data-testid="insight-cta-contact">
                {t.common.letsTalk} <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default InsightDetailPage;
