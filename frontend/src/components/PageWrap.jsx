import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Wraps page content with:
 *  - Scroll-to-top on route change.
 *  - A short top progress bar shown during route transitions.
 *  - A fade-in mount animation (no AnimatePresence/exit — avoids React 19
 *    "removeChild" reconciliation conflicts with nested motion children).
 */
export const PageWrap = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const prevPath = useRef(location.pathname);

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
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      setLoading(true);
      scrollTop();
      // Lenis can intercept the first call before the new route mounts;
      // schedule a second reset on next frame and after a short delay so
      // it lands after the Suspense fallback resolves.
      requestAnimationFrame(scrollTop);
      const t1 = setTimeout(scrollTop, 60);
      const t2 = setTimeout(() => setLoading(false), 550);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [location.pathname]);

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
          key={location.pathname + (loading ? "-on" : "-off")}
          className="h-full bg-violet-500 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: loading ? 1 : 1 }}
          transition={{ duration: 0.55, ease: [0.2, 0.65, 0.2, 1] }}
        />
      </div>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.65, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageWrap;
