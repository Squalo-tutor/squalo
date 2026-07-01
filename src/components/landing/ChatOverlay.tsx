"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SharkMascot from "./SharkMascot";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatOverlayProps = {
  open: boolean;
  onClose: () => void;
};

const FUNNY_ERRORS = [
  "Ho la bocca piena di plancton, un secondo... 🐟 Riprova tra poco!",
  "Segnale debole qui sott'acqua, puoi ripetere?",
  "Uh oh, ho sbattuto contro uno scoglio. Riprova!",
  "Sto nuotando troppo veloce per rispondere, aspetta un attimo!",
  "Le onde stanno disturbando la linea... riprova tra poco!",
  "Anche gli squali hanno le loro giornate no. Riprova!",
  "Mmm, non ti ho sentito bene tra le bolle. Ridimmelo?",
  "Un polpo mi ha rubato la connessione. Un secondo!",
];

function randomFunnyError() {
  return FUNNY_ERRORS[Math.floor(Math.random() * FUNNY_ERRORS.length)];
}

export default function ChatOverlay({ open, onClose }: ChatOverlayProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Ciao! Sono Squalo 🦈 Chiedimi quello che vuoi, ci sono!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (data.error) {
        console.error("Chat API error:", data.error);
      }
      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.text ?? randomFunnyError() },
      ]);
    } catch (err) {
      console.error("Chat network error:", err);
      setMessages([...nextMessages, { role: "assistant", content: randomFunnyError() }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end justify-center bg-[#0A2027]/40 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[560px] sm:rounded-3xl"
          >
            <div className="flex items-center gap-3 bg-[#06B6D4] px-4 py-3">
              <SharkMascot size={44} talking={loading} />
              <div className="flex-1">
                <p className="font-heading font-bold text-white">Squalo</p>
                <p className="text-xs text-white/80">Sempre pronto ad aiutarti</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Chiudi chat"
                className="rounded-full p-1 text-white/90 hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-[#0A2027] text-white"
                      : "bg-cyan-50 text-[#0A2027]"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="max-w-[60%] rounded-2xl bg-cyan-50 px-3 py-2 text-sm text-[#0A2027]/60">
                  Sto pensando…
                </div>
              )}
            </div>

            <div className="border-t border-black/5 bg-cyan-50/60 px-4 py-2 text-center text-xs text-[#0A2027]/70">
              🐬 Presto: con <span className="font-bold">Squalo Premium</span> avrai priorità nelle
              richieste ai tutor migliori, chat senza limiti e potrai anche mandare foto.
            </div>

            <div className="flex items-center gap-2 border-t border-black/5 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Scrivi un messaggio…"
                className="flex-1 rounded-full bg-black/5 px-4 py-2 text-sm text-[#0A2027] outline-none focus:ring-2 focus:ring-[#06B6D4]"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="rounded-full bg-[#06B6D4] px-4 py-2 text-sm font-heading font-bold text-white disabled:opacity-40"
              >
                Invia
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
