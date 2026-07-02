"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  { href: "/studente/cerca", label: "Cerca", icon: "🔍" },
  { href: "/studente/messaggi", label: "Messaggi", icon: "💬" },
  { href: "/studente/impostazioni", label: "Impostazioni", icon: "⚙️" },
];

export default function StudenteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh flex-col">
      <div className="min-h-0 flex-1">{children}</div>
      <nav className="flex flex-shrink-0 border-t border-white/40 bg-white/70 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(10,32,39,0.08)] backdrop-blur-xl">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs"
            >
              <span className="relative flex h-8 w-8 items-center justify-center">
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl bg-[#06B6D4] shadow-md"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
                <motion.span
                  animate={{ scale: active ? 1.1 : 1, y: active ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 24 }}
                  className={`relative text-base ${active ? "grayscale-0" : "opacity-60 grayscale"}`}
                >
                  {tab.icon}
                </motion.span>
              </span>
              <span
                className={`transition-colors ${
                  active ? "font-semibold text-[#0A2027]" : "text-[#0A2027]/60"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
