import React from "react";
import { Helmet } from "react-helmet-async";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_BASE = "https://not4.sale";

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
  const fullTitle = title ? `${title} · not4sale` : "not4sale — Marketing fuori dal coro · Cattolica";
  const url = `${SITE_BASE}${path}`;

  // Build OG image URL via backend dynamic generator
  const ogParams = new URLSearchParams();
  ogParams.set("title", ogTitle || title || "not4sale");
  if (description) ogParams.set("subtitle", description.slice(0, 120));
  if (ogKicker) ogParams.set("kicker", ogKicker);
  const ogImage = `${BACKEND_URL}/api/og?${ogParams.toString()}`;

  return (
    <Helmet>
      <html lang={locale} />
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      {alternatePath && (
        <link rel="alternate" hrefLang={locale === "it" ? "en" : "it"} href={`${SITE_BASE}${alternatePath}`} />
      )}
      <link rel="alternate" hrefLang="x-default" href={`${SITE_BASE}${path}`} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={locale === "it" ? "it_IT" : "en_US"} />
      <meta property="og:site_name" content="not4sale" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
