"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/home",
    label: "Accueil",
    icon: (active: boolean) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/events",
    label: "Événements",
    icon: (active: boolean) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  null, // FAB placeholder
  {
    href: "/teams",
    label: "Équipes",
    icon: (active: boolean) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profil",
    icon: (active: boolean) => (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around px-2 pb-safe"
      style={{
        background: "linear-gradient(to top, rgba(255,255,255,1) 70%, rgba(255,255,255,0))",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        height: 72,
      }}
    >
      {NAV_ITEMS.map((item, i) => {
        if (item === null) {
          return (
            <Link
              key="fab"
              href="/events/create"
              className="tap-scale flex items-center justify-center rounded-full text-white"
              style={{
                width: 54,
                height: 54,
                background: "linear-gradient(135deg, #FF6B35, #E5551F)",
                boxShadow: "0 6px 18px -6px rgba(255,107,53,0.55)",
                transform: "translateY(-10px)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Link>
          );
        }

        const active =
          pathname === item.href ||
          (item.href !== "/home" && pathname.startsWith(item.href + "/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center gap-1 py-1 px-3 transition-colors duration-150",
              active ? "text-brand-orange" : "text-ink-soft"
            )}
          >
            {item.icon(active)}
            <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            {active && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-brand-orange"
                style={{ width: 4, height: 4 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
