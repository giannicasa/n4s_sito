import React from "react";
import { Link } from "react-router-dom";

export const Logo = ({ size = "md", className = "", asLink = true }) => {
  const sizes = {
    sm: "text-base tracking-[0.18em]",
    md: "text-xl tracking-[0.22em]",
    lg: "text-3xl md:text-5xl tracking-[0.18em]",
    xl: "text-[18vw] tracking-[0.05em] leading-none"
  };
  const inner = (
    <span
      className={`font-display font-black uppercase inline-flex items-baseline gap-[0.15em] ${sizes[size]} ${className}`}
      data-testid="brand-logo"
    >
      <span className="text-violet-500" aria-hidden="true">[</span>
      <span className="text-white">NOT4SALE</span>
      <span className="text-violet-500" aria-hidden="true">]</span>
    </span>
  );
  if (!asLink) return inner;
  return (
    <Link to="/" aria-label="not4sale homepage" data-testid="brand-logo-link">
      {inner}
    </Link>
  );
};

export default Logo;
