"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Users, X, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Team } from "@/lib/supabase";
import { SPORT_META, LEVEL_LABELS } from "@/lib/utils";

const SPORTS_LIST = Object.entries(SPORT_META).map(([id, meta]) => ({ id, ...meta }));

const LEVELS = [
  { id: "all", label: "Tous niveaux" },
  { id: "beginner", label: "Débutant" },
  { id: "intermediate", label: "Intermédiaire" },
  { id: "advanced", label: "Confirmé" },
];

type CreateForm = {
  name: string;
  sport: string;
  level: string;
  location: string;
  isPublic: boolean;
};

const EMPTY_FORM: CreateForm = { name: "", sport: "basket", level: "all", location: "", isPublic: true };

export default function TeamsPage() {
  const router = useRouter();
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [publicTeams, setPublicTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id ?? null;
      setCurrentUserId(userId);

      const [myResult, publicResult] = await Promise.all([
        userId
          ? supabase.from("teams").select("*, team_members!inner(user_id)").eq("team_members.user_id", userId).order("created_at", { ascending: false })
          : Promise.resolve({ data: [] }),
        supabase.from("teams").select("*").eq("is_public", true).order("members_count", { ascending: false }).limit(20),
      ]);

      const mine = (myResult.data ?? []) as Team[];
      const mineIds = new Set(mine.map((t) => t.id));
      const pub = ((publicResult.data ?? []) as Team[]).filter((t) => !mineIds.has(t.id));
      setMyTeams(mine);
      setPublicTeams(pub);
      setLoading(false);
    }
    load();
  }, []);

  async function handleJoin(team: Team) {
    if (!currentUserId || joiningId) return;
    setJoiningId(team.id);
    const { error } = await supabase.from("team_members").insert({ team_id: team.id, user_id: currentUserId, role: "member" });
    if (!error) {
      setMyTeams((prev) => [{ ...team, members_count: team.members_count + 1 }, ...prev]);
      setPublicTeams((prev) => prev.filter((t) => t.id !== team.id));
    }
    setJoiningId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId || creating) return;
    setCreating(true);

    const { data: newTeam, error } = await supabase
      .from("teams")
      .insert({ name: form.name, sport: form.sport, level: form.level, location: form.location || null, is_public: form.isPublic, owner_id: currentUserId, members_count: 0 })
      .select()
      .single();

    if (!error && newTeam) {
      await supabase.from("team_members").insert({ team_id: newTeam.id, user_id: currentUserId, role: "owner" });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setCreating(false);
      router.push(`/teams/${newTeam.id}`);
    } else {
      setCreating(false);
    }
  }

  const filteredMine   = myTeams.filter((t) => !query || t.name.toLowerCase().includes(query.toLowerCase()));
  const filteredPublic = publicTeams.filter((t) => !query || t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7FA", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: "1px solid #E5E8EE", padding: "48px 16px 12px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4 }}>Équipes</p>
          <button
            onClick={() => setShowCreate(true)}
            className="tap-scale flex items-center gap-1 font-bold text-white"
            style={{ height: 34, borderRadius: 999, padding: "0 14px", background: "#FF6B35", fontSize: 13, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(255,107,53,0.35)" }}
          >
            + Créer
          </button>
        </div>
        <div className="flex items-center" style={{ height: 44, borderRadius: 999, background: "#F1F3F7", padding: "0 14px", gap: 8 }}>
          <Search size={16} color="#8A93A6" strokeWidth={2} />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une équipe..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit" }} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A93A6", fontSize: 16 }}>×</button>}
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {loading ? (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 18 }} />)}
          </div>
        ) : (
          <>
            {/* Mes équipes */}
            {filteredMine.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#8A93A6", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
                  Mes équipes
                </p>
                <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", overflow: "hidden", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)" }}>
                  {filteredMine.map((team, idx) => {
                    const meta = SPORT_META[team.sport] ?? SPORT_META.basket;
                    return (
                      <Link key={team.id} href={`/teams/${team.id}`} style={{ textDecoration: "none", display: "block" }}>
                        <div className="flex items-center gap-3 tap-scale"
                          style={{ padding: "14px 16px", borderBottom: idx < filteredMine.length - 1 ? "1px solid #F1F3F7" : "none" }}>
                          <div className="relative flex-shrink-0">
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: meta.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                              {meta.emoji}
                            </div>
                            <div style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: "#22C55E", border: "2px solid #fff", bottom: -1, right: -1 }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>{team.name}</p>
                            <div className="flex items-center gap-1" style={{ marginTop: 3 }}>
                              <Users size={11} color="#8A93A6" strokeWidth={2.5} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6" }}>{team.members_count} membres</span>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.soft, borderRadius: 999, padding: "3px 9px", flexShrink: 0 }}>
                            {meta.emoji} {meta.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Découvrir */}
            {filteredPublic.length > 0 && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#8A93A6", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
                  Découvrir
                </p>
                <div className="flex flex-col" style={{ gap: 10 }}>
                  {filteredPublic.map((team) => {
                    const meta = SPORT_META[team.sport] ?? SPORT_META.basket;
                    return (
                      <div key={team.id} style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", padding: "14px 16px", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)" }}>
                        <div className="flex items-center gap-3">
                          <div style={{ width: 48, height: 48, borderRadius: 14, background: meta.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                            {meta.emoji}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>{team.name}</p>
                            <div className="flex items-center gap-2" style={{ marginTop: 4, flexWrap: "wrap" }}>
                              <span className="font-bold" style={{ fontSize: 11, color: meta.color, background: meta.soft, borderRadius: 999, padding: "2px 8px" }}>
                                {meta.emoji} {meta.label}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6" }}>{LEVEL_LABELS[team.level] ?? team.level}</span>
                              {team.location && <span style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6" }}>📍 {team.location}</span>}
                            </div>
                            <div className="flex items-center gap-1" style={{ marginTop: 4 }}>
                              <Users size={11} color="#8A93A6" strokeWidth={2.5} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6" }}>{team.members_count} membres</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleJoin(team)}
                            disabled={joiningId === team.id}
                            className="tap-scale font-bold flex-shrink-0"
                            style={{ height: 32, borderRadius: 999, padding: "0 14px", fontSize: 12, color: "#FF6B35", background: "#FFE6DA", border: "none", cursor: "pointer", opacity: joiningId === team.id ? 0.6 : 1 }}
                          >
                            {joiningId === team.id ? "…" : "Rejoindre"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty */}
            {filteredMine.length === 0 && filteredPublic.length === 0 && (
              <div className="flex flex-col items-center justify-center"
                style={{ background: "#fff", borderRadius: 18, padding: "40px 20px", border: "1px solid #E5E8EE", color: "#8A93A6", fontSize: 14, fontWeight: 600, gap: 10, marginTop: 8, textAlign: "center" }}>
                <span style={{ fontSize: 40 }}>👥</span>
                <span>Aucune équipe trouvée</span>
                <button onClick={() => setShowCreate(true)} style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "#FF6B35", background: "none", border: "none", cursor: "pointer" }}>
                  Crée la première →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Create Team Modal ── */}
      {showCreate && (
        <div
          className="fixed inset-0 flex items-end"
          style={{ zIndex: 100, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div
            style={{
              width: "100%", background: "#fff", borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              animation: "slideUp 0.25s ease",
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.3 }}>Créer une équipe</p>
              <button onClick={() => setShowCreate(false)} style={{ background: "#F1F3F7", border: "none", borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} color="#5B6478" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              {/* Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A", display: "block", marginBottom: 6 }}>Nom de l'équipe</label>
                <input
                  type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Les Invincibles"
                  style={{ width: "100%", height: 48, borderRadius: 12, border: "1.5px solid #E5E8EE", padding: "0 14px", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Sport */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A", display: "block", marginBottom: 6 }}>Sport</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {SPORTS_LIST.map((s) => (
                    <button key={s.id} type="button" onClick={() => setForm((f) => ({ ...f, sport: s.id }))}
                      style={{
                        height: 56, borderRadius: 12, border: form.sport === s.id ? "none" : "1.5px solid #E5E8EE",
                        background: form.sport === s.id ? s.color : "#F1F3F7",
                        color: form.sport === s.id ? "#fff" : "#1A2B4A",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                        fontSize: 10, fontWeight: 700, transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level + Location row */}
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A", display: "block", marginBottom: 6 }}>Niveau</label>
                  <div style={{ position: "relative" }}>
                    <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                      style={{ width: "100%", height: 44, borderRadius: 12, border: "1.5px solid #E5E8EE", padding: "0 12px", fontSize: 13, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit", outline: "none", background: "#fff", appearance: "none" }}>
                      {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                    <ChevronDown size={14} color="#8A93A6" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A", display: "block", marginBottom: 6 }}>Ville (optionnel)</label>
                  <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Paris"
                    style={{ width: "100%", height: 44, borderRadius: 12, border: "1.5px solid #E5E8EE", padding: "0 12px", fontSize: 13, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center justify-between" style={{ padding: "12px 14px", background: "#F1F3F7", borderRadius: 12, marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>Équipe publique</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6", marginTop: 1 }}>Visible par tous dans la découverte</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
                  style={{
                    width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
                    background: form.isPublic ? "#FF6B35" : "#D5DAE3",
                    position: "relative", transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    left: form.isPublic ? 22 : 2,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>

              <button
                type="submit" disabled={creating || !form.name.trim()}
                style={{
                  width: "100%", height: 52, borderRadius: 14, border: "none", cursor: "pointer",
                  background: form.name.trim() ? "linear-gradient(135deg, #FF6B35, #E5551F)" : "#F1F3F7",
                  color: form.name.trim() ? "#fff" : "#8A93A6",
                  fontSize: 16, fontWeight: 800, letterSpacing: -0.2,
                  boxShadow: form.name.trim() ? "0 6px 18px -6px rgba(255,107,53,0.55)" : "none",
                  transition: "all 0.15s", opacity: creating ? 0.7 : 1,
                }}
              >
                {creating ? "Création…" : "Créer l'équipe 🎉"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
