"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type OtpStepProps = {
  email: string;
  onVerified: (userId: string) => void;
};

export default function OtpStep({ email, onVerified }: OtpStepProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function verify() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    setLoading(false);
    if (error || !data.user) {
      setError("Codice non valido o scaduto. Riprova.");
      return;
    }
    onVerified(data.user.id);
  }

  async function resend() {
    setError(null);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({ email });
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#0A2027]/70">
        Ti abbiamo inviato un codice a 6 cifre a <span className="font-semibold">{email}</span>.
        Controlla anche lo spam.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456"
        inputMode="numeric"
        maxLength={6}
        className="rounded-xl border border-black/10 px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-[#06B6D4]"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={verify}
        disabled={loading || code.trim().length < 6}
        className="rounded-full bg-[#06B6D4] px-6 py-3 font-heading font-bold text-white disabled:opacity-40"
      >
        {loading ? "Verifico…" : "Conferma codice"}
      </button>
      <button
        type="button"
        onClick={resend}
        className="text-sm text-[#0A2027]/60 underline underline-offset-2"
      >
        {resent ? "Codice reinviato!" : "Non l'ho ricevuto, invia di nuovo"}
      </button>
    </div>
  );
}
