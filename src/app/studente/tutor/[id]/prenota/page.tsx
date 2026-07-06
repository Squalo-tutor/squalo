"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import LogoBadge from "@/components/landing/LogoBadge";
import SeaLife from "@/components/landing/SeaLife";
import LocationPicker from "@/components/registrazione/LocationPicker";
import { createClient } from "@/lib/supabase/client";
import { savePendingBooking, buildBookingMessage, type PendingBooking } from "@/lib/pendingBooking";
import type { TutorPublic } from "@/lib/types";

type Mode = "vado_dal_tutor" | "tutor_viene_da_me";
type Step = "form" | "sent" | "done";

export default function PrenotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);

  const [tutor, setTutor] = useState<TutorPublic | null>(null);
  const [loadingTutor, setLoadingTutor] = useState(true);

  const [step, setStep] = useState<Step>("form");
  const [day, setDay] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState<Mode>("vado_dal_tutor");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [note, setNote] = useState("");

  const [needsAuth, setNeedsAuth] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("tutors_public").select("*").eq("id", id).single();
      setTutor(data as TutorPublic | null);
      setLoadingTutor(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setNeedsAuth(!user);
    })();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!day || !timeSlot || !subject) {
      setError("Scegli giorno, fascia oraria e materia.");
      return;
    }
    if (mode === "tutor_viene_da_me" && !address.trim() && !coords) {
      setError("Indica dove vuoi la lezione (indirizzo o posizione GPS).");
      return;
    }
    if (needsAuth && (!studentName.trim() || !email.trim())) {
      setError("Nome ed email sono obbligatori per confermare la prenotazione.");
      return;
    }

    setLoading(true);
    try {
      const booking: PendingBooking = {
        tutorId: id,
        tutorName: tutor?.full_name ?? "",
        studentName,
        day,
        timeSlot,
        subject,
        mode,
        location: mode === "tutor_viene_da_me" ? { address, lat: coords?.lat, lng: coords?.lng } : undefined,
        note,
      };

      const supabase = createClient();

      if (needsAuth) {
        savePendingBooking(booking);
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (otpError) {
          setError(`Non riesco a inviare l'email: ${otpError.message}`);
          return;
        }
        setStep("sent");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessione scaduta, ricarica la pagina e riprova.");
        return;
      }

      await supabase
        .from("profiles")
        .update({ full_name: studentName || undefined })
        .eq("id", user.id);

      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .upsert({ student_id: user.id, tutor_id: id }, { onConflict: "student_id,tutor_id" })
        .select()
        .single();

      if (convError || !conversation) {
        setError("Non riesco a creare la conversazione. Riprova.");
        return;
      }

      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: buildBookingMessage(booking, tutor?.address ?? null),
      });

      if (msgError) {
        setError("Prenotazione quasi fatta, ma il messaggio non è partito. Riprova.");
        return;
      }

      setConversationId(conversation.id);
      setStep("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Errore imprevisto: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  if (loadingTutor) {
    return <div className="flex h-full items-center justify-center text-[#0A2027]/50">Carico…</div>;
  }
  if (!tutor) {
    return <div className="flex h-full items-center justify-center text-[#0A2027]/50">Tutor non trovato.</div>;
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">Prenota gratis</h1>
              <p className="text-sm text-[#0A2027]/60">con {tutor.full_name}</p>
            </div>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Giorno
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
              >
                <option value="">Scegli…</option>
                {tutor.days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Fascia oraria
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
              >
                <option value="">Scegli…</option>
                {tutor.time_slots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Materia
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
              >
                <option value="">Scegli…</option>
                {tutor.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#0A2027]">Dove</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("vado_dal_tutor")}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${
                    mode === "vado_dal_tutor"
                      ? "border-[#06B6D4] bg-cyan-50 text-[#0A2027]"
                      : "border-black/10 text-[#0A2027]/60"
                  }`}
                >
                  Vado dal tutor
                </button>
                <button
                  type="button"
                  onClick={() => setMode("tutor_viene_da_me")}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${
                    mode === "tutor_viene_da_me"
                      ? "border-[#06B6D4] bg-cyan-50 text-[#0A2027]"
                      : "border-black/10 text-[#0A2027]/60"
                  }`}
                >
                  Il tutor viene da me
                </button>
              </div>
              {mode === "vado_dal_tutor" && tutor.address && (
                <p className="text-xs text-[#0A2027]/50">📍 {tutor.address}</p>
              )}
              {mode === "tutor_viene_da_me" && (
                <LocationPicker
                  address={address}
                  onAddressChange={setAddress}
                  coords={coords}
                  onCoordsChange={setCoords}
                />
              )}
            </div>

            <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
              Cosa ti deve insegnare? (facoltativo)
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
                placeholder="Es. derivate e integrali, ho la verifica venerdì"
              />
            </label>

            {needsAuth && (
              <div className="flex flex-col gap-3 rounded-xl bg-cyan-50/60 p-3">
                <p className="text-xs text-[#0A2027]/60">
                  Per confermare ci servono nome ed email (creiamo il tuo account studente).
                </p>
                <label className="flex flex-col gap-1 text-sm font-medium text-[#0A2027]">
                  Il tuo nome
                  <input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
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
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary shine relative overflow-hidden rounded-full px-6 py-3.5 font-heading font-extrabold disabled:opacity-40"
            >
              {loading ? "Invio…" : "Conferma prenotazione 🦈"}
            </button>
          </form>
        )}

        {step === "sent" && (
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">Controlla la tua email 📬</h1>
            <p className="text-sm text-[#0A2027]/70">
              Ti abbiamo mandato un link a <span className="font-semibold">{email}</span>. Clicca il
              link per confermare e completare la prenotazione.
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">Richiesta inviata! 🦈</h1>
            <p className="text-sm text-[#0A2027]/70">
              {tutor.full_name} riceverà la tua richiesta con tutti i dettagli. Continua a
              scrivergli nella chat.
            </p>
            <Link
              href={conversationId ? `/studente/messaggi/${conversationId}` : "/studente/messaggi"}
              className="rounded-full bg-[#0A2027] px-6 py-3 font-heading font-bold text-white"
            >
              Vai alla chat
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
