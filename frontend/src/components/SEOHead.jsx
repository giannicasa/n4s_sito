import React from "react";
import { Helmet } from "react-helmet-async";

export const SEOHead = ({
  title,
  description,
  path = "/",
  type = "website",
  jsonLd,
  keywords
}) => {
  const base = "https://not4.sale";
  const fullTitle = title ? `${title} · not4sale` : "not4sale — Marketing fuori dal coro · Cattolica";
  const url = `${base}${path}`;
  return (
    <Helmet>
      <html lang="it" />
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="it_IT" />
      <meta property="og:site_name" content="not4sale" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
