"use client";

import { motion } from "framer-motion";

type WaveLayerProps = {
  className?: string;
  fill: string;
  opacity?: number;
  duration?: number;
  reverse?: boolean;
};

export default function WaveLayer({
  className = "",
  fill,
  opacity = 1,
  duration = 10,
  reverse = false,
}: WaveLayerProps) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 ${className}`}
      style={{ width: "200%" }}
      animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 2880 200" width="100%" height="100%" preserveAspectRatio="none">
        <path
          d="M0,90 C180,170 360,10 540,90 C720,170 900,10 1080,90 C1260,170 1440,10 1440,90 C1620,170 1800,10 1980,90 C2160,170 2340,10 2520,90 C2700,170 2880,10 2880,90 L2880,200 L0,200 Z"
          fill={fill}
          opacity={opacity}
        />
      </svg>
    </motion.div>
  );
}
