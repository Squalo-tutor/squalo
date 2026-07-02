"use client";

import { useState } from "react";
import Link from "next/link";
import LogoBadge from "@/components/landing/LogoBadge";
import StatusBadge from "@/components/StatusBadge";
import OtpStep from "@/components/registrazione/OtpStep";
import { createClient } from "@/lib/supabase/client";

type Step = "form" | "otp" | "done";

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
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) {
        setError(`Non riesco a inviare il codice: ${error.message}`);
        return;
      }
      setStep("otp");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Errore imprevisto: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerified(userId: string) {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    let avatarUrl: string | null = null;
    if (photo) {
      const ext = photo.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, photo, { upsert: true });
      if (!uploadError) {
        avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      user_type: "studente",
      full_name: fullName,
      phone: phone || null,
      avatar_url: avatarUrl,
    });

    setLoading(false);
    if (insertError) {
      setError("Registrazione quasi completa, ma il profilo non si è salvato. Riprova.");
      return;
    }
    setStep("done");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06B6D4] to-[#0891b2] px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 pb-8">
        <Link href="/" className="flex items-center gap-2">
          <LogoBadge size={32} />
          <span className="font-heading text-xl font-extrabold text-white">Squalo</span>
        </Link>
      </div>

      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-xl">
        {step === "form" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">
              Registrati come studente
            </h1>
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
              className="mt-2 rounded-full bg-[#06B6D4] px-6 py-3 font-heading font-bold text-white disabled:opacity-40"
            >
              {loading ? "Invio…" : "Continua"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <div className="flex flex-col gap-4">
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">
              Conferma la tua email
            </h1>
            <OtpStep email={email} onVerified={handleVerified} />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">
              Benvenuto/a, {fullName}! 🦈
            </h1>
            <StatusBadge status="in_verifica" />
            <p className="text-sm text-[#0A2027]/70">
              Il tuo account è stato creato. Presto potrai cercare tutor vicino a te.
            </p>
            <Link
              href="/"
              className="rounded-full bg-[#0A2027] px-6 py-3 font-heading font-bold text-white"
            >
              Torna alla home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
