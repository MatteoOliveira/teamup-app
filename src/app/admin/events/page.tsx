"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import { Search, Trash2, Clock, Users } from "lucide-react";

const SPORT_EMOJI: Record<string, string> = {
  basket: "🏀", foot: "⚽", tennis: "🎾", running: "🏃",
  volley: "🏐", padel: "🏓", velo: "🚴", yoga: "🧘",
};

const STATUS_META: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: "#D6F4F1", text: "#1FA89B", label: "Ouvert" },
  full: { bg: "#FEF3C7", text: "#D97706", label: "Complet" },
  cancelled: { bg: "#FEE2E2", text: "#EF4444", label: "Annulé" },
  done: { bg: "#F1F3F7", text: "#8A93A6", label: "Terminé" },
};

const LEVEL_LABEL: Record<string, string> = {
  all: "Tous niveaux", beginner: "Débutant",
  intermediate: "Intermédiaire", advanced: "Confirmé",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadEvents() {
    let q = supabase.from("events").select("*").order("event_date", { ascending: true });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data } = await q;
    setEvents(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadEvents(); }, [statusFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet événement définitivement ?")) return;
    setDeletingId(id);
    await supabase.from("events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  }

  async function handleStatusChange(id: string, status: string) {
    await supabase.from("events").update({ status }).eq("id", id);
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status: status as Event["status"] } : e));
  }

  const filtered = events.filter((e) =>
    !query || e.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4 }}>
          Événements
        </h1>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 2 }}>
          {events.length} événement{events.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <div
          className="flex items-center gap-2"
          style={{ height: 40, borderRadius: 999, background: "#fff", border: "1px solid #E5E8EE", padding: "0 14px", flex: 1, maxWidth: 320 }}
        >
          <Search size={15} color="#8A93A6" strokeWidth={2} />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit" }}
          />
        </div>
        {["all", "open", "full", "cancelled", "done"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{
              height: 36, borderRadius: 999, padding: "0 14px",
              fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              background: statusFilter === s ? "#1A2B4A" : "#fff",
              color: statusFilter === s ? "#fff" : "#5B6478",
              boxShadow: statusFilter === s ? "none" : "0 0 0 1px #E5E8EE",
            }}
          >
            {s === "all" ? "Tous" : STATUS_META[s]?.label}
          </button>
        ))}
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
          <div style={{ padding: 32, textAlign: "center", color: "#8A93A6", fontSize: 14, fontWeight: 600 }}>Aucun événement</div>
        ) : (
          filtered.map((event, idx) => {
            const st = STATUS_META[event.status] ?? STATUS_META.open;
            const emoji = SPORT_EMOJI[event.sport] ?? "🏅";
            return (
              <div
                key={event.id}
                className="flex items-center gap-3"
                style={{
                  padding: "14px 18px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid #F1F3F7" : "none",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {event.title}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 3 }}>
                    <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                      <Clock size={11} strokeWidth={2.5} />
                      {new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · {event.start_time.slice(0, 5)}
                    </span>
                    <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                      <Users size={11} strokeWidth={2.5} />
                      {event.current_players}/{event.max_players}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                      {LEVEL_LABEL[event.level]}
                    </span>
                  </div>
                </div>

                {/* Status select */}
                <select
                  value={event.status}
                  onChange={(e) => handleStatusChange(event.id, e.target.value)}
                  style={{
                    fontSize: 11, fontWeight: 700,
                    background: st.bg, color: st.text,
                    borderRadius: 999, padding: "4px 10px",
                    border: "none", cursor: "pointer", flexShrink: 0,
                    fontFamily: "inherit",
                  }}
                >
                  {Object.entries(STATUS_META).map(([val, meta]) => (
                    <option key={val} value={val}>{meta.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "#FEE2E2", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, opacity: deletingId === event.id ? 0.5 : 1,
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
