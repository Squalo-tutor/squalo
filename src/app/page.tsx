"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Bubbles from "@/components/landing/Bubbles";
import ChatOverlay from "@/components/landing/ChatOverlay";
import DoodleCharacter, { DoodlePosition } from "@/components/landing/DoodleCharacter";
import IntroOverlay from "@/components/landing/IntroOverlay";
import LogoBadge from "@/components/landing/LogoBadge";
import SharkMascot from "@/components/landing/SharkMascot";
import SpeechBubble from "@/components/landing/SpeechBubble";
import WaveLayer from "@/components/landing/WaveLayer";

const DOODLE_POSITIONS: DoodlePosition[] = ["left", "bottom", "right", "top"];

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const [talking, setTalking] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [doodleIndex, setDoodleIndex] = useState(0);
  const [doodleVisible, setDoodleVisible] = useState(false);

  const handleLineChange = useCallback(() => {
    setTalking(true);
    setTimeout(() => setTalking(false), 900);
  }, []);

  useEffect(() => {
    if (!introDone) return;
    const id = setInterval(() => {
      setDoodleIndex((i) => (i + 1) % DOODLE_POSITIONS.length);
      setDoodleVisible(true);
      setTimeout(() => setDoodleVisible(false), 3200);
    }, 10000);
    return () => clearInterval(id);
  }, [introDone]);

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#06B6D4] to-[#0891b2]">
      <Bubbles count={10} className="opacity-40" />
      <WaveLayer className="bottom-0 h-24 md:h-32" fill="white" opacity={0.08} duration={14} />
      <WaveLayer className="bottom-0 h-16 md:h-20" fill="white" opacity={0.14} duration={10} reverse />

      <header className="relative z-10 flex items-center justify-center gap-2 pt-8">
        <LogoBadge size={34} />
        <span className="font-heading text-2xl font-extrabold text-white">Squalo</span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12 text-center">
        <div className="max-w-xl">
          <h1 className="font-heading text-4xl font-extrabold leading-tight text-white md:text-5xl">
            Il tuo tutor a due passi.
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Trovi tutor di ogni materia vicino a te, ovunque tu sia.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <SpeechBubble onLineChange={handleLineChange} className="mb-2" />
          <button
            onClick={() => setChatOpen(true)}
            aria-label="Parla con Squalo"
            className="cursor-pointer"
          >
            <SharkMascot size={170} talking={talking} />
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/studente/cerca"
            className="rounded-full border border-white/40 bg-[#0A2027]/70 px-8 py-3 font-heading font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_24px_rgba(10,32,39,0.35)] backdrop-blur-md transition-transform hover:scale-105"
          >
            Sono uno studente
          </Link>
          <Link
            href="/registrazione/tutor"
            className="rounded-full border border-white/60 bg-white/30 px-8 py-3 font-heading font-bold text-[#0A2027] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_8px_24px_rgba(10,32,39,0.15)] backdrop-blur-md transition-transform hover:scale-105"
          >
            Sono un tutor
          </Link>
        </div>
      </main>

      {!introDone && <IntroOverlay onDone={() => setIntroDone(true)} />}
      <DoodleCharacter position={DOODLE_POSITIONS[doodleIndex]} visible={doodleVisible} />
      <ChatOverlay open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
