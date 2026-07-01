"use client";

import { motion } from "framer-motion";

type BubblesProps = {
  count?: number;
  className?: string;
};

export default function Bubbles({ count = 12, className = "" }: BubblesProps) {
  const bubbles = Array.from({ length: count }, (_, i) => {
    const left = (i * 37) % 100;
    const size = 6 + (i % 5) * 3;
    const duration = 4 + (i % 4);
    const delay = (i * 0.6) % 5;
    return { left, size, duration, delay };
  });

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {bubbles.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/40"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            bottom: -20,
          }}
          animate={{ y: ["0%", "-120vh"], opacity: [0, 0.6, 0] }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
