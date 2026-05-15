import { useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_BASE = "https://not4.sale";

// Imperative head manager — React 19 compatible.
// Tracks tags it has added so it can clean them up on unmount or route change.
const MARK = "data-n4s-seo";

const setMeta = (selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    const tag = selector.startsWith("link") ? "link" : "meta";
    el = document.createElement(tag);
    el.setAttribute(MARK, "1");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    el.setAttribute(k, String(v));
  });
  return el;
};

const setJsonLd = (id, data) => {
  let el = document.head.querySelector(`script[type="application/ld+json"][${MARK}="${id}"]`);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute(MARK, id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

const cleanupAdded = () => {
  document.head.querySelectorAll(`[${MARK}]`).forEach((el) => el.remove());
};

export const SEOHead = ({
  title,
  description,
  path = "/",
  type = "website",
  jsonLd,
  keywords,
  ogTitle,
  ogKicker,
  locale = "it",
  alternatePath
}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} · not4sale` : "not4sale — Marketing fuori dal coro · Cattolica";
    const url = `${SITE_BASE}${path}`;

    const ogParams = new URLSearchParams();
    ogParams.set("title", ogTitle || title || "not4sale");
    if (description) ogParams.set("subtitle", description.slice(0, 120));
    if (ogKicker) ogParams.set("kicker", ogKicker);
    const ogImage = `${BACKEND_URL}/api/og?${ogParams.toString()}`;

    document.title = fullTitle;
    document.documentElement.setAttribute("lang", locale);

    // Clear previous dynamic tags
    cleanupAdded();

    // Basic meta
    if (description) setMeta('meta[name="description"]', { name: "description", content: description });
    if (keywords) setMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
    setMeta('link[rel="canonical"]', { rel: "canonical", href: url });

    // hreflang
    if (alternatePath) {
      const el = document.createElement("link");
      el.setAttribute("rel", "alternate");
      el.setAttribute("hreflang", locale === "it" ? "en" : "it");
      el.setAttribute("href", `${SITE_BASE}${alternatePath}`);
      el.setAttribute(MARK, "1");
      document.head.appendChild(el);
    }
    const xd = document.createElement("link");
    xd.setAttribute("rel", "alternate");
    xd.setAttribute("hreflang", "x-default");
    xd.setAttribute("href", `${SITE_BASE}${path}`);
    xd.setAttribute(MARK, "1");
    document.head.appendChild(xd);

    // Open Graph
    setMeta('meta[property="og:type"]', { property: "og:type", content: type });
    setMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    if (description) setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:url"]', { property: "og:url", content: url });
    setMeta('meta[property="og:image"]', { property: "og:image", content: ogImage });
    setMeta('meta[property="og:image:width"]', { property: "og:image:width", content: "1200" });
    setMeta('meta[property="og:image:height"]', { property: "og:image:height", content: "630" });
    setMeta('meta[property="og:locale"]', { property: "og:locale", content: locale === "it" ? "it_IT" : "en_US" });
    setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "not4sale" });

    // Twitter
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    if (description) setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: ogImage });

    // JSON-LD
    if (jsonLd) setJsonLd("page", jsonLd);

    return () => {
      cleanupAdded();
    };
  }, [title, description, path, type, keywords, ogTitle, ogKicker, locale, alternatePath, jsonLd]);

  return null;
};

export default SEOHead;
