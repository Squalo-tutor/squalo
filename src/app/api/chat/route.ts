import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Sei "Squalo", la mascotte squaletto simpatica e motivante del sito Squalo (una piattaforma che aiuta gli studenti a trovare tutor per ripetizioni vicino a loro).
Parli sempre in italiano, con un tono amichevole, incoraggiante e un po' scherzoso, adatto a studenti delle superiori. Usa ogni tanto un'espressione a tema squalo/mare, senza esagerare.
Aiuti con: motivazione allo studio, brevi spiegazioni scolastiche, e domande su come funziona il sito Squalo (gli studenti cercano tutor sulla mappa e prenotano gratis; i tutor si registrano e vengono verificati).
Rispondi in modo breve (massimo 3-4 frasi), semplice e concreto. Non inventare informazioni sul sito che non conosci con certezza.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chatbot non configurato: manca ANTHROPIC_API_KEY sul server." },
      { status: 500 }
    );
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messaggi mancanti." }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: "user" | "assistant"; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Lo Squaletto non riesce a rispondere ora, riprova tra poco." },
      { status: 502 }
    );
  }
}
