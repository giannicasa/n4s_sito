import React from "react";
import { motion } from "framer-motion";

// Staggered line/word/char reveal — fires when element scrolls into view
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

// Line-by-line "curtain" reveal that triggers when the parent enters the viewport.
// Uses whileInView with amount: 0 so the IntersectionObserver fires reliably even when
// inner spans live inside overflow-hidden parents.
export const RevealLines = ({ lines, className = "", baseDelay = 0 }) => (
  <span className={className}>
    {lines.map((line, i) => (
      <span key={i} className="block overflow-hidden">
        <motion.span
          className="block"
          initial={{ y: "110%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.95, delay: baseDelay + i * 0.08, ease: [0.2, 0.65, 0.2, 1] }}
        >
          {line}
        </motion.span>
      </span>
    ))}
  </span>
);

export default Reveal;
