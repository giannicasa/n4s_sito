import React, { useEffect, useState } from "react";

/**
 * Cinematic progressive loader shown as a Suspense fallback during route
 * code-split bundle fetch. Progresses asymptotically toward 90%, then
 * unmounts when the page mounts (Suspense replaces it with the real page).
 */
export const PageLoader = () => {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      // Asymptotic curve toward ~92%: fast start, slow tail.
      const next = 92 * (1 - Math.exp(-elapsed / 0.9));
      setProgress((p) => (next > p ? next : p));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[80] bg-black flex flex-col items-center justify-center"
      data-testid="page-loader"
    >
      <div className="relative w-full max-w-[1600px] px-5 md:px-10">
        {/* Wordmark stays static, the bar underneath is the action */}
        <div className="flex items-end justify-between mb-6">
          <div className="font-display font-black uppercase tracking-tight text-white text-2xl md:text-4xl leading-none">
            <span className="text-violet-500">[</span>NOT4SALE<span className="text-violet-500">]</span>
          </div>
          <div
            className="font-mono text-[10px] md:text-xs uppercase tracking-[0.32em] text-neutral-500"
            data-testid="page-loader-percent"
          >
            {Math.round(progress).toString().padStart(3, "0")}%
          </div>
        </div>

        {/* Progress track */}
        <div className="relative h-px w-full bg-white/10 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-violet-500 transition-[width] duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Sub-label */}
        <div className="mt-6 flex items-center justify-between text-[10px] md:text-xs font-mono uppercase tracking-[0.32em] text-neutral-500">
          <span>caricamento · loading</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
            cattolica · italia
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
