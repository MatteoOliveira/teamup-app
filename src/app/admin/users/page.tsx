"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";
import { Search, ShieldCheck, ShieldOff } from "lucide-react";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Débutant", intermediate: "Intermédiaire",
  advanced: "Confirmé", expert: "Expert",
};
const LEVEL_COLOR: Record<string, { bg: string; text: string }> = {
  beginner: { bg: "#D6F4F1", text: "#1FA89B" },
  intermediate: { bg: "#FEF3C7", text: "#D97706" },
  advanced: { bg: "#FFE6DA", text: "#FF6B35" },
  expert: { bg: "#EDE9FE", text: "#7B61FF" },
};

function Avatar({ profile }: { profile: Profile }) {
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.full_name ?? ""}
        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  const initials = (profile.full_name ?? profile.username ?? "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #FF6B35, #E5551F)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 800, color: "#fff",
      }}
    >
      {initials}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleAdmin(user: Profile) {
    setToggling(user.id);
    await supabase.from("profiles").update({ is_admin: !user.is_admin }).eq("id", user.id);
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_admin: !u.is_admin } : u));
    setToggling(null);
  }

  const filtered = users.filter((u) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.username ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4 }}>
          Utilisateurs
        </h1>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 2 }}>
          {users.length} inscrits
        </p>
      </div>

      <div
        className="flex items-center gap-2"
        style={{ height: 40, borderRadius: 999, background: "#fff", border: "1px solid #E5E8EE", padding: "0 14px", marginBottom: 16, maxWidth: 340 }}
      >
        <Search size={15} color="#8A93A6" strokeWidth={2} />
        <input
          type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un utilisateur…"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit" }}
        />
      </div>

      <div
        style={{
          background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", overflow: "hidden",
          boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)",
        }}
      >
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "#8A93A6", fontSize: 14, fontWeight: 600 }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#8A93A6", fontSize: 14, fontWeight: 600 }}>Aucun utilisateur</div>
        ) : (
          filtered.map((user, idx) => {
            const lvl = LEVEL_COLOR[user.level] ?? LEVEL_COLOR.beginner;
            return (
              <div
                key={user.id}
                className="flex items-center gap-3"
                style={{
                  padding: "12px 18px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid #F1F3F7" : "none",
                }}
              >
                <Avatar profile={user} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>
                      {user.full_name ?? user.username ?? "Utilisateur"}
                    </p>
                    {user.is_admin && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", background: "#D1FAE5", borderRadius: 999, padding: "2px 7px" }}>
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3" style={{ marginTop: 3 }}>
                    {user.username && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>@{user.username}</span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                      {user.events_count} events · {user.points} pts
                    </span>
                  </div>
                </div>

                <span style={{ fontSize: 11, fontWeight: 700, background: lvl.bg, color: lvl.text, borderRadius: 999, padding: "3px 10px", flexShrink: 0 }}>
                  {LEVEL_LABEL[user.level] ?? user.level}
                </span>

                <button
                  onClick={() => toggleAdmin(user)}
                  disabled={toggling === user.id}
                  title={user.is_admin ? "Retirer admin" : "Promouvoir admin"}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: user.is_admin ? "#D1FAE5" : "#F1F3F7",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, opacity: toggling === user.id ? 0.5 : 1,
                  }}
                >
                  {user.is_admin
                    ? <ShieldCheck size={15} color="#22C55E" strokeWidth={2.5} />
                    : <ShieldOff size={15} color="#8A93A6" strokeWidth={2.5} />
                  }
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
