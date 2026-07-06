"use client";

import { useState } from "react";
import Link from "next/link";
import LogoBadge from "@/components/landing/LogoBadge";
import { createClient } from "@/lib/supabase/client";

export default function AccediPage() {
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
      // Nessun "next": dopo il click sul link la pagina "completa" capisce
      // se sei tutor o studente e ti manda nell'area giusta.
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#06B6D4] to-[#0891b2] px-6 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <LogoBadge size={32} />
        <span className="font-heading text-xl font-extrabold text-white">Squalo</span>
      </Link>

      <div className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/80 p-6 text-center shadow-2xl backdrop-blur-xl">
        {sent ? (
          <>
            <span className="text-4xl">📬</span>
            <h1 className="mt-2 font-heading text-xl font-extrabold text-[#0A2027]">
              Controlla l&apos;email
            </h1>
            <p className="mt-1 text-sm text-[#0A2027]/70">
              Ti abbiamo mandato un link a <span className="font-semibold">{email}</span>. Cliccalo
              per entrare.
            </p>
            <p className="mt-2 text-xs text-[#0A2027]/50">
              Apri il link nello stesso browser dove stai leggendo.
            </p>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <span className="text-4xl">🦈</span>
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">Accedi a Squalo</h1>
            <p className="text-sm text-[#0A2027]/60">
              Inserisci la tua email: ti mandiamo un link per entrare. Vale sia per studenti che per
              tutor.
            </p>
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
              {loading ? "Invio…" : "Invia link di accesso"}
            </button>
          </form>
        )}
      </div>

      {!sent && (
        <div className="mt-5 flex flex-col items-center gap-1 text-sm text-white/90">
          <span>Non hai ancora un account?</span>
          <div className="flex gap-4">
            <Link href="/registrazione/studente" className="font-semibold underline">
              Registrati come studente
            </Link>
            <Link href="/registrazione/tutor" className="font-semibold underline">
              come tutor
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
