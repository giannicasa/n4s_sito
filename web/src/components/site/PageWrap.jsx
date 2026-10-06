"use client";
import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/**
 * Wraps page content with:
 *  - Scroll-to-top on route change (Lenis intercetta lo scroll nativo).
 *  - A short top progress bar shown during route transitions.
 *  - A fade-in mount animation (no AnimatePresence/exit — avoids React 19
 *    "removeChild" reconciliation conflicts with nested motion children).
 */
export const PageWrap = ({ children }) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPath = useRef(pathname);
  // Alla prima pagina il contenuto arriva già renderizzato dal server: niente fade,
  // altrimenti resterebbe invisibile fino all'idratazione.
  const firstRender = useRef(true);
  useEffect(() => {
    firstRender.current = false;
  }, []);

  const scrollTop = () => {
    // Try Lenis first (it intercepts window.scrollTo). Fall back to native.
    const lenis = window.__lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
    window.scrollTo(0, 0);
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setLoading(true);
      scrollTop();
      requestAnimationFrame(scrollTop);
      const t1 = setTimeout(scrollTop, 60);
      const t2 = setTimeout(() => setLoading(false), 550);

      // GTM/GA4 pageview per la navigazione client: al tick successivo
      // document.title è già quello della nuova pagina.
      const t3 = setTimeout(() => {
        if (typeof window === "undefined") return;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "page_view",
          page_path: pathname,
          page_location: window.location.href,
          page_title: document.title,
        });
      }, 80);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [pathname]);

  return (
    <>
      {/* Top progress bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-[100] h-[2px] bg-violet-500/0 pointer-events-none ${
          loading ? "opacity-100" : "opacity-0"
        } transition-opacity duration-200`}
        data-testid="page-loading-bar"
      >
        <motion.div
          key={pathname + (loading ? "-on" : "-off")}
          className="h-full bg-violet-500 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: loading ? 1 : 1 }}
          transition={{ duration: 0.55, ease: [0.2, 0.65, 0.2, 1] }}
        />
      </div>

      <motion.div
        key={pathname}
        initial={firstRender.current ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.65, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageWrap;
