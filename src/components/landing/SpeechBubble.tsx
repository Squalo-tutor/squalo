"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TAGLINES = [
  "Tutto è recuperabile",
  "Un brutto voto non ti definisce",
  "Si riparte sempre da dove sei",
  "Ogni 4 si rimette in mare",
  "Anche i grandi squali partono piccoli",
  "Vai sotto? Ti ripeschiamo noi",
  "Ce la puoi fare, davvero",
  "Mate ostica? La mordiamo insieme",
  "Non fare il pesce, studia",
  "O studi, o ti mordo",
  "Mangio integrali a colazione",
  "Nuota, non affogare in mate",
];

type SpeechBubbleProps = {
  onLineChange?: () => void;
  className?: string;
};

export default function SpeechBubble({ onLineChange, className = "" }: SpeechBubbleProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % TAGLINES.length);
      onLineChange?.();
    }, 5000);
    return () => clearInterval(id);
  }, [onLineChange]);

  return (
    <div
      className={`relative min-w-[220px] max-w-[280px] rounded-2xl bg-white px-5 py-3 shadow-lg ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="text-center font-heading font-bold text-[#0A2027]"
        >
          {TAGLINES[index]}
        </motion.p>
      </AnimatePresence>
      <span className="absolute -bottom-2 left-10 h-4 w-4 rotate-45 bg-white" />
    </div>
  );
}
