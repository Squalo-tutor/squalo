"use client";

import { motion } from "framer-motion";

// Pesciolini doodle originali che nuotano attraverso lo schermo,
// più bolle d'aria che salgono. Puramente decorativo.

type Fish = {
  top: number; // % verticale
  size: number; // px
  duration: number; // s per attraversare
  delay: number;
  dir: 1 | -1; // 1 = verso destra, -1 = verso sinistra
  color: string;
};

const FISH: Fish[] = [
  { top: 16, size: 48, duration: 26, delay: 0, dir: 1, color: "#ffffff" },
  { top: 66, size: 36, duration: 32, delay: 5, dir: -1, color: "#A5F3FC" },
  { top: 42, size: 30, duration: 24, delay: 11, dir: 1, color: "#ffffff" },
  { top: 82, size: 42, duration: 36, delay: 3, dir: -1, color: "#67E8F9" },
  { top: 30, size: 24, duration: 22, delay: 15, dir: -1, color: "#CFFAFE" },
];

// Pesce doodle rivolto a destra (testa a destra, coda a sinistra).
function FishShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size * 0.66} viewBox="0 0 60 40" fill="none" aria-hidden>
      {/* coda */}
      <path d="M20 20 L2 8 L2 32 Z" fill={color} opacity="0.9" />
      {/* corpo */}
      <ellipse cx="33" cy="20" rx="18" ry="12" fill={color} opacity="0.9" />
      {/* pinna sopra */}
      <path d="M28 9 q6 -6 12 -1" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* occhio */}
      <circle cx="43" cy="16" r="2.6" fill="#0A2027" />
      {/* bocca */}
      <path d="M48 22 q3 2 0 4" stroke="#0A2027" strokeWidth="1.4" fill="none" opacity="0.5" />
    </svg>
  );
}

// Bolle d'aria che salgono in piccoli flussi.
const AIR = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 41 + 6) % 100,
  size: 5 + (i % 5) * 4,
  duration: 7 + (i % 5) * 2,
  delay: (i * 0.9) % 8,
}));

export default function SeaLife({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {FISH.map((f, i) => (
        <motion.div
          key={`fish-${i}`}
          className="absolute"
          style={{ top: `${f.top}%` }}
          initial={{ x: f.dir === 1 ? "-15vw" : "115vw" }}
          animate={{ x: f.dir === 1 ? "115vw" : "-15vw" }}
          transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            animate={{ y: [0, -10, 0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div style={{ transform: f.dir === -1 ? "scaleX(-1)" : "none" }}>
              <FishShape size={f.size} color={f.color} />
            </div>
          </motion.div>
        </motion.div>
      ))}

      {AIR.map((b, i) => (
        <motion.span
          key={`air-${i}`}
          className="absolute rounded-full border border-white/40 bg-white/25"
          style={{ left: `${b.left}%`, width: b.size, height: b.size, bottom: -20 }}
          animate={{ y: ["0%", "-115vh"], x: [0, 6, -6, 0], opacity: [0, 0.7, 0.7, 0] }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
