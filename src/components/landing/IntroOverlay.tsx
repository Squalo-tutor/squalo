"use client";

import { motion } from "framer-motion";
import Bubbles from "./Bubbles";
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
      transition={{ duration: 2.9, times: [0, 0.26, 0.78, 1], ease: "easeInOut" }}
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
          fill="#06B6D4"
        />
      </svg>
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden bg-[#06B6D4]">
        <WaveLayer className="top-0 h-16 -translate-y-10" fill="white" opacity={0.12} duration={7} />
        <WaveLayer className="bottom-0 h-20 translate-y-8" fill="white" opacity={0.1} duration={9} reverse />
        <Bubbles count={14} />
        <SharkMascot size={150} swimIn />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl"
        >
          Squalo
        </motion.p>
      </div>
    </motion.div>
  );
}
