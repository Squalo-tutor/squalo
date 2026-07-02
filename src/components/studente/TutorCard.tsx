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
      className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-cyan-100">
        {tutor.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tutor.avatar_url} alt={tutor.full_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">🦈</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-heading font-bold text-[#0A2027]">{tutor.full_name}</p>
          <span className="flex-shrink-0 font-heading font-bold text-[#06B6D4]">
            €{tutor.price_per_hour}/h
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {tutor.subjects.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs text-[#0A2027]">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <StatusBadge status={tutor.verification_status} />
          {distanceKm != null && (
            <span className="text-xs text-[#0A2027]/50">{distanceKm.toFixed(1)} km</span>
          )}
        </div>
      </div>
    </Link>
  );
}
