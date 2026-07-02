import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import type { TutorPublic } from "@/lib/types";

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("tutors_public").select("*").eq("id", id).single();

  if (!data) notFound();
  const tutor = data as TutorPublic;

  return (
    <div className="h-full overflow-y-auto bg-cyan-50/40 pb-10">
      <div className="bg-gradient-to-b from-[#06B6D4] to-[#0891b2] px-4 pb-16 pt-6">
        <Link href="/studente/cerca" className="text-sm font-semibold text-white/90">
          ← Torna alla ricerca
        </Link>
      </div>

      <div className="mx-auto -mt-12 max-w-md px-4">
        <div className="rounded-3xl bg-white p-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-cyan-100">
              {tutor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tutor.avatar_url} alt={tutor.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">🦈</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-heading text-xl font-extrabold text-[#0A2027]">
                {tutor.full_name}
              </h1>
              <p className="font-heading text-lg font-bold text-[#06B6D4]">
                €{tutor.price_per_hour}/ora
              </p>
              <div className="mt-1">
                <StatusBadge status={tutor.verification_status} />
              </div>
            </div>
          </div>

          {tutor.bio && <p className="mt-4 text-sm text-[#0A2027]/80">{tutor.bio}</p>}

          <div className="mt-4">
            <p className="mb-1.5 text-sm font-semibold text-[#0A2027]">Materie</p>
            <div className="flex flex-wrap gap-1.5">
              {tutor.subjects.map((s) => (
                <span key={s} className="rounded-full bg-cyan-50 px-3 py-1 text-sm text-[#0A2027]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {tutor.days.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-sm font-semibold text-[#0A2027]">Giorni disponibili</p>
              <div className="flex flex-wrap gap-1.5">
                {tutor.days.map((d) => (
                  <span key={d} className="rounded-full bg-black/5 px-3 py-1 text-sm text-[#0A2027]">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tutor.time_slots.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-sm font-semibold text-[#0A2027]">Fasce orarie</p>
              <div className="flex flex-wrap gap-1.5">
                {tutor.time_slots.map((t) => (
                  <span key={t} className="rounded-full bg-black/5 px-3 py-1 text-sm text-[#0A2027]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tutor.address && (
            <div className="mt-4">
              <p className="mb-1 text-sm font-semibold text-[#0A2027]">Dove</p>
              <p className="text-sm text-[#0A2027]/70">{tutor.address}</p>
            </div>
          )}

          <button
            disabled
            className="mt-6 w-full rounded-full bg-[#0A2027]/20 px-6 py-3 font-heading font-bold text-[#0A2027]/50"
            title="Arriva nella prossima tappa"
          >
            Prenota gratis (presto)
          </button>
        </div>
      </div>
    </div>
  );
}
