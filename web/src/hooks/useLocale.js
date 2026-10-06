"use client";
import { usePathname } from "next/navigation";
import { DICT, ROUTES, PATH_MAP } from "../i18n/dict";

// La lingua si deduce dal percorso: /en/... è inglese, il resto italiano.
// Gli slug di servizi e articoli sono uguali nelle due lingue, quindi lo switch è diretto.
export const switchPath = (pathname) => {
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  if (isEn) {
    if (PATH_MAP.en_to_it[pathname]) return PATH_MAP.en_to_it[pathname];
    if (pathname.startsWith("/en/services/")) return "/servizi/" + pathname.slice("/en/services/".length);
    if (pathname.startsWith("/en/blog/category/")) return "/blog/categoria/" + pathname.slice("/en/blog/category/".length);
    if (pathname.startsWith("/en/blog/")) return "/blog/" + pathname.slice("/en/blog/".length);
    return "/";
  }
  if (PATH_MAP.it_to_en[pathname]) return PATH_MAP.it_to_en[pathname];
  if (pathname.startsWith("/servizi/")) return "/en/services/" + pathname.slice("/servizi/".length);
  if (pathname.startsWith("/blog/categoria/")) return "/en/blog/category/" + pathname.slice("/blog/categoria/".length);
  if (pathname.startsWith("/blog/")) return "/en/blog/" + pathname.slice("/blog/".length);
  return "/en";
};

export const useLocale = () => {
  const pathname = usePathname() || "/";
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "it";
  return { locale, t: DICT[locale], r: ROUTES[locale], switchTo: switchPath(pathname), pathname };
};

export default useLocale;
