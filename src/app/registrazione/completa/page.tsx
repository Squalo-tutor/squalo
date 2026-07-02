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

type State = "loading" | "done" | "error";

export default function RegistrazioneCompletaPage() {
  const [state, setState] = useState<State>("loading");
  const [name, setName] = useState("");
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

      const pending = loadPendingRegistration();
      if (!pending) {
        setState("done");
        return;
      }

      setName(pending.fullName);

      let avatarUrl: string | null = null;
      if (pending.photo) {
        const file = base64ToFile(pending.photo.base64, pending.photo.name, pending.photo.type);
        const ext = pending.photo.name.split(".").pop();
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
        user_type: pending.userType,
        full_name: pending.fullName,
        phone: pending.userType === "studente" ? pending.phone || null : null,
        avatar_url: avatarUrl,
      });

      let detailsError = null;
      if (pending.userType === "tutor") {
        const res = await supabase.from("tutor_details").insert({
          profile_id: user.id,
          subjects: pending.subjects,
          address: pending.address,
          days: pending.days,
          time_slots: pending.timeSlots,
          price_per_hour: Number(pending.price),
          bio: pending.bio || null,
          whatsapp: pending.whatsapp || null,
        });
        detailsError = res.error;
      }

      if (profileError || detailsError) {
        setErrorMsg("Account confermato, ma il profilo non si è salvato. Riprova la registrazione.");
        setState("error");
        return;
      }

      clearPendingRegistration();
      setState("done");
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

      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 text-center shadow-xl">
        {state === "loading" && (
          <p className="text-[#0A2027]/70">Sto completando la registrazione…</p>
        )}
        {state === "done" && (
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
        {state === "error" && <p className="text-sm text-red-500">{errorMsg}</p>}
      </div>
    </div>
  );
}
