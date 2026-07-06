"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import SharkMascot from "@/components/landing/SharkMascot";
import ChatOverlay from "@/components/landing/ChatOverlay";

export default function ChatFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Sulla home c'è già lo squaletto grande al centro; nel thread di una chat
  // coprirebbe la casella di scrittura. In quei casi lo nascondiamo.
  const inThread =
    /^\/studente\/messaggi\/.+/.test(pathname) || /^\/tutor\/richieste\/.+/.test(pathname);
  const hidden =
    pathname === "/" ||
    pathname.startsWith("/registrazione") ||
    pathname.startsWith("/auth") ||
    inThread;

  // Nelle aree con la barra in basso (studente e tutor) alziamo il bottone
  // così non ci finisce sopra.
  const inTabbedArea = pathname.startsWith("/studente") || pathname.startsWith("/tutor");
  const bottomClass = inTabbedArea ? "bottom-20" : "bottom-5";

  if (hidden) return null;

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        aria-label="Parla con Squalo"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.3 }}
        whileHover={{ scale: 1.09, rotate: -4 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed right-4 ${bottomClass} z-30 flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/85 shadow-[0_8px_24px_rgba(10,32,39,0.25)] backdrop-blur-md`}
      >
        <SharkMascot size={52} />
      </motion.button>
      <ChatOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
