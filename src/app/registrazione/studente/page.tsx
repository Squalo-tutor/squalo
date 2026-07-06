"use client";

import { useState } from "react";
import Link from "next/link";
import LogoBadge from "@/components/landing/LogoBadge";
import SeaLife from "@/components/landing/SeaLife";
import { createClient } from "@/lib/supabase/client";
import { fileToBase64, savePendingRegistration } from "@/lib/pendingRegistration";

type Step = "form" | "sent";

export default function RegistrazioneStudentePage() {
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim()) {
      setError("Nome ed email sono obbligatori.");
      return;
    }
    setLoading(true);
    try {
      savePendingRegistration({
        userType: "studente",
        fullName,
        phone,
        photo: photo
          ? { name: photo.name, type: photo.type, base64: await fileToBase64(photo) }
          : undefined,
      });

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(`Non riesco a inviare l'email: ${error.message}`);
        return;
      }
      setStep("sent");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Errore imprevisto: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#06B6D4] to-[#0891b2] px-6 py-10">
      <SeaLife className="opacity-50" />
      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center gap-2 pb-8">
        <Link href="/" className="flex items-center gap-2">
          <LogoBadge size={32} />
          <span className="font-heading text-xl font-extrabold text-white">Squalo</span>
        </Link>
      </div>

      <div className="animate-rise relative z-10 mx-auto max-w-md rounded-3xl border border-white/40 bg-white/75 p-6 shadow-2xl backdrop-blur-xl">
        {step === "form" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">
                Registrati come studente
              </h1>
              <p className="mt-1 text-sm text-[#0A2027]/60">
                Hai già un account?{" "}
                <Link href="/accedi" className="font-semibold text-[#06B6D4] underline">
                  Accedi
                </Link>
              </p>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Nome e cognome
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
                placeholder="Mario Rossi"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
                placeholder="mario@esempio.it"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Telefono (facoltativo)
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
                placeholder="333 1234567"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Foto profilo (facoltativa)
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 rounded-full px-6 py-3 font-heading font-extrabold disabled:opacity-40"
            >
              {loading ? "Invio…" : "Continua"}
            </button>
          </form>
        )}

        {step === "sent" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="animate-pop text-5xl">📩</span>
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">
              Controlla la tua email
            </h1>
            <p className="text-sm text-[#0A2027]/70">
              Ti abbiamo mandato un&apos;email a <span className="font-semibold">{email}</span>.
              Apri il messaggio e clicca il link per confermare (controlla anche lo spam).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
