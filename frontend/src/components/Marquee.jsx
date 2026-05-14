import React from "react";

// Infinite horizontal marquee using duplicated content
export const Marquee = ({ items = [], speed = "normal", className = "" }) => {
  const cls = speed === "fast" ? "animate-marquee-fast" : "animate-marquee";
  return (
    <div className={`marquee whitespace-nowrap ${className}`} aria-hidden="true">
      <div className={`flex gap-16 ${cls}`}>
        {[...items, ...items].map((it, i) => (
          <span key={i} className="inline-flex items-center gap-6 text-white/70">
            <span className="font-display text-4xl md:text-6xl font-black uppercase tracking-tight">
              {it}
            </span>
            <span className="text-violet-500 text-2xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
