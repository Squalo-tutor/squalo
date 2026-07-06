"use client";

import { motion } from "framer-motion";
import Bubbles from "./Bubbles";
import SeaLife from "./SeaLife";
import SharkMascot from "./SharkMascot";
import WaveLayer from "./WaveLayer";

type IntroOverlayProps = {
  onDone: () => void;
};

export default function IntroOverlay({ onDone }: IntroOverlayProps) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: ["100%", "0%", "0%", "115%"] }}
      transition={{ duration: 3, times: [0, 0.24, 0.8, 1], ease: [0.65, 0, 0.35, 1] }}
      onAnimationComplete={onDone}
      className="fixed inset-0 z-50 flex flex-col"
    >
      <svg
        className="-mb-px h-20 w-full flex-shrink-0 md:h-28"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,90 C180,190 360,10 540,90 C720,190 900,10 1080,90 C1260,190 1440,10 1440,90 L1440,200 L0,200 Z"
          fill="#22D3EE"
        />
      </svg>
      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden bg-gradient-to-b from-[#22D3EE] to-[#0891b2]">
        <SeaLife className="opacity-50" />
        <WaveLayer className="top-0 h-16 -translate-y-10" fill="white" opacity={0.12} duration={7} />
        <WaveLayer className="bottom-0 h-20 translate-y-8" fill="white" opacity={0.1} duration={9} reverse />
        <Bubbles count={16} />

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.15 }}
          className="relative"
        >
          <SharkMascot size={150} swimIn />
        </motion.div>

        <div className="relative flex flex-col items-center gap-1">
          <motion.p
            initial={{ opacity: 0, y: 12, letterSpacing: "0.3em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "-0.01em" }}
            transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
            className="font-heading text-5xl font-extrabold text-white drop-shadow md:text-6xl"
          >
            Squalo
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.5 }}
            className="text-sm font-semibold text-white/85"
          >
            Ripetizioni vicino a te
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
