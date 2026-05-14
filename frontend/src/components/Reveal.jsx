import React from "react";
import { motion } from "framer-motion";

// Staggered line/word/char reveal
export const Reveal = ({ children, delay = 0, y = 24, className = "", as: Tag = "div" }) => {
  const MotionTag = motion[Tag] || motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.65, 0.2, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
};

// Inner motion.spans live inside overflow-hidden parents so whileInView's
// IntersectionObserver can be flaky. Fire on mount instead — they're always
// inside a parent that may or may not be in view, but they animate quickly
// after layout.
export const RevealLines = ({ lines, className = "", baseDelay = 0 }) => (
  <span className={className}>
    {lines.map((line, i) => (
      <span key={i} className="block overflow-hidden">
        <motion.span
          className="block"
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 0.9, delay: baseDelay + i * 0.08, ease: [0.2, 0.65, 0.2, 1] }}
        >
          {line}
        </motion.span>
      </span>
    ))}
  </span>
);

export default Reveal;
