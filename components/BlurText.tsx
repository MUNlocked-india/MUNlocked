"use client";

import { motion } from "motion/react";

export default function BlurText({
  text,
  as = "span",
  className,
  style,
  delay = 0,
  staggerMs = 60,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  staggerMs?: number;
}) {
  const words = text.split(" ");
  const Wrapper = as;

  return (
    <Wrapper className={className} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, filter: "blur(10px)", y: 12 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: delay / 1000 + (i * staggerMs) / 1000, ease: "easeOut" }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Wrapper>
  );
}
