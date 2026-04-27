"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Plus, Trash2, Check, X, ChevronDown } from "lucide-react";

type Sport = {
  id: string; slug: string; name: string;
  emoji: string; color: string; is_active: boolean; created_at: string;
};

type Proposal = {
  id: string; user_id: string; name: string; emoji: string;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null; created_at: string;
  user: { full_name: string | null; username: string | null; avatar_url: string | null } | null;
};

const EMPTY_FORM = { name: "", slug: "", emoji: "🏅", color: "#FF6B35" };

const STATUS_META = {
  pending:  { bg: "#FFF7ED", text: "#EA580C", label: "En attente" },
  approved: { bg: "#D1FAE5", text: "#22C55E", label: "Approuvée" },
  rejected: { bg: "#FEE2E2", text: "#EF4444", label: "Rejetée" },
};

function slugify(str: string) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function UserAvatar({ user }: { user: Proposal["user"] }) {
  const name = user?.full_name ?? user?.username ?? "?";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (user?.avatar_url) {
    return <img src={user.avatar_url} alt={name}
      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #FF6B35, #E5551F)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 800, color: "#fff",
    }}>{initials}</div>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <div className="flex items-center gap-3" style={{ padding: "14px 18px", borderBottom: "1px solid #F1F3F7" }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: 120, height: 13, borderRadius: 6, marginBottom: 5 }} />
        <div className="skeleton" style={{ width: 70, height: 11, borderRadius: 6 }} />
      </div>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="skeleton" style={{ width: 32 + i * 10, height: 28, borderRadius: i === 0 ? 999 : 8, flexShrink: 0 }} />
      ))}
    </div>
  );
}

/* ─────────── Toggle Switch ─────────── */
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        width: 40, height: 22, borderRadius: 999, border: "none", cursor: disabled ? "default" : "pointer",
        background: checked ? "#22C55E" : "#D1D5DB",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        display: "block",
      }} />
    </button>
  );
}

