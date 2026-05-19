import React, { useEffect, useRef } from "react";
import Lenis from "lenis";

export const LenisProvider = ({ children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      smoothTouch: false,
      lerp: 0.08,
      wheelMultiplier: 1.0,
      wrapper: window,
      content: document.documentElement
    });
    ref.current = lenis;
    // Expose globally so route changes can reset scroll through Lenis.
    window.__lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      ref.current = null;
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
};

export default LenisProvider;
