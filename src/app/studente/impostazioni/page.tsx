"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoginGate from "@/components/studente/LoginGate";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: "studente" | "tutor" | null;
};

type State = "loading" | "needs-auth" | "ready";

export default function ImpostazioniPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState("needs-auth");
        return;
      }
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, user_type")
        .eq("id", user.id)
        .single();

      const p = (data as Profile | null) ?? {
        id: user.id,
        full_name: null,
        avatar_url: null,
        user_type: null,
      };
      setProfile(p);
      setName(p.full_name ?? "");
      setState("ready");
    })();
  }, []);

  async function saveName() {
    if (!profile) return;
    setSavingName(true);
    setNameSaved(false);
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", profile.id);
    setSavingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  }

  async function sendFeedback() {
    if (!profile || !feedback.trim()) return;
    setSendingFeedback(true);
    setFeedbackError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("feedback")
      .insert({ user_id: profile.id, message: feedback.trim() });
    setSendingFeedback(false);
    if (error) {
      setFeedbackError("Non è partito il feedback. Riprova più tardi.");
      return;
    }
    setFeedback("");
    setFeedbackDone(true);
    setTimeout(() => setFeedbackDone(false), 3500);
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (state === "loading") {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-b from-cyan-50 to-white text-[#0A2027]/50">
        Carico…
      </div>
    );
  }

  if (state === "needs-auth") {
    return <LoginGate next="/studente/impostazioni" title="Accedi alle impostazioni" />;
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-cyan-50 to-white">
      <div className="sticky top-0 z-10 border-b border-white/40 bg-white/70 px-4 py-3 backdrop-blur-xl">
        <h1 className="font-heading text-xl font-extrabold text-[#0A2027]">Impostazioni</h1>
      </div>

      <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
        {/* Profilo */}
        <section className="flex items-center gap-4 rounded-3xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur-xl">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-cyan-100">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">🦈</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading font-bold text-[#0A2027]">
              {profile?.full_name || "Il tuo profilo"}
            </p>
            <p className="truncate text-sm text-[#0A2027]/60">{email}</p>
            {profile?.user_type && (
              <span className="mt-1 inline-block rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-[#0891b2]">
                {profile.user_type === "tutor" ? "Tutor" : "Studente"}
              </span>
            )}
          </div>
        </section>

        {/* Modifica nome */}
        <section className="flex flex-col gap-2 rounded-3xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur-xl">
          <label className="text-sm font-semibold text-[#0A2027]">Nome visualizzato</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Come ti chiami?"
            className="rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#06B6D4]"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={saveName}
              disabled={savingName || !name.trim()}
              className="rounded-full bg-[#06B6D4] px-5 py-2 text-sm font-heading font-bold text-white disabled:opacity-40"
            >
              {savingName ? "Salvo…" : "Salva"}
            </button>
            {nameSaved && <span className="text-sm font-semibold text-green-600">Salvato ✓</span>}
          </div>
        </section>

        {/* Feedback */}
        <section className="flex flex-col gap-2 rounded-3xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur-xl">
          <label className="text-sm font-semibold text-[#0A2027]">Lascia un feedback 💬</label>
          <p className="text-xs text-[#0A2027]/60">
            Dicci cosa ti piace o cosa miglioreresti: ci aiuti a far crescere Squalo.
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="Scrivi qui…"
            className="rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#06B6D4]"
          />
          {feedbackError && <p className="text-sm text-red-500">{feedbackError}</p>}
          <div className="flex items-center gap-3">
            <button
              onClick={sendFeedback}
              disabled={sendingFeedback || !feedback.trim()}
              className="rounded-full bg-[#0A2027] px-5 py-2 text-sm font-heading font-bold text-white disabled:opacity-40"
            >
              {sendingFeedback ? "Invio…" : "Invia feedback"}
            </button>
            {feedbackDone && (
              <span className="text-sm font-semibold text-green-600">Grazie! 🦈</span>
            )}
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={logout}
          className="rounded-3xl border border-red-200 bg-white/70 p-4 text-center text-sm font-semibold text-red-500 shadow-lg backdrop-blur-xl"
        >
          Esci dall&apos;account
        </button>
      </div>
    </div>
  );
}
