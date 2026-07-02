import Link from "next/link";

export default function ImpostazioniPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="text-4xl">⚙️</span>
      <h1 className="font-heading text-xl font-bold text-[#0A2027]">Impostazioni</h1>
      <p className="text-sm text-[#0A2027]/60">
        Arriva più avanti: qui gestirai profilo, verifica e feedback.
      </p>
      <Link href="/" className="mt-2 text-sm font-semibold text-[#06B6D4] underline">
        Torna alla home
      </Link>
    </div>
  );
}
