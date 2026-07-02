export default function MessaggiPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-cyan-50 to-white px-6 text-center">
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
        <span className="text-4xl">💬</span>
        <h1 className="font-heading text-xl font-bold text-[#0A2027]">Messaggi</h1>
        <p className="text-sm text-[#0A2027]/60">
          Arriva nella prossima tappa: qui vedrai le conversazioni con i tutor.
        </p>
      </div>
    </div>
  );
}
