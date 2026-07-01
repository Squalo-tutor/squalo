"use client";

import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion";

export type DoodlePosition = "left" | "right" | "bottom" | "top";

const VARIANTS: Record<
  DoodlePosition,
  { hidden: TargetAndTransition; visible: TargetAndTransition; wrapper: string }
> = {
  left: {
    hidden: { x: -70, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    wrapper: "left-0 top-1/2 -translate-y-1/2",
  },
  right: {
    hidden: { x: 70, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    wrapper: "right-0 top-1/2 -translate-y-1/2",
  },
  bottom: {
    hidden: { y: 70, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    wrapper: "bottom-0 left-1/2 -translate-x-1/2",
  },
  top: {
    hidden: { y: -70, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    wrapper: "right-8 top-0 md:right-16",
  },
};

function DoodleFace() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="22" stroke="#0A2027" strokeWidth="2.5" fill="white" />
      <path d="M14 22 Q22 8 34 12" stroke="#0A2027" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="30" r="2.2" fill="#0A2027" />
      <circle cx="40" cy="30" r="2.2" fill="#0A2027" />
      <path d="M23 40 Q32 47 41 40" stroke="#0A2027" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M46 20 L54 10" stroke="#0A2027" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

type DoodleCharacterProps = {
  position: DoodlePosition;
  visible: boolean;
};

export default function DoodleCharacter({ position, visible }: DoodleCharacterProps) {
  const v = VARIANTS[position];
  const bubbleSide = position === "right" || position === "top" ? "right" : "left";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={v.hidden}
          animate={v.visible}
          exit={v.hidden}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`pointer-events-none fixed z-30 flex items-center gap-2 ${v.wrapper} ${
            bubbleSide === "right" ? "flex-row-reverse" : ""
          }`}
        >
          <DoodleFace />
          <div className="whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-sm font-heading font-bold text-[#0A2027] shadow-md">
            Tocca lo Squaletto!
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
