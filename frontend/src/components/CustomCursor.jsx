import React, { useEffect, useRef, useState } from "react";

// Custom violet cursor (desktop only)
export const CustomCursor = () => {
  const dot = useRef(null);
  const ring = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-hide");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
      }
    };

    const onDown = () => {
      if (ring.current) ring.current.style.transform += " scale(0.7)";
    };
    const onUp = () => {
      // recompute base transform on next move
    };

    const onOver = (e) => {
      const t = e.target;
      if (!ring.current) return;
      const interactive = t.closest && t.closest('a, button, [role="button"], input, textarea, select, [data-cursor="hover"]');
      ring.current.dataset.state = interactive ? "hover" : "idle";
    };

    let raf;
    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseover", onOver);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.classList.remove("cursor-hide");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dot}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9998] pointer-events-none w-2 h-2 rounded-full bg-white mix-blend-difference"
      />
      <div
        ref={ring}
        aria-hidden="true"
        data-state="idle"
        className="fixed top-0 left-0 z-[9998] pointer-events-none w-9 h-9 rounded-full border border-violet-500 transition-[width,height,border-color,opacity] duration-200 data-[state=hover]:border-white data-[state=hover]:w-14 data-[state=hover]:h-14 data-[state=hover]:-ml-2.5 data-[state=hover]:-mt-2.5"
        style={{ boxShadow: "0 0 24px -4px rgba(157,76,221,0.5)" }}
      />
    </>
  );
};

export default CustomCursor;
