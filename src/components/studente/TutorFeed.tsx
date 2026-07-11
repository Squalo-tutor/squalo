"use client";

import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import type { TutorPublic } from "@/lib/types";

type FeedItem = { tutor: TutorPublic; distance: number | null };

// Feed verticale "stile TikTok": ogni tutor riempie lo schermo,
// si scorre su/giù e le foto scattano una alla volta (scroll-snap).
export default function TutorFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#0A2027]/50">
        Nessun tutor da sfogliare con questi filtri.
      </div>
    );
  }

  return (
    <div className="h-full snap-y snap-mandatory overflow-y-auto bg-black">
      {items.map(({ tutor, distance }, i) => (
        <section
          key={tutor.id}
          className="relative flex h-full snap-start snap-always flex-col justify-end overflow-hidden"
        >
          {/* Sfondo: foto del tutor o gradiente con lo squaletto */}
          {tutor.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tutor.avatar_url}
              alt={tutor.full_name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#06B6D4] to-[#0A2027]">
              <span className="text-[120px] opacity-40">🦈</span>
            </div>
          )}

          {/* Velo scuro per leggere il testo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

          {/* Colonna azioni a destra */}
          <div className="absolute bottom-28 right-3 z-10 flex flex-col items-center gap-4">
            <Link
              href={`/studente/tutor/${tutor.id}`}
              className="flex flex-col items-center gap-1 text-white"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-xl backdrop-blur-md">
                👤
              </span>
              <span className="text-[10px] font-semibold">Profilo</span>
            </Link>
            <Link
              href={`/studente/tutor/${tutor.id}/prenota`}
              className="flex flex-col items-center gap-1 text-white"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0891b2] text-xl shadow-lg ring-2 ring-white/40">
                📅
              </span>
              <span className="text-[10px] font-semibold">Prenota</span>
            </Link>
          </div>

          {/* Info in basso a sinistra */}
          <div className="relative z-10 flex flex-col gap-2 p-5 pb-24 pr-20 text-white">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-2xl font-extrabold drop-shadow">{tutor.full_name}</h2>
              <span className="rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0891b2] px-3 py-1 font-heading text-sm font-bold shadow-md">
                €{tutor.price_per_hour}/h
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={tutor.verification_status} />
              {tutor.is_online && (
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
                  💻 Online
                </span>
              )}
              {distance != null && (
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
                  📍 {distance.toFixed(1)} km
                </span>
              )}
            </div>

            {tutor.bio && (
              <p className="line-clamp-2 max-w-xs text-sm text-white/85 drop-shadow">{tutor.bio}</p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {tutor.subjects.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Suggerimento "scorri" solo sulla prima scheda */}
          {i === 0 && items.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 top-6 z-10 flex justify-center">
              <span className="animate-bounce rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                Scorri su per il prossimo ↑
              </span>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
