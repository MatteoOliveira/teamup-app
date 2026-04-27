"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Clock, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import { useSports } from "@/lib/useSports";

const LEVEL_LABELS: Record<string, string> = {
  all: "Tous niveaux", beginner: "Débutant",
  intermediate: "Intermédiaire", advanced: "Confirmé",
};

const AVATAR_COLORS = ["#FF6B35", "#2EC4B6", "#7B61FF", "#F4B43A", "#EC4899", "#1A2B4A", "#22C55E", "#3B82F6"];

function AvatarStack({ count, max }: { count: number; max: number }) {
  const visible = Math.min(count, 4);
  return (
    <div className="flex items-center" style={{ marginRight: 6 }}>
      {Array.from({ length: visible }).map((_, i) => (
        <div key={i} style={{
          width: 22, height: 22, borderRadius: "50%",
          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
          border: "2px solid #fff",
          marginLeft: i > 0 ? -8 : 0,
          zIndex: visible - i,
        }} />
      ))}
    </div>
  );
}

function EventCard({ event, joined, onJoin, sportRecord }: { event: Event; joined: boolean; onJoin: () => void; sportRecord: Record<string, { label: string; emoji: string; color: string; soft: string }> }) {
  const meta = sportRecord[event.sport] ?? { label: event.sport, emoji: "🏅", color: "#8A93A6", soft: "#F1F3F7" };
  const fillPct = Math.round((event.current_players / event.max_players) * 100);
  const almostFull = event.current_players >= event.max_players - 1;

  const dateStr = new Date(event.event_date).toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <div style={{
      background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE",
      boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.14)",
      overflow: "hidden",
    }}>
      <div style={{ height: 4, background: meta.color }} />
      <div style={{ padding: "14px 16px 16px" }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold" style={{ fontSize: 11, color: meta.color, background: meta.soft, borderRadius: 999, padding: "3px 10px" }}>
              {meta.emoji} {event.sport.charAt(0).toUpperCase() + event.sport.slice(1)}
            </span>
            <span className="font-bold" style={{ fontSize: 11, color: "#5B6478", background: "#F1F3F7", borderRadius: 999, padding: "3px 10px" }}>
              {LEVEL_LABELS[event.level] ?? event.level}
            </span>
            {almostFull && (
              <span className="font-bold" style={{ fontSize: 11, color: "#EF4444", background: "#FEE2E2", borderRadius: 999, padding: "3px 10px" }}>
                Presque complet
              </span>
            )}
          </div>
        </div>

        <Link href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
          <p className="font-extrabold" style={{ fontSize: 16, color: "#1A2B4A", marginTop: 10, lineHeight: 1.3, letterSpacing: -0.3 }}>
            {event.title}
          </p>
        </Link>

        <div className="flex items-center gap-1" style={{ marginTop: 8, fontSize: 12, color: "#5B6478", fontWeight: 600 }}>
          <Clock size={12} strokeWidth={2.5} />
          <span style={{ marginLeft: 4 }}>{dateStr} · {event.start_time.slice(0, 5)}</span>
          <span style={{ margin: "0 4px" }}>·</span>
          <span>{event.duration_min >= 60 ? `${Math.floor(event.duration_min / 60)}h${event.duration_min % 60 ? event.duration_min % 60 : ""}` : `${event.duration_min}min`}</span>
        </div>

        {event.location_text && (
          <div className="flex items-center gap-1" style={{ marginTop: 4, fontSize: 12, color: "#8A93A6", fontWeight: 600 }}>
            <MapPin size={12} strokeWidth={2.5} />
            <span style={{ marginLeft: 4 }}>{event.location_text}</span>
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginTop: 12, height: 4, borderRadius: 999, background: "#F1F3F7", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 999, width: `${fillPct}%`,
            background: almostFull ? "#EF4444" : meta.color,
            transition: "width 0.3s ease",
          }} />
        </div>

        <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
          <div className="flex items-center">
            <AvatarStack count={event.current_players} max={event.max_players} />
            <span style={{ fontSize: 12, color: "#8A93A6", fontWeight: 600 }}>
              {event.current_players}/{event.max_players} joueurs
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onJoin(); }}
            className="tap-scale font-bold"
            style={{
              height: 32, borderRadius: 999, padding: "0 16px", fontSize: 12,
              background: joined ? "#D6F4F1" : meta.color,
              color: joined ? "#1FA89B" : "#fff",
              border: "none", cursor: "pointer",
              transition: "all 0.18s ease", whiteSpace: "nowrap",
            }}
          >
            {joined ? "✓ Rejoint" : "Rejoindre"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { sports: dbSports, sportRecord } = useSports();
  const SPORT_FILTERS = [{ id: "all", label: "Tous", emoji: "" }, ...dbSports];
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSport, setActiveSport] = useState("all");
  const [query, setQuery] = useState("");
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      let q = supabase
        .from("events")
        .select("*")
        .eq("visibility", "public")
        .in("status", ["open", "full"])
        .order("event_date", { ascending: true });

      const { data } = await q;
      setEvents(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = events.filter((e) => {
    const matchSport = activeSport === "all" || e.sport === activeSport;
    const matchQ = !query || e.title.toLowerCase().includes(query.toLowerCase());
    return matchSport && matchQ;
  });

  function toggleJoin(id: string) {
    setJoinedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7FA", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: "1px solid #E5E8EE", padding: "48px 16px 12px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4 }}>Événements</p>
          <Link href="/events/create" className="tap-scale flex items-center gap-1 font-bold text-white"
            style={{ height: 34, borderRadius: 999, padding: "0 14px", background: "#FF6B35", fontSize: 13, boxShadow: "0 4px 12px rgba(255,107,53,0.35)", textDecoration: "none" }}>
            + Créer
          </Link>
        </div>

        <div className="flex items-center" style={{ height: 44, borderRadius: 999, background: "#F1F3F7", padding: "0 14px", gap: 8 }}>
          <Search size={16} color="#8A93A6" strokeWidth={2} />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un événement..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit" }}
          />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A93A6", fontSize: 16 }}>×</button>}
        </div>
      </div>

      {/* Chips */}
      <div className="flex items-center" style={{ gap: 8, padding: "12px 16px", overflowX: "scroll", scrollbarWidth: "none" }}>
        {SPORT_FILTERS.map((s) => {
          const active = activeSport === s.id;
          return (
            <button key={s.id} onClick={() => setActiveSport(s.id)} className="tap-scale"
              style={{
                height: 34, borderRadius: 999, padding: "0 14px", fontSize: 13, fontWeight: 700,
                border: active ? "none" : "1px solid #E5E8EE",
                background: active ? "#1A2B4A" : "#fff", color: active ? "#fff" : "#1A2B4A",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.18s ease",
              }}
            >
              {s.emoji ? `${s.emoji} ${s.label}` : s.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "4px 16px 12px" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6" }}>
          {loading ? "Chargement…" : `${filtered.length} événement${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col" style={{ gap: 12, padding: "0 16px" }}>
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 18 }} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center"
            style={{ background: "#fff", borderRadius: 18, padding: "40px 20px", border: "1px solid #E5E8EE", color: "#8A93A6", fontSize: 14, fontWeight: 600, gap: 10 }}>
            <span style={{ fontSize: 40 }}>🏟️</span>
            <span>Aucun événement trouvé</span>
            <Link href="/events/create" style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "#FF6B35", textDecoration: "none" }}>
              Créer le premier →
            </Link>
          </div>
        ) : (
          filtered.map((event) => (
            <EventCard key={event.id} event={event} joined={joinedIds.has(event.id)} onJoin={() => toggleJoin(event.id)} sportRecord={sportRecord} />
          ))
        )}
      </div>
    </div>
  );
}
