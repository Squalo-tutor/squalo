"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <nav className="flex flex-shrink-0 border-t border-black/5 bg-white pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-base ${
                  active ? "bg-[#06B6D4] text-white" : "bg-transparent text-[#0A2027]/60"
                }`}
              >
                {tab.icon}
              </span>
              <span className={active ? "font-semibold text-[#0A2027]" : "text-[#0A2027]/60"}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
