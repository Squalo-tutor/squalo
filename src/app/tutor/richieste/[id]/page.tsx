"use client";

import { use as usePromise } from "react";
import ChatThread from "@/components/chat/ChatThread";

export default function TutorThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  return <ChatThread conversationId={id} backHref="/tutor/richieste" isTutor />;
}
