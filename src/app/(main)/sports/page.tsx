"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Plus, X, Send } from "lucide-react";

type Sport = {
  id: string; slug: string; name: string;
  emoji: string; color: string; is_active: boolean;
};

type Proposal = {
  id: string; name: string; emoji: string;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const STATUS_META = {
  pending:  { bg: "#FFF7ED", text: "#EA580C", label: "En attente" },
  approved: { bg: "#D1FAE5", text: "#22C55E", label: "Approuvée" },
  rejected: { bg: "#FEE2E2", text: "#EF4444", label: "Rejetée" },
};

const EMPTY_FORM = { name: "", emoji: "🏅", description: "" };

function SportSkeleton() {
  return (
    <div style={{
      height: 100, borderRadius: 16, background: "#E5E8EE",
      animation: "shimmer 1.4s infinite linear",
      backgroundImage: "linear-gradient(90deg,#E5E8EE 0%,#f0f2f5 40%,#E5E8EE 80%)",
      backgroundSize: "400px 100%",
    }} />
  );
}

export default function SportsPage() {
  const router = useRouter();

  const [sports, setSports] = useState<Sport[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: sportsData }, { data: { session } }] = await Promise.all([
        supabase.from("sports").select("*").eq("is_active", true).order("name"),
        supabase.auth.getSession(),
      ]);
      setSports(sportsData ?? []);

      if (session?.user) {
        setUserId(session.user.id);
        const { data: propData } = await supabase
          .from("sport_proposals")
          .select("id, name, emoji, description, status, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        setProposals((propData as Proposal[]) ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { router.push("/login"); return; }
    if (!form.name.trim()) return;
    setSubmitting(true);
    const { data } = await supabase
      .from("sport_proposals")
      .insert({
        user_id: userId,
        name: form.name.trim(),
        emoji: form.emoji || "🏅",
        description: form.description.trim() || null,
      })
      .select("id, name, emoji, description, status, created_at")
      .single();
    if (data) setProposals((prev) => [data as Proposal, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
    setSubmitting(false);
  }

  async function handleDeleteProposal(id: string) {
    setDeletingId(id);
    await supabase.from("sport_proposals").delete().eq("id", id);
    setProposals((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F6F7FA",
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      paddingBottom: 90,
    }}>
      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "linear-gradient(135deg, #1A2B4A 0%, #1e3a5f 60%, #1a3a4a 100%)",
        padding: "0 16px 20px",
        paddingTop: "env(safe-area-inset-top, 16px)",
      }}>
        {/* Top bar */}
        <div className="flex items-center gap-3" style={{ paddingTop: 16, marginBottom: 16 }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: "rgba(255,255,255,0.1)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: 22, fontWeight: 800, color: "#fff",
              letterSpacing: -0.4, lineHeight: 1,
            }}>
              Sports
            </h1>
            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
              Découvrez tous les sports disponibles
            </p>
          </div>
          {/* Emoji décoratif */}
          <span style={{ fontSize: 30, lineHeight: 1, opacity: 0.8 }}>🏟️</span>
        </div>

        {/* CTA proposer */}
        <button
          onClick={() => { if (!userId) { router.push("/login"); return; } setShowForm(!showForm); }}
          className="flex items-center gap-2"
          style={{
            width: "100%", height: 44, borderRadius: 999,
            background: showForm
              ? "rgba(255,255,255,0.12)"
              : "linear-gradient(135deg, #FF6B35, #E5551F)",
            border: showForm ? "1.5px solid rgba(255,255,255,0.2)" : "none",
            color: "#fff", cursor: "pointer",
            fontSize: 14, fontWeight: 700,
            justifyContent: "center",
            boxShadow: showForm ? "none" : "0 4px 16px rgba(255,107,53,0.45)",
            transition: "all 0.2s ease",
          }}
        >
          <Plus size={17} strokeWidth={2.5} />
          {showForm ? "Annuler la proposition" : "Proposer un sport"}
        </button>
      </div>

      <div style={{ padding: "20px 16px 0" }}>

        {/* ── Succès feedback ── */}
        {success && (
          <div style={{
            background: "#D1FAE5", border: "1.5px solid #6EE7B7",
            borderRadius: 14, padding: "12px 16px",
            marginBottom: 16,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>
              Proposition envoyée ! Les admins l'examineront bientôt.
            </p>
          </div>
        )}

        {/* ── Formulaire proposition ── */}
        {showForm && (
          <div style={{
            background: "#fff", borderRadius: 20,
            border: "1px solid #E5E8EE",
            boxShadow: "0 4px 24px rgba(26,43,74,0.10)",
            padding: 20, marginBottom: 20,
          }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", marginBottom: 16 }}>
              Nouvelle proposition
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Nom */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#5B6478", display: "block", marginBottom: 5 }}>
                    Nom du sport *
                  </label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="ex: Badminton, Escrime, Natation…"
                    style={{
                      width: "100%", height: 46, borderRadius: 12,
                      border: "1.5px solid #E5E8EE", padding: "0 14px",
                      fontSize: 15, fontWeight: 600, color: "#1A2B4A",
                      fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Emoji */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#5B6478", display: "block", marginBottom: 5 }}>
                    Emoji représentatif
                  </label>
                  <input
                    type="text" value={form.emoji} maxLength={2}
                    onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                    style={{
                      width: 64, height: 46, borderRadius: 12,
                      border: "1.5px solid #E5E8EE", padding: "0 10px",
                      fontSize: 24, textAlign: "center",
                      fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#5B6478", display: "block", marginBottom: 5 }}>
                    Pourquoi ce sport ? <span style={{ fontWeight: 500, color: "#8A93A6" }}>(optionnel)</span>
                  </label>
                  <textarea
                    value={form.description} maxLength={200}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Décris ce sport et pourquoi la communauté TeamUp! devrait le pratiquer…"
                    rows={3}
                    style={{
                      width: "100%", borderRadius: 12,
                      border: "1.5px solid #E5E8EE", padding: "12px 14px",
                      fontSize: 14, fontWeight: 500, color: "#1A2B4A",
                      fontFamily: "inherit", outline: "none", resize: "none",
                      boxSizing: "border-box", lineHeight: 1.5,
                    }}
                  />
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6", marginTop: 4, textAlign: "right" }}>
                    {form.description.length}/200
                  </p>
                </div>

                <button
                  type="submit" disabled={submitting || !form.name.trim()}
                  className="flex items-center justify-center gap-2"
                  style={{
                    height: 48, borderRadius: 999,
                    background: "linear-gradient(135deg, #FF6B35, #E5551F)",
                    color: "#fff", border: "none", cursor: "pointer",
                    fontSize: 15, fontWeight: 700,
                    boxShadow: "0 4px 16px rgba(255,107,53,0.35)",
                    opacity: submitting || !form.name.trim() ? 0.6 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  <Send size={16} strokeWidth={2.5} />
                  {submitting ? "Envoi…" : "Envoyer la proposition"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Sports disponibles ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#8A93A6", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>
            {loading ? "Chargement…" : `${sports.length} sport${sports.length !== 1 ? "s" : ""} disponible${sports.length !== 1 ? "s" : ""}`}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SportSkeleton key={i} />)
            ) : sports.length === 0 ? (
              <div style={{
                gridColumn: "1 / -1", padding: "40px 20px", textAlign: "center",
                background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE",
              }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🏅</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>Aucun sport disponible</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 4 }}>
                  Soyez le premier à en proposer un !
                </p>
              </div>
            ) : (
              sports.map((sport) => (
                <div
                  key={sport.id}
                  className="tap-scale"
                  style={{
                    height: 100, borderRadius: 16,
                    background: sport.color + "14",
                    border: `1.5px solid ${sport.color}30`,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 8, cursor: "default",
                    transition: "transform 0.12s ease, box-shadow 0.12s ease",
                  }}
                >
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{sport.emoji}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 800, color: "#1A2B4A",
                    textAlign: "center", lineHeight: 1.2,
                    padding: "0 8px",
                  }}>
                    {sport.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Mes propositions ── */}
        {proposals.length > 0 && (
          <div>
            <p style={{
              fontSize: 13, fontWeight: 700, color: "#8A93A6",
              letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12,
            }}>
              Mes propositions
            </p>
            <div style={{
              background: "#fff", borderRadius: 18,
              border: "1px solid #E5E8EE", overflow: "hidden",
              boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.10)",
            }}>
              {proposals.map((proposal, idx) => {
                const st = STATUS_META[proposal.status];
                return (
                  <div
                    key={proposal.id}
                    className="flex items-center gap-3"
                    style={{
                      padding: "13px 16px",
                      borderBottom: idx < proposals.length - 1 ? "1px solid #F1F3F7" : "none",
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{proposal.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>{proposal.name}</p>
                      {proposal.description && (
                        <p style={{
                          fontSize: 12, fontWeight: 500, color: "#8A93A6", marginTop: 2,
                          overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                        }}>
                          {proposal.description}
                        </p>
                      )}
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, borderRadius: 999,
                      padding: "3px 10px", background: st.bg, color: st.text,
                      flexShrink: 0,
                    }}>
                      {st.label}
                    </span>
                    {proposal.status === "pending" && (
                      <button
                        onClick={() => handleDeleteProposal(proposal.id)}
                        disabled={deletingId === proposal.id}
                        title="Annuler la proposition"
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: "#F1F3F7", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, opacity: deletingId === proposal.id ? 0.5 : 1,
                        }}
                      >
                        <X size={13} color="#8A93A6" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
