"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Share2, Heart, MessageSquare } from "lucide-react";
import { supabase, type Event, type EventParticipant } from "@/lib/supabase";

const SPORT_META: Record<string, { emoji: string; label: string; gradient: string; color: string }> = {
  basket: { emoji: "🏀", label: "Basket", gradient: "linear-gradient(160deg, #FF6B35 0%, #E5551F 100%)", color: "#FF6B35" },
  foot: { emoji: "⚽", label: "Foot", gradient: "linear-gradient(160deg, #2EC4B6 0%, #1FA89B 100%)", color: "#2EC4B6" },
  tennis: { emoji: "🎾", label: "Tennis", gradient: "linear-gradient(160deg, #F4B43A 0%, #E09B2A 100%)", color: "#F4B43A" },
  padel: { emoji: "🏓", label: "Padel", gradient: "linear-gradient(160deg, #3B82F6 0%, #2563EB 100%)", color: "#3B82F6" },
  running: { emoji: "🏃", label: "Running", gradient: "linear-gradient(160deg, #7B61FF 0%, #5B41DF 100%)", color: "#7B61FF" },
  volley: { emoji: "🏐", label: "Volley", gradient: "linear-gradient(160deg, #EC4899 0%, #DB2777 100%)", color: "#EC4899" },
  yoga: { emoji: "🧘", label: "Yoga", gradient: "linear-gradient(160deg, #14B8A6 0%, #0D9488 100%)", color: "#14B8A6" },
  velo: { emoji: "🚴", label: "Vélo", gradient: "linear-gradient(160deg, #06B6D4 0%, #0891B2 100%)", color: "#06B6D4" },
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Confirmé",
  expert: "Expert",
  all: "Tous niveaux",
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #FF6B35, #E5551F)",
  "linear-gradient(135deg, #2EC4B6, #1FA89B)",
  "linear-gradient(135deg, #7B61FF, #5B41DF)",
  "linear-gradient(135deg, #EC4899, #DB2777)",
  "linear-gradient(135deg, #1A2B4A, #243757)",
  "linear-gradient(135deg, #F4B43A, #E09B2A)",
  "linear-gradient(135deg, #22C55E, #16A34A)",
  "linear-gradient(135deg, #3B82F6, #2563EB)",
];

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatTime(timeStr: string) {
  return timeStr.slice(0, 5).replace(":", "h");
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function MiniMap({ emoji }: { emoji: string }) {
  return (
    <div className="relative overflow-hidden" style={{ height: 120, background: "linear-gradient(135deg, #e8f4fd 0%, #d6eef8 100%)" }}>
      <style>{`
        @keyframes pin-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.25 }}>
        {[25, 50, 75].map((y) => (
          <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#5B6478" strokeWidth="1" />
        ))}
        {[20, 40, 60, 80].map((x) => (
          <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#5B6478" strokeWidth="1" />
        ))}
        <line x1="0" y1="42%" x2="100%" y2="42%" stroke="#5B6478" strokeWidth="2.5" />
        <line x1="46%" y1="0" x2="46%" y2="100%" stroke="#5B6478" strokeWidth="2.5" />
        <line x1="0" y1="20%" x2="60%" y2="65%" stroke="#5B6478" strokeWidth="1.5" />
      </svg>
      <div className="absolute" style={{ left: "46%", top: "42%", transform: "translate(-50%,-50%)" }}>
        <div className="relative flex items-center justify-center" style={{ width: 20, height: 20 }}>
          <div className="absolute inset-0 rounded-full" style={{ background: "rgba(255,107,53,0.35)", animation: "pin-pulse 1.6s ease-out infinite" }} />
          <div className="rounded-full border-2 border-white" style={{ width: 12, height: 12, background: "#FF6B35", position: "relative", zIndex: 2 }} />
        </div>
        <span style={{ fontSize: 14, position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)" }}>{emoji}</span>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user.id ?? null);

      const [{ data: eventData }, { data: participantsData }] = await Promise.all([
        supabase.from("events")
          .select("*, organizer:profiles!organizer_id(*), terrain:terrains!terrain_id(*)")
          .eq("id", eventId)
          .single(),
        supabase.from("event_participants")
          .select("*, profile:profiles!user_id(*)")
          .eq("event_id", eventId)
          .eq("status", "confirmed"),
      ]);

      setEvent(eventData);
      setParticipants(participantsData ?? []);

      if (session && participantsData) {
        setJoined((participantsData as EventParticipant[]).some((p) => p.user_id === session.user.id));
      }

      setLoading(false);
    }
    load();
  }, [eventId]);

  async function handleJoin() {
    if (!currentUserId || !event || joining) return;
    setJoining(true);

    if (joined) {
      await supabase.from("event_participants")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", currentUserId);
      setParticipants((prev) => prev.filter((p) => p.user_id !== currentUserId));
      setJoined(false);
    } else {
      const { data } = await supabase.from("event_participants")
        .insert({ event_id: event.id, user_id: currentUserId, status: "confirmed" })
        .select("*, profile:profiles!user_id(*)")
        .single();
      if (data) {
        setParticipants((prev) => [...prev, data as EventParticipant]);
        setJoined(true);
      }
    }
    setJoining(false);
  }

  if (loading) {
    return (
      <div style={{ background: "#F6F7FA", minHeight: "100vh", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
        <div className="skeleton" style={{ height: 310 }} />
        <div style={{ padding: "16px" }}>
          <div className="skeleton" style={{ height: 80, borderRadius: 20, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 60, borderRadius: 18, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>😕</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#1A2B4A" }}>Événement introuvable</p>
        <button onClick={() => router.push("/events")} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, background: "#FF6B35", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          Retour aux events
        </button>
      </div>
    );
  }

  const sport = SPORT_META[event.sport] ?? {
    emoji: "🏃", label: event.sport,
    gradient: "linear-gradient(160deg, #FF6B35 0%, #E5551F 100%)",
    color: "#FF6B35",
  };
  const levelLabel = LEVEL_LABELS[event.level] ?? event.level;
  const emptySlots = Math.max(0, event.max_players - participants.length);
  const organizerInitials = getInitials(event.organizer?.full_name);
  const fillPct = Math.min((participants.length / event.max_players) * 100, 100);

  return (
    <div
      className="relative min-h-screen"
      style={{ background: "#F6F7FA", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', paddingBottom: 160 }}
    >
      {/* Cover Hero */}
      <div className="relative overflow-hidden" style={{ height: 310 }}>
        <div className="absolute inset-0" style={{ background: sport.gradient }} />
        <div className="absolute pointer-events-none select-none" style={{ fontSize: 180, right: -20, top: "50%", transform: "translateY(-60%)", opacity: 0.13, lineHeight: 1 }}>
          {sport.emoji}
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.58) 0%, transparent 58%)" }} />

        {/* Top bar */}
        <div className="absolute left-0 right-0 flex items-center justify-between" style={{ top: 48, padding: "0 16px" }}>
          <button
            onClick={() => router.push("/events")}
            className="flex items-center justify-center tap-scale"
            style={{ width: 40, height: 40, borderRadius: 14, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            <ChevronLeft size={20} color="white" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center tap-scale" style={{ width: 40, height: 40, borderRadius: 14, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <Share2 size={18} color="white" strokeWidth={2} />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="flex items-center justify-center tap-scale"
              style={{ width: 40, height: 40, borderRadius: 14, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", transition: "all 0.18s ease" }}
            >
              <Heart size={18} strokeWidth={2} color={liked ? "#FF6B35" : "white"} fill={liked ? "#FF6B35" : "none"} style={{ transition: "all 0.18s ease" }} />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="absolute left-0 right-0" style={{ bottom: 20, padding: "0 16px" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: 11, fontWeight: 700, color: "white", background: sport.color, borderRadius: 999, padding: "4px 12px" }}>
              {sport.emoji} {sport.label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "white", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", borderRadius: 999, padding: "4px 12px", border: "1px solid rgba(255,255,255,0.2)" }}>
              {levelLabel}
            </span>
          </div>
          <h1 className="text-white font-extrabold" style={{ fontSize: 26, letterSpacing: -0.5, lineHeight: 1.2, marginTop: 8 }}>
            {event.title}
          </h1>
        </div>
      </div>

      {/* Info card */}
      <div style={{ margin: "0 12px", transform: "translateY(-22px)", background: "#fff", borderRadius: 20, padding: 16, border: "1px solid #E5E8EE", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 10, background: "#1A2B4A", fontSize: 17 }}>🗓️</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6", marginBottom: 2 }}>Quand</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>{formatDate(event.event_date)}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#5B6478" }}>{formatTime(event.start_time)} · {formatDuration(event.duration_min)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 10, background: "#FFE6DA", fontSize: 17 }}>📍</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6", marginBottom: 2 }}>Où</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
              {event.terrain?.name ?? event.location_text ?? "Non défini"}
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#5B6478" }}>
              {event.terrain?.district ?? event.terrain?.address?.split(",")[0] ?? ""}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: -10 }}>

        {/* Organizer */}
        <div style={{ margin: "0 16px", background: "#fff", borderRadius: 18, padding: "14px 16px", border: "1px solid #E5E8EE", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full text-white font-extrabold flex-shrink-0" style={{ width: 44, height: 44, background: "linear-gradient(135deg, #FF6B35, #E5551F)", fontSize: 14, letterSpacing: -0.5 }}>
              {organizerInitials}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>{event.organizer?.full_name ?? "Organisateur"}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#5B6478" }}>Organisateur</p>
            </div>
          </div>
          <button className="tap-scale" style={{ height: 32, borderRadius: 999, padding: "0 14px", fontSize: 13, fontWeight: 700, color: "#1A2B4A", background: "transparent", border: "1px solid #E5E8EE", cursor: "pointer" }}>
            Profil
          </button>
        </div>

        {/* Participants */}
        <div style={{ margin: "16px 16px 0" }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>Participants</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: sport.color }}>{participants.length}/{event.max_players}</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "#F1F3F7", marginTop: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${fillPct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${sport.color}, ${sport.color}cc)`, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8, marginTop: 14 }}>
            {participants.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-center rounded-xl text-white font-extrabold"
                style={{ width: 44, height: 44, background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length], fontSize: 12, letterSpacing: -0.3, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              >
                {getInitials(p.profile?.full_name)}
              </div>
            ))}
            {Array.from({ length: Math.min(emptySlots, Math.max(0, 8 - participants.length)) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center justify-center rounded-xl font-bold" style={{ width: 44, height: 44, background: "#F1F3F7", border: "1.5px dashed #D5DAE3", fontSize: 20, color: "#8A93A6" }}>
                +
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div style={{ margin: "16px 16px 0", background: "#fff", borderRadius: 18, padding: "14px 16px", border: "1px solid #E5E8EE", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A", marginBottom: 8 }}>Description</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#5B6478", lineHeight: 1.6 }}>{event.description}</p>
          </div>
        )}

        {/* Terrain */}
        {(event.terrain || event.location_text) && (
          <div style={{ margin: "20px 16px 0" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>Le terrain</span>
            <div style={{ marginTop: 12, borderRadius: 16, border: "1px solid #E5E8EE", overflow: "hidden", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)" }}>
              <MiniMap emoji={sport.emoji} />
              <div className="flex items-center justify-between" style={{ padding: "12px 14px", background: "#fff" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>
                    {event.terrain?.name ?? event.location_text ?? "Terrain"}
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#5B6478", marginTop: 2 }}>
                    {[event.terrain?.district, event.terrain?.price_hour === 0 ? "Gratuit" : event.terrain?.price_hour ? `${event.terrain.price_hour}€/h` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button className="tap-scale" style={{ height: 30, borderRadius: 999, padding: "0 12px", fontSize: 12, fontWeight: 700, color: "white", background: "#1A2B4A", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Itinéraire →
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CTA Bar */}
      <div
        className="fixed left-0 right-0 flex items-center gap-3"
        style={{ background: "#fff", borderTop: "1px solid #E5E8EE", padding: "12px 16px", bottom: 72, zIndex: 50 }}
      >
        <Link
          href="/teams"
          className="flex items-center justify-center tap-scale flex-shrink-0"
          style={{ width: 52, height: 52, borderRadius: 14, background: "#F1F3F7", textDecoration: "none" }}
        >
          <MessageSquare size={22} color="#1A2B4A" strokeWidth={2} />
        </Link>
        <button
          onClick={handleJoin}
          disabled={joining || event.status === "cancelled"}
          className="tap-scale flex items-center justify-center font-bold text-white"
          style={{
            flex: 1, height: 52, borderRadius: 14, fontSize: 16, border: "none",
            cursor: joining || event.status === "cancelled" ? "not-allowed" : "pointer",
            background: joined ? "#2EC4B6" : `linear-gradient(135deg, ${sport.color}, ${sport.color}cc)`,
            boxShadow: joined ? "0 6px 18px -6px rgba(46,196,182,0.5)" : `0 6px 18px -6px ${sport.color}88`,
            transition: "all 0.22s ease",
            letterSpacing: -0.2,
            opacity: joining ? 0.7 : 1,
          }}
        >
          {joining
            ? "…"
            : joined
            ? "✓ Tu participes !"
            : event.status === "cancelled"
            ? "Événement annulé"
            : event.status === "full"
            ? "Complet"
            : "Rejoindre l'événement"}
        </button>
      </div>
    </div>
  );
}
