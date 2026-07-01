"use client";

import { useState } from "react";
import Link from "next/link";
import LogoBadge from "@/components/landing/LogoBadge";
import StatusBadge from "@/components/StatusBadge";
import OtpStep from "@/components/registrazione/OtpStep";
import ChipSelect from "@/components/registrazione/ChipSelect";
import { createClient } from "@/lib/supabase/client";
import { SUBJECTS, DAYS, TIME_SLOTS } from "@/lib/constants";

type Step = "form" | "otp" | "done";

export default function RegistrazioneTutorPage() {
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || subjects.length === 0 || !address.trim() || !price) {
      setError("Nome, email, almeno una materia, luogo e prezzo sono obbligatori.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setError("Non riesco a inviare il codice. Controlla l'email e riprova.");
      return;
    }
    setStep("otp");
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

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      user_type: "tutor",
      full_name: fullName,
      avatar_url: avatarUrl,
    });

    const { error: detailsError } = await supabase.from("tutor_details").insert({
      profile_id: userId,
      subjects,
      address,
      days,
      time_slots: timeSlots,
      price_per_hour: Number(price),
      bio: bio || null,
      whatsapp: whatsapp || null,
    });

    setLoading(false);
    if (profileError || detailsError) {
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">
              Registrati come tutor
            </h1>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Nome e cognome
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
                placeholder="Giulia Bianchi"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
                placeholder="giulia@esempio.it"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Numero WhatsApp (privato, serve solo per la verifica)
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
                placeholder="333 1234567"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Foto profilo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#0A2027]">Materie che insegni</span>
              <ChipSelect options={SUBJECTS} selected={subjects} onChange={setSubjects} />
            </div>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Dove fai ripetizioni (indirizzo o zona)
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
                placeholder="Via Roma 10, Udine"
              />
              <span className="text-xs font-normal text-[#0A2027]/50">
                Nel prossimo passo aggiungiamo anche la posizione GPS sulla mappa.
              </span>
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#0A2027]">Giorni disponibili</span>
              <ChipSelect options={DAYS} selected={days} onChange={setDays} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#0A2027]">Fasce orarie</span>
              <ChipSelect options={TIME_SLOTS} selected={timeSlots} onChange={setTimeSlots} />
            </div>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Prezzo all&apos;ora (€)
              <input
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
                placeholder="15"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Presentazione breve
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
                placeholder="Studente di ingegneria, aiuto con matematica e fisica da 3 anni..."
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
              Il tuo profilo è stato creato ed è in fase di verifica. Ti avviseremo appena sarà
              approvato e visibile agli studenti.
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
