"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Bubbles from "@/components/landing/Bubbles";
import IntroOverlay from "@/components/landing/IntroOverlay";
import SharkMascot from "@/components/landing/SharkMascot";
import SpeechBubble from "@/components/landing/SpeechBubble";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const [talking, setTalking] = useState(false);

  const handleLineChange = useCallback(() => {
    setTalking(true);
    setTimeout(() => setTalking(false), 900);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#06B6D4] to-[#0891b2]">
      <Bubbles count={10} className="opacity-40" />

      <header className="relative z-10 flex justify-center pt-8">
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
          <SharkMascot size={170} talking={talking} />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/registrazione/studente"
            className="rounded-full bg-[#0A2027] px-8 py-3 font-heading font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            Sono uno studente
          </Link>
          <Link
            href="/registrazione/tutor"
            className="rounded-full bg-white px-8 py-3 font-heading font-bold text-[#0A2027] shadow-lg transition-transform hover:scale-105"
          >
            Sono un tutor
          </Link>
        </div>
      </main>

      {!introDone && <IntroOverlay onDone={() => setIntroDone(true)} />}
    </div>
  );
}
