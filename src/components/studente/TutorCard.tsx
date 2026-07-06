import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import type { TutorPublic } from "@/lib/types";

type TutorCardProps = {
  tutor: TutorPublic;
  distanceKm?: number | null;
};

export default function TutorCard({ tutor, distanceKm }: TutorCardProps) {
  return (
    <Link
      href={`/studente/tutor/${tutor.id}`}
      className="group flex items-center gap-3 rounded-3xl border border-black/5 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]"
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-cyan-100 ring-2 ring-white shadow-sm">
        {tutor.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tutor.avatar_url} alt={tutor.full_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-100 to-cyan-200 text-2xl">
            🦈
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-heading font-bold text-[#0A2027]">{tutor.full_name}</p>
          <span className="flex-shrink-0 rounded-full bg-cyan-50 px-2.5 py-1 font-heading text-sm font-extrabold text-[#0891b2]">
            €{tutor.price_per_hour}
            <span className="text-xs font-bold text-[#0891b2]/70">/h</span>
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {tutor.subjects.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-black/[0.04] px-2 py-0.5 text-xs font-medium text-[#0A2027]/80"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={tutor.verification_status} />
          {distanceKm != null && (
            <span className="text-xs font-medium text-[#0A2027]/45">
              📍 {distanceKm.toFixed(1)} km
            </span>
          )}
        </div>
      </div>

      <span className="flex-shrink-0 text-lg text-[#0A2027]/20 transition-all group-hover:translate-x-0.5 group-hover:text-[#06B6D4]">
        ›
      </span>
    </Link>
  );
}
