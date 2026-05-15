import React, { useEffect, useRef, isValidElement } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Generic block reveal — fires when element scrolls into view
export const Reveal = ({ children, delay = 0, y = 32, className = "", as: Tag = "div", amount = 0.2 }) => {
  const MotionTag = motion[Tag] || motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.65, 0.2, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
};

// --- helpers for the cinematic CharReveal-based RevealLines ----------------

// Flatten a React node tree into [{ text, className }] segments, preserving
// the className inherited from any ancestor <span>.
function flatten(node, inheritedClass = "") {
  if (node == null || typeof node === "boolean") return [];
  if (typeof node === "string" || typeof node === "number") {
    return [{ text: String(node), className: inheritedClass }];
  }
  if (Array.isArray(node)) return node.flatMap((n) => flatten(n, inheritedClass));
  if (isValidElement(node)) {
    const own = node.props?.className || "";
    const merged = [inheritedClass, own].filter(Boolean).join(" ");
    return flatten(node.props.children, merged);
  }
  return [];
}

// Split each segment into word / space tokens. Words become non-breaking
// inline-block containers (so chars can animate together), spaces become
// plain text nodes that let the browser line-wrap normally.
function tokenize(segments) {
  const tokens = [];
  segments.forEach((seg) => {
    let buf = "";
    let mode = null;
    for (const ch of seg.text) {
      const m = ch === " " ? "space" : "word";
      if (mode === null) {
        mode = m;
        buf = ch;
        continue;
      }
      if (m === mode) buf += ch;
      else {
        tokens.push({ type: mode, text: buf, className: seg.className });
        buf = ch;
        mode = m;
      }
    }
    if (buf) tokens.push({ type: mode, text: buf, className: seg.className });
  });
  return tokens;
}

/**
 * Cinematic line + char reveal. Drop-in replacement for the old RevealLines —
 * same API (lines = array of strings/React nodes) but animates each character
 * with a staggered translateY + fade driven by GSAP ScrollTrigger.
 */
export const RevealLines = ({
  lines,
  className = "",
  baseDelay = 0,
  stagger = 0.03,
  duration = 0.95,
  start = "top 90%",
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll("[data-char]");
    if (!chars.length) return;

    gsap.set(chars, { yPercent: 110, opacity: 0 });

    const ctx = gsap.context(() => {
      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        duration,
        ease: "power3.out",
        stagger,
        delay: baseDelay,
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      });
    }, el);

    // Refresh in case fonts / layout shift after mount
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 50);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [lines, stagger, duration, start, baseDelay]);

  const ariaLabel = lines
    .map((l) =>
      flatten(l)
        .map((s) => s.text)
        .join("")
    )
    .join(" ");

  return (
    <span ref={ref} className={className} aria-label={ariaLabel}>
      {lines.map((line, lineIdx) => {
        const tokens = tokenize(flatten(line));
        return (
          <span key={lineIdx} className="block overflow-hidden" aria-hidden="true">
            {tokens.map((tok, ti) => {
              if (tok.type === "space") {
                return <React.Fragment key={ti}>{tok.text}</React.Fragment>;
              }
              return (
                <span
                  key={ti}
                  className={`inline-block ${tok.className || ""}`}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {Array.from(tok.text).map((ch, ci) => (
                    <span key={ci} data-char className="inline-block">
                      {ch}
                    </span>
                  ))}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
};

export default Reveal;
