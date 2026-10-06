"use client";
import { createContext, useContext } from "react";

// Dati del CMS condivisi da tutto il sito (macro-aree e dati aziendali),
// caricati una volta nel layout server e passati ai componenti client.
const SiteDataContext = createContext({ areas: [], company: null });

export const SiteDataProvider = ({ value, children }) => (
  <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
);

export const useSiteData = () => useContext(SiteDataContext);

export const companyAddress = (company, locale = "it") =>
  company
    ? `${company.address}, ${company.cap} ${company.city} (${company.province}), ${locale === "en" ? "Italy" : "Italia"}`
    : "";
