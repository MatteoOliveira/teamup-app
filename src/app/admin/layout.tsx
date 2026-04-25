"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, MapPin, Shield,
  ShieldCheck, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Événements", icon: CalendarDays },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/terrains", label: "Terrains", icon: MapPin },
  { href: "/admin/teams", label: "Équipes", icon: Shield },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const Sidebar = () => (
    <div
      style={{
        width: 220, background: "#1A2B4A", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #FF6B35, #E5551F)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}
          >
            🏟️
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: -0.3, lineHeight: 1 }}>
              TeamUp!
            </p>
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
              Admin
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              style={{ textDecoration: "none", display: "block", marginBottom: 2 }}
            >
              <div
                className="flex items-center gap-3"
                style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: active ? "rgba(255,107,53,0.15)" : "transparent",
                  color: active ? "#FF6B35" : "rgba(255,255,255,0.6)",
                  fontSize: 14, fontWeight: active ? 700 : 600,
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 2} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Admin badge + logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2" style={{ padding: "8px 12px", marginBottom: 4 }}>
          <ShieldCheck size={15} color="#22C55E" strokeWidth={2.5} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#22C55E" }}>Administrateur</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full"
          style={{
            padding: "10px 12px", borderRadius: 10,
            background: "transparent", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: 600,
            width: "100%",
          }}
        >
          <LogOut size={17} strokeWidth={2} />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F7FA" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center gap-3"
          style={{
            padding: "16px",
            background: "#fff",
            borderBottom: "1px solid #E5E8EE",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            <Menu size={22} color="#1A2B4A" strokeWidth={2.5} />
          </button>
          <p style={{
            fontSize: 17, fontWeight: 800, color: "#1A2B4A",
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          }}>
            Admin
          </p>
        </div>

        <main style={{ flex: 1, padding: "24px", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
