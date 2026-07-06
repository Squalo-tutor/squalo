"use client";

const FREE = [
  "Cerca e prenota tutor gratis",
  "Messaggi in tempo reale",
  "Mappa e ricerca vicino a te",
];

const PREMIUM = [
  "Accesso ai tutor più bravi ⭐",
  "Priorità quando invii una richiesta",
  "Più visibilità (per i tutor)",
  "Meno limiti con lo Squaletto AI 🦈",
  "Carica foto nelle chat",
];

export default function Abbonamenti() {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-cyan-50 to-white">
      <div className="glass-cyan sticky top-0 z-10 px-4 py-3">
        <h1 className="font-heading text-xl font-extrabold text-[#0A2027]">Abbonamenti</h1>
      </div>

      <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
        {/* Gratis */}
        <section className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-extrabold text-[#0A2027]">Gratis</h2>
            <span className="font-heading font-bold text-[#0A2027]">€0</span>
          </div>
          <p className="mt-0.5 text-xs text-[#0A2027]/60">Il tuo piano attuale</p>
          <ul className="mt-3 flex flex-col gap-2">
            {FREE.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-[#0A2027]/80">
                <span className="text-green-600">✓</span> {f}
              </li>
            ))}
          </ul>
        </section>

        {/* Premium */}
        <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-[#06B6D4] to-[#0891b2] p-5 text-white shadow-2xl">
          <span className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
            In arrivo
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="font-heading text-xl font-extrabold">Premium 🦈</h2>
          </div>
          <p className="mt-0.5 text-sm text-white/80">Il meglio di Squalo, ogni mese.</p>
          <ul className="mt-4 flex flex-col gap-2">
            {PREMIUM.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <span>✨</span> {p}
              </li>
            ))}
          </ul>
          <button
            disabled
            className="mt-5 w-full cursor-not-allowed rounded-full bg-white/90 px-6 py-3 font-heading font-bold text-[#0891b2] opacity-90"
          >
            Presto disponibile
          </button>
          <p className="mt-2 text-center text-xs text-white/70">
            Ti avviseremo appena Premium sarà pronto.
          </p>
        </section>
      </div>
    </div>
  );
}
