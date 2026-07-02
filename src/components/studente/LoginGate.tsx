"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Login "leggero" via link magico. Usato dove serve essere collegati
// (es. i messaggi) ma l'utente non lo è ancora.
export default function LoginGate({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setError(`Non riesco a inviare l'email: ${error.message}`);
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-cyan-50 to-white px-6">
      <div className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/75 p-6 text-center shadow-xl backdrop-blur-xl">
        {sent ? (
          <>
            <span className="text-4xl">📬</span>
            <h1 className="mt-2 font-heading text-xl font-bold text-[#0A2027]">Controlla l&apos;email</h1>
            <p className="mt-1 text-sm text-[#0A2027]/70">
              Ti abbiamo mandato un link a <span className="font-semibold">{email}</span>. Cliccalo
              per entrare.
            </p>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <span className="text-4xl">🦈</span>
            <h1 className="font-heading text-xl font-bold text-[#0A2027]">Accedi per i messaggi</h1>
            <p className="text-sm text-[#0A2027]/60">Inserisci la tua email: ti mandiamo un link.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mario@esempio.it"
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#06B6D4]"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#06B6D4] px-6 py-3 font-heading font-bold text-white disabled:opacity-40"
            >
              {loading ? "Invio…" : "Invia link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
