"use client";

import { motion } from "framer-motion";
import Bubbles from "./Bubbles";
import SharkMascot from "./SharkMascot";

type IntroOverlayProps = {
  onDone: () => void;
};

export default function IntroOverlay({ onDone }: IntroOverlayProps) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: ["100%", "0%", "0%", "115%"] }}
      transition={{ duration: 2.6, times: [0, 0.22, 0.75, 1], ease: "easeInOut" }}
      onAnimationComplete={onDone}
      className="fixed inset-0 z-50 flex flex-col"
    >
      <svg
        className="-mb-px h-10 w-full flex-shrink-0 md:h-16"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,100 L0,100 Z"
          fill="#06B6D4"
        />
      </svg>
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 bg-[#06B6D4]">
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