export default function AdminSportsPage() {
  const [tab, setTab] = useState<"sports" | "proposals">("sports");

  /* ── Sports state ── */
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Proposals state ── */
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [propFilter, setPropFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [propQuery, setPropQuery] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  async function loadSports() {
    const { data } = await supabase.from("sports").select("*").order("name");
    setSports(data ?? []);
    setSportsLoading(false);
  }

  async function loadProposals() {
    const { data } = await supabase
      .from("sport_proposals")
      .select("*, user:profiles!user_id(full_name, username, avatar_url)")
      .order("created_at", { ascending: false });
    setProposals((data as Proposal[]) ?? []);
    setProposalsLoading(false);
  }

  useEffect(() => { loadSports(); loadProposals(); }, []);

  /* ── Name → slug auto ── */
  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: slugify(name) }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    setSaving(true);
    await supabase.from("sports").insert({
      slug: form.slug, name: form.name, emoji: form.emoji, color: form.color,
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    await loadSports();
    setSaving(false);
  }

  async function handleToggle(sport: Sport) {
    setTogglingId(sport.id);
    await supabase.from("sports").update({ is_active: !sport.is_active }).eq("id", sport.id);
    setSports((prev) => prev.map((s) => s.id === sport.id ? { ...s, is_active: !s.is_active } : s));
    setTogglingId(null);
  }

  async function handleDeleteSport(id: string) {
    if (!confirm("Supprimer ce sport ? Les événements qui l'utilisent ne seront pas affectés.")) return;
    setDeletingId(id);
    await supabase.from("sports").delete().eq("id", id);
    setSports((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  }

  async function handleApprove(proposal: Proposal) {
    setActingId(proposal.id);
    await supabase.from("sport_proposals").update({ status: "approved" }).eq("id", proposal.id);
    /* Auto-insert dans sports si pas déjà existant */
    const slug = slugify(proposal.name);
    const exists = sports.some((s) => s.slug === slug || s.name.toLowerCase() === proposal.name.toLowerCase());
    if (!exists) {
      await supabase.from("sports").insert({ slug, name: proposal.name, emoji: proposal.emoji, color: "#8A93A6" });
      await loadSports();
    }
    setProposals((prev) => prev.map((p) => p.id === proposal.id ? { ...p, status: "approved" } : p));
    setActingId(null);
  }

  async function handleReject(id: string) {
    setActingId(id);
    await supabase.from("sport_proposals").update({ status: "rejected" }).eq("id", id);
    setProposals((prev) => prev.map((p) => p.id === id ? { ...p, status: "rejected" } : p));
    setActingId(null);
  }

  const pendingCount = proposals.filter((p) => p.status === "pending").length;
  const filteredProposals = proposals.filter((p) => {
    if (propFilter !== "all" && p.status !== propFilter) return false;
    if (!propQuery) return true;
    const q = propQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
      (p.user?.full_name ?? "").toLowerCase().includes(q) ||
      (p.user?.username ?? "").toLowerCase().includes(q);
  });

  const CARD = {
    background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", overflow: "hidden",
    boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)",
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Page header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4 }}>Sports</h1>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 2 }}>
            {sports.length} sport{sports.length !== 1 ? "s" : ""} · {pendingCount} proposition{pendingCount !== 1 ? "s" : ""} en attente
          </p>
        </div>
        {tab === "sports" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
            style={{
              height: 36, borderRadius: 999, padding: "0 16px",
              background: "#FF6B35", color: "#fff", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 12px rgba(255,107,53,0.35)",
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Ajouter un sport
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ marginBottom: 20 }}>
        {(["sports", "proposals"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-2"
            style={{
              height: 36, borderRadius: 999, padding: "0 16px",
              fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              background: tab === t ? "#1A2B4A" : "#fff",
              color: tab === t ? "#fff" : "#5B6478",
              boxShadow: tab === t ? "none" : "0 0 0 1px #E5E8EE",
              transition: "all 0.15s ease",
            }}
          >
            {t === "sports" ? "Sports actifs" : "Propositions"}
            {t === "proposals" && pendingCount > 0 && (
              <span style={{
                background: tab === "proposals" ? "#FF6B35" : "#FF6B35",
                color: "#fff", borderRadius: 999,
                fontSize: 10, fontWeight: 800,
                padding: "1px 6px", lineHeight: 1.6,
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════ TAB: SPORTS ═══════════════ */}
      {tab === "sports" && (
        <>
          {/* Formulaire ajout */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              style={{ ...CARD, padding: 20, marginBottom: 20, borderRadius: 16 }}
            >
              <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", marginBottom: 16 }}>Nouveau sport</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {/* Nom */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#5B6478", display: "block", marginBottom: 4 }}>
                    Nom *
                  </label>
                  <input
                    type="text" value={form.name} required
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="ex: Badminton"
                    style={{
                      width: "100%", height: 40, borderRadius: 10,
                      border: "1.5px solid #E5E8EE", padding: "0 12px",
                      fontSize: 14, fontWeight: 600, color: "#1A2B4A",
                      fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                {/* Slug */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#5B6478", display: "block", marginBottom: 4 }}>
                    Slug (identifiant unique)
                  </label>
                  <input
                    type="text" value={form.slug} required
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="ex: badminton"
                    style={{
                      width: "100%", height: 40, borderRadius: 10,
                      border: "1.5px solid #E5E8EE", padding: "0 12px",
                      fontSize: 14, fontWeight: 600, color: "#1A2B4A",
                      fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                {/* Emoji */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#5B6478", display: "block", marginBottom: 4 }}>
                    Emoji
                  </label>
                  <input
                    type="text" value={form.emoji}
                    onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                    maxLength={2}
                    style={{
                      width: "100%", height: 40, borderRadius: 10,
                      border: "1.5px solid #E5E8EE", padding: "0 12px",
                      fontSize: 22, fontWeight: 600, color: "#1A2B4A",
                      fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                {/* Couleur */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#5B6478", display: "block", marginBottom: 4 }}>
                    Couleur
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color" value={form.color}
                      onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                      style={{
                        width: 40, height: 40, borderRadius: 10, border: "1.5px solid #E5E8EE",
                        cursor: "pointer", padding: 2, background: "#fff",
                      }}
                    />
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: form.color + "22",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20,
                    }}>
                      {form.emoji}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#5B6478" }}>{form.color}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3" style={{ marginTop: 16 }}>
                <button
                  type="submit" disabled={saving || !form.name || !form.slug}
                  style={{
                    height: 36, borderRadius: 999, padding: "0 20px",
                    background: "#FF6B35", color: "#fff", border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 700, opacity: saving || !form.name || !form.slug ? 0.6 : 1,
                  }}
                >
                  {saving ? "Enregistrement…" : "Créer le sport"}
                </button>
                <button
                  type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  style={{
                    height: 36, borderRadius: 999, padding: "0 20px",
                    background: "#F1F3F7", color: "#5B6478", border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Liste sports */}
          <div style={CARD}>
            {sportsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={2} />)
            ) : sports.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🏅</div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A" }}>Aucun sport configuré</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 4 }}>
                  Ajoutez votre premier sport avec le bouton ci-dessus.
                </p>
              </div>
            ) : (
              sports.map((sport, idx) => (
                <div
                  key={sport.id}
                  className="flex items-center gap-3"
                  style={{
                    padding: "13px 18px",
                    borderBottom: idx < sports.length - 1 ? "1px solid #F1F3F7" : "none",
                  }}
                >
                  {/* Emoji pill */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: sport.color + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}>
                    {sport.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>{sport.name}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6", marginTop: 1 }}>
                      slug: <code style={{ fontFamily: "monospace", color: sport.color }}>{sport.slug}</code>
                    </p>
                  </div>

                  {/* Color swatch */}
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, background: sport.color,
                    flexShrink: 0, border: "1px solid rgba(0,0,0,0.08)",
                  }} />

                  {/* Toggle actif */}
                  <Toggle
                    checked={sport.is_active}
                    onChange={() => handleToggle(sport)}
                    disabled={togglingId === sport.id}
                  />

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteSport(sport.id)}
                    disabled={deletingId === sport.id}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#FEE2E2", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, opacity: deletingId === sport.id ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={14} color="#EF4444" strokeWidth={2.5} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ═══════════════ TAB: PROPOSALS ═══════════════ */}
      {tab === "proposals" && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16 }}>
            <div
              className="flex items-center gap-2"
              style={{
                height: 40, borderRadius: 999, background: "#fff",
                border: "1px solid #E5E8EE", padding: "0 14px",
                flex: 1, maxWidth: 320,
              }}
            >
              <Search size={15} color="#8A93A6" strokeWidth={2} />
              <input
                type="text" value={propQuery}
                onChange={(e) => setPropQuery(e.target.value)}
                placeholder="Sport, utilisateur…"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit",
                }}
              />
            </div>
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setPropFilter(s)}
                style={{
                  height: 36, borderRadius: 999, padding: "0 14px",
                  fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
                  background: propFilter === s ? "#1A2B4A" : "#fff",
                  color: propFilter === s ? "#fff" : "#5B6478",
                  boxShadow: propFilter === s ? "none" : "0 0 0 1px #E5E8EE",
                  transition: "all 0.15s ease",
                }}
              >
                {s === "all" ? "Toutes" : STATUS_META[s].label}
              </button>
            ))}
          </div>

          {/* Proposals list */}
          <div style={CARD}>
            {proposalsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={3} />)
            ) : filteredProposals.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>💡</div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A" }}>Aucune proposition</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 4 }}>
                  {propQuery || propFilter !== "all"
                    ? "Essayez d'autres filtres"
                    : "Les propositions des utilisateurs apparaîtront ici."}
                </p>
              </div>
            ) : (
              filteredProposals.map((proposal, idx) => {
                const st = STATUS_META[proposal.status];
                const isPending = proposal.status === "pending";
                const isActing = actingId === proposal.id;
                return (
                  <div
                    key={proposal.id}
                    style={{
                      padding: "14px 18px",
                      borderBottom: idx < filteredProposals.length - 1 ? "1px solid #F1F3F7" : "none",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar user={proposal.user} />

                      {/* User + sport info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A" }}>
                            {proposal.user?.full_name ?? proposal.user?.username ?? "Utilisateur"}
                          </span>
                          {proposal.user?.username && (
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                              @{proposal.user.username}
                            </span>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#8A93A6" }}>·</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6" }}>
                            {new Date(proposal.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Sport proposé */}
                        <div className="flex items-center gap-2" style={{ marginBottom: proposal.description ? 6 : 0 }}>
                          <span style={{ fontSize: 20 }}>{proposal.emoji}</span>
                          <span style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A" }}>{proposal.name}</span>
                        </div>

                        {proposal.description && (
                          <p style={{
                            fontSize: 13, fontWeight: 500, color: "#5B6478",
                            overflow: "hidden", display: "-webkit-box",
                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          }}>
                            {proposal.description}
                          </p>
                        )}

                        {proposal.admin_note && (
                          <p style={{
                            fontSize: 12, fontWeight: 600, color: "#8A93A6",
                            marginTop: 4, fontStyle: "italic",
                          }}>
                            Note admin : {proposal.admin_note}
                          </p>
                        )}
                      </div>

                      {/* Right column: badge + actions */}
                      <div className="flex flex-col items-end gap-2" style={{ flexShrink: 0 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, borderRadius: 999,
                          padding: "3px 10px", background: st.bg, color: st.text,
                        }}>
                          {st.label}
                        </span>

                        {isPending && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(proposal)}
                              disabled={isActing}
                              title="Approuver"
                              style={{
                                height: 30, borderRadius: 8, padding: "0 12px",
                                background: "#D1FAE5", border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 4,
                                fontSize: 12, fontWeight: 700, color: "#22C55E",
                                opacity: isActing ? 0.5 : 1, transition: "opacity 0.15s",
                              }}
                            >
                              <Check size={13} strokeWidth={2.5} />
                              Approuver
                            </button>
                            <button
                              onClick={() => handleReject(proposal.id)}
                              disabled={isActing}
                              title="Rejeter"
                              style={{
                                height: 30, borderRadius: 8, padding: "0 12px",
                                background: "#FEE2E2", border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 4,
                                fontSize: 12, fontWeight: 700, color: "#EF4444",
                                opacity: isActing ? 0.5 : 1, transition: "opacity 0.15s",
                              }}
                            >
                              <X size={13} strokeWidth={2.5} />
                              Rejeter
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
