"use client";

import { useEffect, useRef, useState, use as usePromise } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import MessageText from "@/components/studente/MessageText";
import LoginGate from "@/components/studente/LoginGate";
import type { Message, ChatPerson } from "@/lib/types";

type State = "loading" | "needs-auth" | "not-found" | "ready";

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = usePromise(params);

  const [state, setState] = useState<State>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [other, setOther] = useState<ChatPerson | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setState("needs-auth");
        return;
      }
      setUserId(user.id);

      const { data: conv } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (!conv) {
        setState("not-found");
        return;
      }

      const otherId = conv.student_id === user.id ? conv.tutor_id : conv.student_id;
      const { data: person } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherId)
        .single();
      setOther((person as ChatPerson) ?? null);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setMessages((msgs as Message[]) ?? []);
      setState("ready");

      channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const incoming = payload.new as Message;
            setMessages((prev) =>
              prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
            );
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function send() {
    const text = input.trim();
    if (!text || sending || !userId) return;
    setSending(true);
    setInput("");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: userId, content: text })
      .select()
      .single();
    if (!error && data) {
      const inserted = data as Message;
      setMessages((prev) => (prev.some((m) => m.id === inserted.id) ? prev : [...prev, inserted]));
    } else {
      setInput(text);
    }
    setSending(false);
  }

  if (state === "loading") {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-b from-cyan-50 to-white text-[#0A2027]/50">
        Carico la chat…
      </div>
    );
  }
  if (state === "needs-auth") {
    return <LoginGate next={`/studente/messaggi/${conversationId}`} />;
  }
  if (state === "not-found") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-cyan-50 to-white text-center">
        <p className="text-sm text-[#0A2027]/60">Conversazione non trovata.</p>
        <Link href="/studente/messaggi" className="text-sm font-semibold text-[#06B6D4] underline">
          Torna ai messaggi
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-cyan-50 to-white">
      <div className="flex items-center gap-3 border-b border-white/40 bg-white/70 px-3 py-2.5 backdrop-blur-xl">
        <Link href="/studente/messaggi" className="text-lg text-[#0A2027]/70">
          ←
        </Link>
        <div className="h-9 w-9 overflow-hidden rounded-full bg-cyan-100">
          {other?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={other.avatar_url} alt={other.full_name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">🦈</div>
          )}
        </div>
        <p className="font-heading font-bold text-[#0A2027]">{other?.full_name ?? "Utente"}</p>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {messages.map((m) => {
          const own = m.sender_id === userId;
          return (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                own
                  ? "ml-auto bg-[#06B6D4] text-white"
                  : "border border-white/50 bg-white/80 text-[#0A2027] backdrop-blur-sm"
              }`}
            >
              <MessageText content={m.content} own={own} />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-white/40 bg-white/70 p-3 backdrop-blur-xl">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Scrivi un messaggio…"
          className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-[#06B6D4]"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="rounded-full bg-[#06B6D4] px-4 py-2 text-sm font-heading font-bold text-white disabled:opacity-40"
        >
          Invia
        </button>
      </div>
    </div>
  );
}
