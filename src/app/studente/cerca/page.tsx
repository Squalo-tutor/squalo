"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { distanceKm, geocodeSearch, type GeocodeResult } from "@/lib/geo";
import { SUBJECTS } from "@/lib/constants";
import ChipSelect from "@/components/registrazione/ChipSelect";
import TutorCard from "@/components/studente/TutorCard";
import TutorFeed from "@/components/studente/TutorFeed";
import type { TutorPublic } from "@/lib/types";

const MapView = dynamic(() => import("@/components/studente/MapView"), { ssr: false });

const ITALY_CENTER: [number, number] = [42.5, 12.5];

export default function CercaPage() {
  const [tutors, setTutors] = useState<TutorPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"map" | "list" | "feed">("map");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<GeocodeResult[]>([]);

  const [refPoint, setRefPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [flyTo, setFlyTo] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("tutors_public").select("*");
      setTutors((data as TutorPublic[]) ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (cityQuery.trim().length < 3) {
        setCitySuggestions([]);
        return;
      }
      const results = await geocodeSearch(cityQuery);
      setCitySuggestions(results);
    }, 500);
    return () => clearTimeout(handle);
  }, [cityQuery]);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setLocError("Il dispositivo non supporta la geolocalizzazione.");
      return;
    }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setRefPoint(point);
        setFlyTo({ center: [point.lat, point.lng], zoom: 12 });
        setLocating(false);
      },
      () => {
        setLocError("Permesso negato o posizione non disponibile.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function selectCity(result: GeocodeResult) {
    setRefPoint({ lat: result.lat, lng: result.lng });
    setFlyTo({ center: [result.lat, result.lng], zoom: 12 });
    setCityQuery(result.label);
    setCitySuggestions([]);
  }

  const filtered = useMemo(() => {
    return tutors.filter(
      (t) => selectedSubjects.length === 0 || t.subjects.some((s) => selectedSubjects.includes(s))
    );
  }, [tutors, selectedSubjects]);

  const withDistance = useMemo(() => {
    return filtered.map((t) => ({
      tutor: t,
      distance:
        refPoint && t.latitude != null && t.longitude != null
          ? distanceKm(refPoint.lat, refPoint.lng, t.latitude, t.longitude)
          : null,
    }));
  }, [filtered, refPoint]);

  const sorted = useMemo(() => {
    const arr = [...withDistance];
    if (refPoint) {
      arr.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      arr.sort((a, b) => a.tutor.price_per_hour - b.tutor.price_per_hour);
    }
    return arr;
  }, [withDistance, refPoint]);

  const pins = useMemo(
    () =>
      filtered
        .filter((t) => t.latitude != null && t.longitude != null)
        .map((t) => ({ id: t.id, lat: t.latitude!, lng: t.longitude!, price: t.price_per_hour })),
    [filtered]
  );

  const handlePinSelect = useCallback((id: string) => setSelectedId(id), []);
  const selectedTutor = tutors.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-cyan-50 to-white">
      <div className="glass-cyan z-10 flex flex-col gap-2 rounded-b-3xl p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Cerca città o zona…"
              className="w-full rounded-full border border-black/10 px-4 py-2 text-sm outline-none focus:border-[#06B6D4]"
            />
            {citySuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-white/40 bg-white/85 shadow-lg backdrop-blur-xl">
                {citySuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectCity(s)}
                    className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-cyan-50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="rounded-full border border-black/10 px-3 py-2 text-sm font-semibold text-[#0A2027]"
          >
            Materia {selectedSubjects.length > 0 ? `(${selectedSubjects.length})` : ""}
          </button>
        </div>

        {showFilters && (
          <div className="max-h-32 overflow-y-auto rounded-xl bg-cyan-50/50 p-2">
            <ChipSelect options={SUBJECTS} selected={selectedSubjects} onChange={setSelectedSubjects} />
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={useMyLocation}
            disabled={locating}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0891b2] px-3.5 py-2 text-sm font-semibold text-white shadow-md transition-transform active:scale-95 disabled:opacity-50"
          >
            📍 {locating ? "Cerco…" : "Cerca vicino a me"}
          </button>
          <div className="flex rounded-full bg-black/5 p-0.5 text-sm">
            <button
              onClick={() => setView("map")}
              className={`rounded-full px-3 py-1.5 font-semibold ${
                view === "map" ? "bg-white shadow-sm text-[#0A2027]" : "text-[#0A2027]/60"
              }`}
            >
              Mappa
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-full px-3 py-1.5 font-semibold ${
                view === "list" ? "bg-white shadow-sm text-[#0A2027]" : "text-[#0A2027]/60"
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setView("feed")}
              className={`rounded-full px-3 py-1.5 font-semibold ${
                view === "feed" ? "bg-white shadow-sm text-[#0A2027]" : "text-[#0A2027]/60"
              }`}
            >
              ✨ Sfoglia
            </button>
          </div>
        </div>
        {locError && <p className="text-xs text-red-500">{locError}</p>}
      </div>

      <div className="relative min-h-0 flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[#0A2027]/50">
            Carico i tutor…
          </div>
        ) : view === "feed" ? (
          <TutorFeed items={sorted} />
        ) : view === "map" ? (
          <>
            <MapView pins={pins} center={ITALY_CENTER} zoom={5} onSelect={handlePinSelect} flyTo={flyTo} />
            {selectedTutor && (
              <div className="absolute inset-x-3 bottom-3 z-10">
                <TutorCard
                  tutor={selectedTutor}
                  distanceKm={
                    refPoint && selectedTutor.latitude != null && selectedTutor.longitude != null
                      ? distanceKm(refPoint.lat, refPoint.lng, selectedTutor.latitude, selectedTutor.longitude)
                      : null
                  }
                />
              </div>
            )}
          </>
        ) : (
          <div className="h-full overflow-y-auto p-3">
            {sorted.length === 0 ? (
              <p className="pt-10 text-center text-sm text-[#0A2027]/50">
                Nessun tutor trovato con questi filtri.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {sorted.map(({ tutor, distance }, i) => (
                  <div
                    key={tutor.id}
                    className="animate-rise"
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <TutorCard tutor={tutor} distanceKm={distance} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
