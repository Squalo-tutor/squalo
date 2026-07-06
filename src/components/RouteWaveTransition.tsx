"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

// Bolle sparse su tutto lo schermo: salgono dal basso "invadendo" la vista
// (stile cartone animato) e poi si ritirano scoprendo la nuova pagina.
const BUBBLES = Array.from({ length: 30 }, (_, i) => {
  const left = (i * 53 + 11) % 100;
  const top = (i * 71 + 7) % 100;
  const size = 12 + ((i * 7) % 22); // vmax
  const dx = left - 50;
  const dy = 100 - top;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const delay = (dist / 160) * 0.28;
  return { left, top, size, delay };
});

// Bollicine decorative più piccole che continuano a salire.
const FIZZ = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 29 + 5) % 100,
  size: 5 + (i % 5) * 4,
  delay: 0.15 + (i % 8) * 0.04,
  duration: 0.6 + (i % 4) * 0.15,
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
    const timeout = setTimeout(() => setPlaying(false), 1000);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          key="route-bubbles"
          data-testid="route-wave"
          className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          {/* riempimento cyan opaco SUBITO: nasconde la pagina nuova finché
              l'animazione non finisce, poi si scopre solo alla fine */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-[#22D3EE] to-[#0891b2]"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 1, 1, 0] }}
            transition={{ duration: 1, times: [0, 0.5, 0.66, 1], ease: "easeInOut" }}
          />

          {/* bagliore centrale morbido a metà transizione */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.5), rgba(255,255,255,0) 62%)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.7, 0], scale: [0.6, 1.1, 1.3] }}
            transition={{ duration: 1, times: [0, 0.5, 1], ease: "easeInOut" }}
          />

          {/* bolle grandi che invadono e poi si ritirano */}
          {BUBBLES.map((b, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${b.left}%`,
                top: `${b.top}%`,
                width: `${b.size}vmax`,
                height: `${b.size}vmax`,
                translate: "-50% -50%",
                background:
                  "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), rgba(34,211,238,0.95) 45%, #0891b2 100%)",
                boxShadow: "inset 0 0 12px rgba(255,255,255,0.4)",
              }}
              initial={{ scale: 0, y: 60, opacity: 0 }}
              animate={{ scale: [0, 1.25, 1.25, 0], y: [60, 0, 0, -40], opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 0.9,
                delay: b.delay,
                times: [0, 0.4, 0.62, 1],
                ease: "easeInOut",
              }}
            />
          ))}

          {/* bollicine frizzanti */}
          {FIZZ.map((f, i) => (
            <motion.span
              key={`f-${i}`}
              className="absolute rounded-full border border-white/50 bg-white/30"
              style={{ left: `${f.left}%`, width: f.size, height: f.size, bottom: -20 }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: "-110vh", opacity: [0, 0.8, 0] }}
              transition={{ duration: f.duration + 0.5, delay: f.delay, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
