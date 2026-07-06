"use client";

import { useEffect, useState } from "react";

type AvatarPickerProps = {
  file: File | null;
  onChange: (file: File | null) => void;
};

// Selettore foto profilo: un cerchio toccabile con anteprima, molto più
// intuitivo di un file input grezzo.
export default function AvatarPicker({ file, onChange }: AvatarPickerProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="group relative h-28 w-28 cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <div
          className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full transition-all group-hover:scale-105 group-active:scale-95 ${
            preview
              ? "ring-4 ring-white shadow-lg"
              : "border-2 border-dashed border-[#06B6D4]/50 bg-cyan-50"
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Anteprima foto profilo" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-[#06B6D4]">
              <span className="text-3xl">📷</span>
              <span className="text-[11px] font-semibold">Aggiungi</span>
            </div>
          )}
        </div>
        <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#22D3EE] to-[#0891b2] text-sm text-white shadow-md">
          {preview ? "✎" : "+"}
        </span>
      </label>
      <span className="text-xs text-[#0A2027]/60">
        {preview ? "Tocca per cambiare la foto" : "Foto profilo (facoltativa)"}
      </span>
      {preview && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs font-semibold text-red-500 underline underline-offset-2"
        >
          Rimuovi
        </button>
      )}
    </div>
  );
}
