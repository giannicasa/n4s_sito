// Dati societari usati in footer e pagine legali.
export const COMPANY = {
  name: "NOT4SALE Srl",
  address: "Via Lungo Tavollo snc",
  cap: "47841",
  city: "Cattolica",
  province: "RN",
  country: { it: "Italia", en: "Italy" },
  // TODO: inserire la partita IVA reale appena disponibile
  piva: "",
  email: "hello@not4.sale",
};

export const companyFullAddress = (locale = "it") =>
  `${COMPANY.address}, ${COMPANY.cap} ${COMPANY.city} (${COMPANY.province}), ${COMPANY.country[locale]}`;

export default COMPANY;
