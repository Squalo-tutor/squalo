"use client";

import { useState } from "react";
import Link from "next/link";
import LogoBadge from "@/components/landing/LogoBadge";
import ChipSelect from "@/components/registrazione/ChipSelect";
import LocationPicker from "@/components/registrazione/LocationPicker";
import { createClient } from "@/lib/supabase/client";
import { SUBJECTS, DAYS, TIME_SLOTS } from "@/lib/constants";
import { fileToBase64, savePendingRegistration } from "@/lib/pendingRegistration";

type Step = "form" | "sent";

export default function RegistrazioneTutorPage() {
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [days, setDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || subjects.length === 0 || !price) {
      setError("Nome, email, almeno una materia e prezzo sono obbligatori.");
      return;
    }
    if (!address.trim() && !coords) {
      setError("Indica dove fai ripetizioni: scrivi l'indirizzo o usa il tasto posizione.");
      return;
    }
    setLoading(true);
    try {
      savePendingRegistration({
        userType: "tutor",
        fullName,
        whatsapp,
        photo: photo
          ? { name: photo.name, type: photo.type, base64: await fileToBase64(photo) }
          : undefined,
        subjects,
        address,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        days,
        timeSlots,
        price,
        bio,
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
    <div className="min-h-screen bg-gradient-to-b from-[#06B6D4] to-[#0891b2] px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 pb-8">
        <Link href="/" className="flex items-center gap-2">
          <LogoBadge size={32} />
          <span className="font-heading text-xl font-extrabold text-white">Squalo</span>
        </Link>
      </div>

      <div className="mx-auto max-w-md rounded-3xl border border-white/40 bg-white/75 p-6 shadow-2xl backdrop-blur-xl">
        {step === "form" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">
                Registrati come tutor
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

            <LocationPicker
              address={address}
              onAddressChange={setAddress}
              coords={coords}
              onCoordsChange={setCoords}
            />

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

        {step === "sent" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">
              Controlla la tua email 📩
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
