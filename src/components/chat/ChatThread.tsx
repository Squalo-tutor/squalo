"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import MessageText from "@/components/studente/MessageText";
import LoginGate from "@/components/studente/LoginGate";
import type { Conversation, Message, ChatPerson } from "@/lib/types";

type State = "loading" | "needs-auth" | "not-found" | "ready";

type Props = {
  conversationId: string;
  backHref: string; // dove torna la freccia ←
  isTutor?: boolean; // mostra il tasto "Accetta richiesta"
};

export default function ChatThread({ conversationId, backHref, isTutor = false }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [other, setOther] = useState<ChatPerson | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<Conversation["status"]>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      setStatus((conv as Conversation).status ?? "in_attesa");

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

  async function sendPhoto(file: File) {
    if (!userId || uploading) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `chat/${conversationId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (upErr) {
      setUploading(false);
      window.alert("Non riesco a caricare la foto. Riprova.");
      return;
    }
    const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: userId, content: url })
      .select()
      .single();
    if (!error && data) {
      const inserted = data as Message;
      setMessages((prev) => (prev.some((m) => m.id === inserted.id) ? prev : [...prev, inserted]));
    }
    setUploading(false);
  }

  async function removeConversation() {
    if (!window.confirm("Vuoi eliminare questa conversazione? L'azione non si può annullare.")) {
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("conversations").delete().eq("id", conversationId);
    if (error) {
      window.alert("Non riesco a eliminare la conversazione. Riprova.");
      return;
    }
    router.replace(backHref);
  }

  async function accept() {
    if (accepting || !userId) return;
    setAccepting(true);
    const supabase = createClient();
    await supabase.from("conversations").update({ status: "accettata" }).eq("id", conversationId);
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: "Richiesta accettata ✅ Ci vediamo alla lezione!",
    });
    setStatus("accettata");
    setAccepting(false);
  }

  if (state === "loading") {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-b from-cyan-50 to-white text-[#0A2027]/50">
        Carico la chat…
      </div>
    );
  }
  if (state === "needs-auth") {
    return <LoginGate next={`${backHref}/${conversationId}`} title="Accedi alla chat" />;
  }
  if (state === "not-found") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-cyan-50 to-white text-center">
        <p className="text-sm text-[#0A2027]/60">Conversazione non trovata.</p>
        <Link href={backHref} className="text-sm font-semibold text-[#06B6D4] underline">
          Torna indietro
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-cyan-50 to-white">
      <div className="glass-cyan flex items-center gap-3 px-3 py-2.5">
        <Link href={backHref} className="text-lg text-[#0A2027]/70">
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
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading font-bold text-[#0A2027]">
            {other?.full_name ?? "Utente"}
          </p>
          <span
            className={`text-xs font-semibold ${
              status === "accettata" ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {status === "accettata" ? "Accettata ✅" : "In attesa"}
          </span>
        </div>
        <button
          onClick={removeConversation}
          aria-label="Elimina conversazione"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg text-[#0A2027]/50 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-90"
        >
          🗑️
        </button>
      </div>

      {isTutor && status !== "accettata" && (
        <div className="flex items-center justify-between gap-2 border-b border-white/40 bg-cyan-50/70 px-3 py-2">
          <span className="text-sm text-[#0A2027]/70">Nuova richiesta da questo studente.</span>
          <button
            onClick={accept}
            disabled={accepting}
            className="rounded-full bg-[#06B6D4] px-4 py-1.5 text-sm font-heading font-bold text-white disabled:opacity-40"
          >
            {accepting ? "…" : "Accetta"}
          </button>
        </div>
      )}

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {messages.map((m) => {
          const own = m.sender_id === userId;
          return (
            <div
              key={m.id}
              className={`max-w-[80%] px-3.5 py-2 text-sm shadow-sm ${
                own
                  ? "ml-auto rounded-2xl rounded-br-md bg-gradient-to-br from-[#22D3EE] to-[#0891b2] text-white"
                  : "rounded-2xl rounded-bl-md border border-black/5 bg-white text-[#0A2027]"
              }`}
            >
              <MessageText content={m.content} own={own} />
            </div>
          );
        })}
      </div>

      <div className="glass-cyan flex items-center gap-2 p-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) sendPhoto(f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label="Invia una foto"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/70 text-lg text-[#0A2027]/70 transition-colors hover:bg-white active:scale-90 disabled:opacity-50"
        >
          {uploading ? "⏳" : "📷"}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Scrivi un messaggio…"
          className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#06B6D4]"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          aria-label="Invia"
          className="btn-primary flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-lg disabled:opacity-40"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
