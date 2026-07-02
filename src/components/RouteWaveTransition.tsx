"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function RouteWaveTransition() {
  const pathname = usePathname();
  const [playing, setPlaying] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPlaying(true);
    const timeout = setTimeout(() => setPlaying(false), 750);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          key="route-wave"
          data-testid="route-wave"
          className="pointer-events-none fixed inset-0 z-[200] flex flex-col"
          initial={{ y: "100%" }}
          animate={{ y: ["100%", "0%", "0%", "-100%"] }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.75, times: [0, 0.32, 0.55, 1], ease: "easeInOut" }}
        >
          <svg
            className="-mb-px h-14 w-full flex-shrink-0 md:h-20"
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0,90 C180,190 360,10 540,90 C720,190 900,10 1080,90 C1260,190 1440,10 1440,90 L1440,200 L0,200 Z"
              fill="#06B6D4"
            />
          </svg>
          <div className="flex-1 bg-gradient-to-b from-[#06B6D4] to-[#0891b2]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
