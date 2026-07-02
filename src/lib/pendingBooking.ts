const KEY = "squalo_pending_booking";

export type PendingBooking = {
  tutorId: string;
  tutorName: string;
  studentName: string;
  day: string;
  timeSlot: string;
  subject: string;
  mode: "vado_dal_tutor" | "tutor_viene_da_me";
  location?: { address?: string; lat?: number; lng?: number };
  note?: string;
};

export function savePendingBooking(data: PendingBooking) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadPendingBooking(): PendingBooking | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as PendingBooking) : null;
}

export function clearPendingBooking() {
  localStorage.removeItem(KEY);
}

export function buildBookingMessage(b: PendingBooking, tutorAddress: string | null): string {
  const lines = [
    "📅 Nuova richiesta di prenotazione",
    `Giorno: ${b.day} — ${b.timeSlot}`,
    `Materia: ${b.subject}`,
  ];
  if (b.mode === "vado_dal_tutor") {
    lines.push(`Modalità: Vado dal tutor${tutorAddress ? ` (${tutorAddress})` : ""}`);
  } else {
    const loc = b.location;
    const addr = loc?.address ? loc.address : "";
    const mapLink =
      loc?.lat != null && loc?.lng != null
        ? `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=16/${loc.lat}/${loc.lng}`
        : "";
    lines.push(`Modalità: Il tutor viene da me${addr ? ` (${addr})` : ""}`);
    if (mapLink) lines.push(`Posizione: ${mapLink}`);
  }
  if (b.note?.trim()) lines.push(`Nota: ${b.note.trim()}`);
  return lines.join("\n");
}
