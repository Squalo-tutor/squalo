import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const supabase = await createClient();

  if (tokenHash && type) {
    // Metodo robusto: funziona anche se il link viene aperto in un browser
    // o dispositivo diverso da quello dove è stato richiesto.
    await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  } else if (code) {
    // Vecchio metodo (PKCE): resta come riserva.
    await supabase.auth.exchangeCodeForSession(code);
  }

  // "next" per i login semplici (es. messaggi); altrimenti passiamo dalla
  // pagina che completa registrazione/prenotazione in sospeso.
  const destination = next ?? "/registrazione/completa";
  return NextResponse.redirect(`${origin}${destination}`);
}
