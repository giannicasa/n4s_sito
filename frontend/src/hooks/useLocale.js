import { useLocation } from "react-router-dom";
import { DICT, ROUTES, PATH_MAP } from "../i18n/dict";

export const useLocale = () => {
  const location = useLocation();
  const locale = location.pathname.startsWith("/en") ? "en" : "it";
  const t = DICT[locale];
  const r = ROUTES[locale];
  // Get the equivalent path in the other locale (for the language switcher)
  let switchTo;
  if (locale === "it") {
    switchTo = PATH_MAP.it_to_en[location.pathname];
    if (!switchTo) {
      // for dynamic routes like /servizi/:slug — service slugs are shared
      if (location.pathname.startsWith("/servizi/")) {
        switchTo = "/en/services/" + location.pathname.replace("/servizi/", "");
      } else if (location.pathname.startsWith("/insights/")) {
        // article slugs differ between locales — fallback to hub
        switchTo = "/en/insights";
      } else {
        switchTo = "/en";
      }
    }
  } else {
    switchTo = PATH_MAP.en_to_it[location.pathname];
    if (!switchTo) {
      if (location.pathname.startsWith("/en/services/")) {
        switchTo = "/servizi/" + location.pathname.replace("/en/services/", "");
      } else if (location.pathname.startsWith("/en/insights/")) {
        switchTo = "/insights";
      } else {
        switchTo = "/";
      }
    }
  }
  return { locale, t, r, switchTo };
};

export default useLocale;
