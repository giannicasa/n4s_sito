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
      wheelMultiplier: 1.0
    });
    ref.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      ref.current = null;
    };
  }, []);

  return <>{children}</>;
};

export default LenisProvider;
