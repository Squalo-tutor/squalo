"use client";

import { motion } from "framer-motion";

type SharkMascotProps = {
  size?: number;
  talking?: boolean;
  swimIn?: boolean;
  className?: string;
};

export default function SharkMascot({
  size = 160,
  talking = false,
  swimIn = false,
  className = "",
}: SharkMascotProps) {
  return (
    <motion.div
      initial={swimIn ? { x: -240, opacity: 0 } : { opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: "easeOut", delay: swimIn ? 0.25 : 0 }}
      className={className}
      style={{ width: size, height: size * 0.78 }}
    >
      <motion.svg
        viewBox="0 0 220 160"
        width="100%"
        height="100%"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* white motion swoosh under the shark */}
        <path
          d="M25 118 C 70 132, 130 132, 175 116"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />

        {/* tail */}
        <motion.path
          d="M158 62 L204 34 L188 70 L204 96 L158 78 Z"
          fill="#cfe9f3"
          style={{ transformOrigin: "160px 68px" }}
          animate={{ rotate: [-8, 8, -8] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* dorsal fin */}
        <path d="M96 20 L118 66 L74 66 Z" fill="#bcdce7" />

        {/* body */}
        <ellipse cx="100" cy="80" rx="76" ry="46" fill="url(#sharkBody)" />

        {/* eye */}
        <circle cx="72" cy="70" r="13" fill="#0A2027" />
        <circle cx="76.5" cy="65.5" r="4.5" fill="white" />
        <motion.ellipse
          cx="72"
          cy="70"
          rx="13"
          ry="13"
          fill="#eaf6fb"
          style={{ transformOrigin: "72px 70px" }}
          animate={{ scaleY: [0, 0, 1, 0, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.9, 0.94, 0.98, 1],
            ease: "easeInOut",
          }}
        />

        {/* mouth + teeth */}
        <motion.g
          style={{ transformOrigin: "95px 92px" }}
          animate={
            talking
              ? { scaleY: [1, 1.6, 0.9, 1.4, 1] }
              : { scaleY: 1 }
          }
          transition={{ duration: 0.6, repeat: talking ? Infinity : 0, ease: "easeInOut" }}
        >
          <path
            d="M62 84 Q95 106 132 82"
            stroke="#0A2027"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M88 96 L96 88 L100 98 Z" fill="white" />
          <path d="M102 97 L108 88 L114 96 Z" fill="white" />
        </motion.g>

        <defs>
          <linearGradient id="sharkBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4fbfd" />
            <stop offset="100%" stopColor="#cfe9f3" />
          </linearGradient>
        </defs>
      </motion.svg>
    </motion.div>
  );
}
