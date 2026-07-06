"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LoginGate from "@/components/studente/LoginGate";
import type { Conversation, Message, ChatPerson } from "@/lib/types";

type Row = {
  conversation: Conversation;
  student: ChatPerson | null;
  lastMessage: Message | null;
};

type State = "loading" | "needs-auth" | "ready";

export default function RichiestePage() {
  const [state, setState] = useState<State>("loading");
  const [rows, setRows] = useState<Row[]>([]);

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

      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false });

      const conversations = (convs as Conversation[]) ?? [];
      if (conversations.length === 0) {
        setRows([]);
        setState("ready");
        return;
      }

      const studentIds = conversations.map((c) => c.student_id);
      const convIds = conversations.map((c) => c.id);

      const [{ data: people }, { data: msgs }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url").in("id", studentIds),
        supabase
          .from("messages")
          .select("*")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false }),
      ]);

      const peopleMap = new Map((people as ChatPerson[] | null)?.map((p) => [p.id, p]) ?? []);
      const lastByConv = new Map<string, Message>();
      for (const m of (msgs as Message[] | null) ?? []) {
        if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m);
      }

      setRows(
        conversations.map((c) => ({
          conversation: c,
          student: peopleMap.get(c.student_id) ?? null,
          lastMessage: lastByConv.get(c.id) ?? null,
        }))
      );
      setState("ready");
    })();
  }, []);

  if (state === "loading") {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-b from-cyan-50 to-white text-[#0A2027]/50">
        Carico le richieste…
      </div>
    );
  }

  if (state === "needs-auth") {
    return <LoginGate next="/tutor/richieste" title="Accedi come tutor" />;
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-cyan-50 to-white">
      <div className="glass-cyan sticky top-0 z-10 px-4 py-3">
        <h1 className="font-heading text-xl font-extrabold text-[#0A2027]">Richieste</h1>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 pt-20 text-center">
          <span className="animate-pop text-5xl">📭</span>
          <p className="text-sm text-[#0A2027]/60">
            Ancora nessuna richiesta. Appena uno studente ti scrive, la trovi qui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col p-2">
          {rows.map(({ conversation, student, lastMessage }, i) => {
            const accepted = conversation.status === "accettata";
            return (
              <Link
                key={conversation.id}
                href={`/tutor/richieste/${conversation.id}`}
                className="animate-rise flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/70"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-cyan-100">
                  {student?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={student.avatar_url}
                      alt={student.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">🎓</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-heading font-bold text-[#0A2027]">
                      {student?.full_name ?? "Studente"}
                    </p>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                        accepted
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {accepted ? "Accettata" : "In attesa"}
                    </span>
                  </div>
                  <p className="truncate text-sm text-[#0A2027]/60">
                    {lastMessage ? lastMessage.content.replace(/\n/g, " · ") : "Nessun messaggio"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
