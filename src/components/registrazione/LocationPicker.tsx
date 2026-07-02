"use client";

import { useState } from "react";

type LocationPickerProps = {
  address: string;
  onAddressChange: (value: string) => void;
  coords: { lat: number; lng: number } | null;
  onCoordsChange: (coords: { lat: number; lng: number } | null) => void;
};

export default function LocationPicker({
  address,
  onAddressChange,
  coords,
  onCoordsChange,
}: LocationPickerProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErrorMsg("Il tuo dispositivo non supporta la geolocalizzazione.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCoordsChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("idle");
      },
      (err) => {
        setStatus("error");
        setErrorMsg(
          err.code === err.PERMISSION_DENIED
            ? "Permesso negato. Puoi comunque scrivere l'indirizzo a mano."
            : "Non riesco a trovare la posizione. Scrivi l'indirizzo a mano."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[#0A2027]">Dove fai ripetizioni</span>

      <input
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        className="rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-[#06B6D4]"
        placeholder="Via Roma 10, Udine"
      />

      <button
        type="button"
        onClick={useMyLocation}
        disabled={status === "loading"}
        className="flex items-center justify-center gap-2 rounded-xl border border-[#06B6D4] px-4 py-2.5 text-sm font-semibold text-[#06B6D4] transition-colors hover:bg-cyan-50 disabled:opacity-50"
      >
        📍 {status === "loading" ? "Cerco la posizione…" : "Usa la mia posizione"}
      </button>

      {coords && (
        <p className="text-xs text-green-600">
          ✓ Posizione GPS salvata ({coords.lat.toFixed(5)}, {coords.lng.toFixed(5)})
        </p>
      )}
      {status === "error" && <p className="text-xs text-red-500">{errorMsg}</p>}
      <span className="text-xs text-[#0A2027]/50">
        Consigliato: usa il tasto posizione così gli studenti ti trovano sulla mappa. La mappa
        visiva arriverà a breve.
      </span>
    </div>
  );
}
