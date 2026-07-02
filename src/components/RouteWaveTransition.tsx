"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const BUBBLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 29 + 7) % 100,
  size: 6 + (i % 5) * 4,
  delay: (i % 7) * 0.05,
  duration: 0.55 + (i % 4) * 0.12,
}));

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
    const timeout = setTimeout(() => setPlaying(false), 780);
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
          transition={{ duration: 0.78, times: [0, 0.34, 0.55, 1], ease: [0.65, 0, 0.35, 1] }}
        >
          {/* onda di fondo (più chiara, sfalsata) per dare profondità */}
          <svg
            className="absolute inset-x-0 top-0 -mt-6 h-16 w-full md:h-24"
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0,110 C220,40 420,180 680,110 C920,50 1140,180 1440,100 L1440,200 L0,200 Z"
              fill="#22D3EE"
              opacity="0.55"
            />
          </svg>

          {/* onda principale */}
          <svg
            className="-mb-px h-16 w-full flex-shrink-0 md:h-24"
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0,90 C180,190 360,10 540,90 C720,190 900,10 1080,90 C1260,190 1440,10 1440,90 L1440,200 L0,200 Z"
              fill="#06B6D4"
            />
          </svg>

          {/* corpo dell'acqua con bolle che salgono */}
          <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-[#06B6D4] to-[#0891b2]">
            {BUBBLES.map((b, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-white/45"
                style={{ left: `${b.left}%`, width: b.size, height: b.size, bottom: -20 }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: "-115vh", opacity: [0, 0.7, 0] }}
                transition={{ duration: b.duration + 0.5, delay: 0.2 + b.delay, ease: "easeOut" }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
