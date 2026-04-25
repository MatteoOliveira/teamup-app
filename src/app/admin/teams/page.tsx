"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Team } from "@/lib/supabase";
import { Search, Trash2, Users, Globe, Lock } from "lucide-react";

const SPORT_EMOJI: Record<string, string> = {
  basket: "🏀", foot: "⚽", tennis: "🎾", running: "🏃",
  volley: "🏐", padel: "🏓", velo: "🚴", yoga: "🧘",
};

const SPORT_COLOR: Record<string, string> = {
  basket: "#FF6B35", foot: "#2EC4B6", tennis: "#F4B43A",
  running: "#7B61FF", volley: "#EC4899", padel: "#3B82F6",
  velo: "#06B6D4", yoga: "#14B8A6",
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Débutant", intermediate: "Intermédiaire",
  advanced: "Confirmé", expert: "Expert",
};

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("teams")
        .select("*, owner:profiles!owner_id(full_name, username)")
        .order("created_at", { ascending: false });
      setTeams(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette équipe définitivement ?")) return;
    setDeletingId(id);
    await supabase.from("teams").delete().eq("id", id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
  }

  async function toggleVisibility(team: Team) {
    await supabase.from("teams").update({ is_public: !team.is_public }).eq("id", team.id);
    setTeams((prev) => prev.map((t) => t.id === team.id ? { ...t, is_public: !t.is_public } : t));
  }

  const filtered = teams.filter((t) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return t.name.toLowerCase().includes(q) || (t.owner as { full_name?: string })?.full_name?.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4 }}>Équipes</h1>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 2 }}>
          {teams.length} équipe{teams.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div
        className="flex items-center gap-2"
        style={{ height: 40, borderRadius: 999, background: "#fff", border: "1px solid #E5E8EE", padding: "0 14px", marginBottom: 16, maxWidth: 340 }}
      >
        <Search size={15} color="#8A93A6" strokeWidth={2} />
        <input
          type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une équipe…"
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
          <div style={{ padding: 32, textAlign: "center", color: "#8A93A6", fontSize: 14, fontWeight: 600 }}>Aucune équipe</div>
        ) : (
          filtered.map((team, idx) => {
            const color = SPORT_COLOR[team.sport] ?? "#8A93A6";
            const emoji = SPORT_EMOJI[team.sport] ?? "🏅";
            const owner = team.owner as { full_name?: string; username?: string } | undefined;
            return (
              <div
                key={team.id}
                className="flex items-center gap-3"
                style={{ padding: "14px 18px", borderBottom: idx < filtered.length - 1 ? "1px solid #F1F3F7" : "none" }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: `${color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                      {team.name}
                    </p>
                    <span style={{
                      fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 7px",
                      background: team.is_public ? "#D6F4F1" : "#F1F3F7",
                      color: team.is_public ? "#1FA89B" : "#8A93A6",
                      flexShrink: 0,
                    }}>
                      {team.is_public ? "Public" : "Privé"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3" style={{ marginTop: 3 }}>
                    <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                      <Users size={11} strokeWidth={2.5} />
                      {team.members_count} membre{team.members_count !== 1 ? "s" : ""}
                    </span>
                    {owner?.full_name && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                        par {owner.full_name}
                      </span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                      {LEVEL_LABEL[team.level] ?? team.level}
                    </span>
                  </div>
                </div>

                {/* Toggle visibility */}
                <button
                  onClick={() => toggleVisibility(team)}
                  title={team.is_public ? "Rendre privé" : "Rendre public"}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: team.is_public ? "#D6F4F1" : "#F1F3F7",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {team.is_public
                    ? <Globe size={15} color="#1FA89B" strokeWidth={2.5} />
                    : <Lock size={15} color="#8A93A6" strokeWidth={2.5} />
                  }
                </button>

                <button
                  onClick={() => handleDelete(team.id)}
                  disabled={deletingId === team.id}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "#FEE2E2", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, opacity: deletingId === team.id ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={14} color="#EF4444" strokeWidth={2.5} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
