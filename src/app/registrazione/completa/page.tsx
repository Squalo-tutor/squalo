"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoBadge from "@/components/landing/LogoBadge";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import {
  base64ToFile,
  clearPendingRegistration,
  loadPendingRegistration,
} from "@/lib/pendingRegistration";
import { buildBookingMessage, clearPendingBooking, loadPendingBooking } from "@/lib/pendingBooking";

type State = "loading" | "done-registration" | "done-booking" | "done-none" | "error";

export default function RegistrazioneCompletaPage() {
  const [state, setState] = useState<State>("loading");
  const [name, setName] = useState("");
  const [tutorName, setTutorName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMsg("Non risultiamo collegati. Riapri il link ricevuto via email.");
        setState("error");
        return;
      }

      const pendingRegistration = loadPendingRegistration();
      if (pendingRegistration) {
        setName(pendingRegistration.fullName);

        let avatarUrl: string | null = null;
        if (pendingRegistration.photo) {
          const file = base64ToFile(
            pendingRegistration.photo.base64,
            pendingRegistration.photo.name,
            pendingRegistration.photo.type
          );
          const ext = pendingRegistration.photo.name.split(".").pop();
          const path = `${user.id}/avatar.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(path, file, { upsert: true });
          if (!uploadError) {
            avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
          }
        }

        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          user_type: pendingRegistration.userType,
          full_name: pendingRegistration.fullName,
          phone: pendingRegistration.userType === "studente" ? pendingRegistration.phone || null : null,
          avatar_url: avatarUrl,
        });

        let detailsError = null;
        if (pendingRegistration.userType === "tutor") {
          const res = await supabase.from("tutor_details").insert({
            profile_id: user.id,
            subjects: pendingRegistration.subjects,
            address: pendingRegistration.address,
            latitude: pendingRegistration.latitude,
            longitude: pendingRegistration.longitude,
            days: pendingRegistration.days,
            time_slots: pendingRegistration.timeSlots,
            price_per_hour: Number(pendingRegistration.price),
            bio: pendingRegistration.bio || null,
            whatsapp: pendingRegistration.whatsapp || null,
          });
          detailsError = res.error;
        }

        if (profileError || detailsError) {
          setErrorMsg("Account confermato, ma il profilo non si è salvato. Riprova la registrazione.");
          setState("error");
          return;
        }

        clearPendingRegistration();
        setState("done-registration");
        return;
      }

      const pendingBooking = loadPendingBooking();
      if (pendingBooking) {
        setTutorName(pendingBooking.tutorName);

        await supabase
          .from("profiles")
          .upsert({ id: user.id, user_type: "studente", full_name: pendingBooking.studentName });

        const { data: tutorRow } = await supabase
          .from("tutors_public")
          .select("address")
          .eq("id", pendingBooking.tutorId)
          .single();

        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .upsert(
            { student_id: user.id, tutor_id: pendingBooking.tutorId },
            { onConflict: "student_id,tutor_id" }
          )
          .select()
          .single();

        if (convError || !conversation) {
          setErrorMsg("Account confermato, ma la prenotazione non si è salvata. Riprova.");
          setState("error");
          return;
        }

        const { error: msgError } = await supabase.from("messages").insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: buildBookingMessage(pendingBooking, tutorRow?.address ?? null),
        });

        if (msgError) {
          setErrorMsg("Account confermato, ma il messaggio non è partito. Riprova.");
          setState("error");
          return;
        }

        clearPendingBooking();
        setState("done-booking");
        return;
      }

      setState("done-none");
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06B6D4] to-[#0891b2] px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 pb-8">
        <Link href="/" className="flex items-center gap-2">
          <LogoBadge size={32} />
          <span className="font-heading text-xl font-extrabold text-white">Squalo</span>
        </Link>
      </div>

      <div className="mx-auto max-w-md rounded-3xl border border-white/40 bg-white/75 p-6 text-center shadow-2xl backdrop-blur-xl">
        {state === "loading" && (
          <p className="text-[#0A2027]/70">Sto completando la registrazione…</p>
        )}
        {state === "done-registration" && (
          <div className="flex flex-col items-center gap-4">
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">
              {name ? `Benvenuto/a, ${name}! 🦈` : "Email confermata! 🦈"}
            </h1>
            <StatusBadge status="in_verifica" />
            <p className="text-sm text-[#0A2027]/70">
              Il tuo account è stato creato ed è in fase di verifica.
            </p>
            <Link
              href="/"
              className="rounded-full bg-[#0A2027] px-6 py-3 font-heading font-bold text-white"
            >
              Torna alla home
            </Link>
          </div>
        )}
        {state === "done-booking" && (
          <div className="flex flex-col items-center gap-4">
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">
              Richiesta inviata! 🦈
            </h1>
            <p className="text-sm text-[#0A2027]/70">
              {tutorName ? `${tutorName} riceverà` : "Il tutor riceverà"} la tua richiesta con tutti
              i dettagli.
            </p>
            <Link
              href="/studente/cerca"
              className="rounded-full bg-[#0A2027] px-6 py-3 font-heading font-bold text-white"
            >
              Torna alla ricerca
            </Link>
          </div>
        )}
        {state === "done-none" && (
          <div className="flex flex-col items-center gap-4">
            <h1 className="font-heading text-2xl font-extrabold text-[#0A2027]">Email confermata! 🦈</h1>
            <Link
              href="/"
              className="rounded-full bg-[#0A2027] px-6 py-3 font-heading font-bold text-white"
            >
              Torna alla home
            </Link>
          </div>
        )}
        {state === "error" && <p className="text-sm text-red-500">{errorMsg}</p>}
      </div>
    </div>
  );
}
