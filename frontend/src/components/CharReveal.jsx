import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Letter-by-letter reveal driven by ScrollTrigger.
 *
 * Each line can be:
 *   - a string  → rendered as plain characters
 *   - an array of segments: [{ text, highlight: true }] → mix colors inline
 *
 * Usage:
 *   <CharReveal lines={[
 *     "NON SIAMO",
 *     "IN VENDITA.",
 *     [{ text: "IL TUO BRAND", highlight: true }, { text: " SÌ." }]
 *   ]} />
 */
export const CharReveal = ({
  lines = [],
  className = "",
  charClassName = "",
  highlightClassName = "text-violet-500",
  stagger = 0.025,
  duration = 0.9,
  start = "top 85%",
  as: Tag = "p",
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
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [lines, stagger, duration, start]);

  const ariaLabel = lines
    .map((l) => (typeof l === "string" ? l : l.map((s) => s.text).join("")))
    .join(" ");

  const renderSegment = (text, highlight, segKey) => (
    <span
      key={segKey}
      className={`inline-block ${highlight ? highlightClassName : ""}`}
      aria-hidden="true"
    >
      {Array.from(text).map((ch, i) => (
        <span
          key={`${segKey}-${i}`}
          data-char
          className={`inline-block ${charClassName}`}
          style={{ whiteSpace: ch === " " ? "pre" : "normal" }}
        >
          {ch}
        </span>
      ))}
    </span>
  );

  return (
    <Tag ref={ref} className={className} aria-label={ariaLabel}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block overflow-hidden">
          {typeof line === "string"
            ? renderSegment(line, false, `l${lineIdx}`)
            : line.map((seg, si) =>
                renderSegment(seg.text, !!seg.highlight, `l${lineIdx}-s${si}`)
              )}
        </span>
      ))}
    </Tag>
  );
};

export default CharReveal;
