type StatusBadgeProps = {
  status: "in_verifica" | "verificato";
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const verificato = status === "verificato";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        verificato ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${verificato ? "bg-green-600" : "bg-yellow-600"}`} />
      {verificato ? "Verificato" : "In verifica"}
    </span>
  );
}
