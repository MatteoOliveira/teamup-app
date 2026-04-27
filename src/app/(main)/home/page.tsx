"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, ChevronDown, SlidersHorizontal, Plus, Download, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Event, Profile } from "@/lib/supabase";
import { useSports } from "@/lib/useSports";
import { useInstallPWA } from "@/lib/useInstallPWA";

const EVENTS = [
  {
    id: 1,
    sport: "basket",
    sportLabel: "Basket",
    sportEmoji: "🏀",
    sportColor: "#FF6B35",
    sportSoft: "#FFE6DA",
    level: "Intermédiaire",
    title: "Basket 3vs3 — Buttes Chaumont",
    date: "Sam. 26 Avr · 15h00",
    duration: "1h30",
    current: 5,
    max: 8,
    avatarColors: ["#FF6B35", "#2EC4B6", "#7B61FF"],
  },
  {
    id: 2,
    sport: "foot",
    sportLabel: "Foot",
    sportEmoji: "⚽",
    sportColor: "#2EC4B6",
    sportSoft: "#D6F4F1",
    level: "Débutant",
    title: "Foot 5vs5 — Stade Charlety",
    date: "Dim. 27 Avr · 10h00",
    duration: "2h",
    current: 3,
    max: 10,
    avatarColors: ["#2EC4B6", "#1A2B4A", "#F4B43A"],
  },
];

const MAP_PINS = [
  { x: "28%", y: "38%", color: "#FF6B35", halo: "rgba(255,107,53,0.22)", label: "🏀" },
  { x: "62%", y: "55%", color: "#2EC4B6", halo: "rgba(46,196,182,0.22)", label: "⚽" },
  { x: "48%", y: "25%", color: "#F4B43A", halo: "rgba(244,180,58,0.22)", label: "🎾" },
];

function AvatarStack({ colors }: { colors: string[] }) {
  return (
    <div className="flex items-center" style={{ marginRight: 6 }}>
      {colors.map((c, i) => (
        <div
          key={i}
          className="rounded-full border-2 border-white flex items-center justify-center text-white font-bold"
          style={{
            width: 26,
            height: 26,
            background: c,
            marginLeft: i === 0 ? 0 : -6,
            fontSize: 9,
            zIndex: colors.length - i,
          }}
        >
          {["ML", "SA", "JB"][i]}
        </div>
      ))}
    </div>
  );
}

function EventCard({ event, sportRecord }: { event: Event; sportRecord: Record<string, { label: string; emoji: string; color: string; soft: string }> }) {
  const [joined, setJoined] = useState(false);
  const meta = sportRecord[event.sport] ?? { label: event.sport, emoji: "🏅", color: "#8A93A6", soft: "#F1F3F7" };
  const dateStr = new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  const dur = event.duration_min >= 60 ? `${Math.floor(event.duration_min / 60)}h${event.duration_min % 60 ? event.duration_min % 60 : ""}` : `${event.duration_min}min`;

  return (
    <div className="flex overflow-hidden"
      style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)" }}>
      <div style={{ width: 6, background: meta.color, flexShrink: 0 }} />
      <div style={{ padding: "14px 14px 14px 16px", flex: 1 }}>
        <Link href={`/events/${event.id}`} style={{ display: "block", textDecoration: "none" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold" style={{ fontSize: 11, color: meta.color, background: meta.soft, borderRadius: 999, padding: "3px 10px" }}>
              {meta.emoji} {meta.label}
            </span>
            <span className="font-bold" style={{ fontSize: 11, color: "#5B6478", background: "#F1F3F7", borderRadius: 999, padding: "3px 10px" }}>
              {LEVEL_LABELS[event.level] ?? event.level}
            </span>
          </div>
          <p className="font-extrabold" style={{ fontSize: 15, color: "#1A2B4A", marginTop: 8, lineHeight: 1.3, letterSpacing: -0.2 }}>
            {event.title}
          </p>
          <div className="flex items-center gap-3" style={{ marginTop: 5, fontSize: 13, color: "#5B6478", fontWeight: 600 }}>
            <span>📅 {dateStr} · {event.start_time.slice(0, 5)}</span>
            <span>⏱ {dur}</span>
          </div>
        </Link>
        <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
          <span style={{ fontSize: 12, color: "#8A93A6", fontWeight: 600 }}>
            {event.current_players}/{event.max_players} joueurs
          </span>
          <button onClick={() => setJoined(!joined)} className="tap-scale font-bold"
            style={{
              height: 30, borderRadius: 999, padding: "0 14px", fontSize: 12,
              background: joined ? "#D6F4F1" : meta.color,
              color: joined ? "#1FA89B" : "#fff",
              border: "none", cursor: "pointer", transition: "all 0.18s ease", whiteSpace: "nowrap",
            }}>
            {joined ? "✓ Rejoint" : "Rejoindre"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniMapPlaceholder() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderRadius: 20,
        height: 160,
        background: "linear-gradient(135deg, #e8f4fd 0%, #d6eef8 100%)",
        border: "1px solid #E5E8EE",
      }}
    >
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.28 }}>
        {[20, 40, 60, 80].map((y) => (
          <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#5B6478" strokeWidth="1" />
        ))}
        {[15, 30, 45, 60, 75, 90].map((x) => (
          <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#5B6478" strokeWidth="1" />
        ))}
        {/* Street-like lines */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#5B6478" strokeWidth="2.5" />
        <line x1="45%" y1="0" x2="45%" y2="100%" stroke="#5B6478" strokeWidth="2.5" />
        <line x1="0" y1="22%" x2="55%" y2="70%" stroke="#5B6478" strokeWidth="1.5" />
      </svg>

      {/* Map pins */}
      {MAP_PINS.map((pin, i) => (
        <div
          key={i}
          className="absolute flex items-center justify-center"
          style={{ left: pin.x, top: pin.y, transform: "translate(-50%, -50%)" }}
        >
          <div
            className="absolute rounded-full"
            style={{ width: 20, height: 20, background: pin.halo }}
          />
          <div
            className="relative flex items-center justify-center rounded-full text-white font-bold"
            style={{
              width: 10,
              height: 10,
              background: pin.color,
              zIndex: 2,
              fontSize: 6,
            }}
          />
          <span
            className="absolute"
            style={{ fontSize: 13, top: -18, left: "50%", transform: "translateX(-50%)" }}
          >
            {pin.label}
          </span>
        </div>
      ))}

      {/* User dot (pulsing blue) */}
      <div
        className="absolute"
        style={{ left: "50%", top: "52%", transform: "translate(-50%, -50%)" }}
      >
        <style>{`
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(2.2); opacity: 0; }
          }
        `}</style>
        <div className="relative flex items-center justify-center" style={{ width: 18, height: 18 }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "rgba(59,130,246,0.4)",
              animation: "pulse-ring 1.5s ease-out infinite",
            }}
          />
          <div
            className="rounded-full border-2 border-white"
            style={{ width: 12, height: 12, background: "#3B82F6" }}
          />
        </div>
      </div>

      {/* Badge overlay */}
      <div
        className="absolute top-3 right-3 flex items-center gap-1 font-semibold"
        style={{
          background: "#fff",
          borderRadius: 999,
          padding: "4px 10px",
          fontSize: 12,
          color: "#1A2B4A",
          boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)",
        }}
      >
        <span>📍</span> Près de toi
      </div>
    </div>
  );
}


const LEVEL_LABELS: Record<string, string> = {
  all: "Tous niveaux", beginner: "Débutant",
  intermediate: "Intermédiaire", advanced: "Confirmé",
};

export default function HomePage() {
  const router = useRouter();
  const { sports: dbSports, sportRecord } = useSports();
  const { canInstall, isIOS, isInstalled, install, hasNativePrompt } = useInstallPWA();
  const [installDismissed, setInstallDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const showInstallBanner = canInstall && !installDismissed;
  const SPORTS = [{ id: "all", label: "Tous", emoji: "", color: "", soft: "" }, ...dbSports];
  const [activeSport, setActiveSport] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const [{ data: profileData }, { count }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", session.user.id).single(),
          supabase.from("notifications").select("*", { count: "exact", head: true })
            .eq("user_id", session.user.id).eq("read", false),
        ]);
        setProfile(profileData);
        setUnreadCount(count ?? 0);
      }

      const { data: evData } = await supabase
        .from("events")
        .select("*")
        .eq("visibility", "public")
        .in("status", ["open", "full"])
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true })
        .limit(5);
      setEvents(evData ?? []);
      setLoadingEvents(false);
    }
    load();
  }, []);

  const filteredEvents = activeSport === "all"
    ? events
    : events.filter((e) => e.sport === activeSport);

  return (
    <div className="min-h-screen" style={{ background: "#F6F7FA", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>

      {/* Hero Header */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: "linear-gradient(160deg, #1A2B4A 0%, #243757 100%)",
          borderRadius: "0 0 28px 28px",
          padding: "48px 20px 24px",
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between">
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-full text-white font-extrabold"
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #FF6B35, #E5551F)",
              fontSize: 13,
              letterSpacing: -0.5,
            }}
          >
            {profile?.full_name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?"}
          </div>

          {/* Bell */}
          <button onClick={() => router.push("/notifications")} className="relative tap-scale"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Bell size={22} color="white" strokeWidth={2} />
            {unreadCount > 0 && (
              <div className="absolute flex items-center justify-center"
                style={{
                  minWidth: unreadCount > 9 ? 16 : 14, height: 14,
                  background: "#FF6B35", borderRadius: 999,
                  top: -2, right: -2, border: "1.5px solid #1A2B4A",
                  fontSize: 8, fontWeight: 800, color: "#fff", padding: "0 2px",
                }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </button>
        </div>

        {/* Location */}
        <div
          className="flex items-center gap-1 mt-3"
          style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}
        >
          <span>Paris, France</span>
          <ChevronDown size={14} color="rgba(255,255,255,0.55)" strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h1
          className="text-white font-extrabold"
          style={{ fontSize: 28, letterSpacing: -0.5, lineHeight: 1.2, marginTop: 4 }}
        >
          Quel match
          <br />
          aujourd'hui ?
        </h1>

        {/* Search bar */}
        <div
          className="flex items-center mt-4"
          style={{
            height: 46,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            padding: "0 6px 0 14px",
          }}
        >
          <Search size={16} color="rgba(255,255,255,0.6)" strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            className="flex-1 bg-transparent border-none outline-none font-semibold text-sm"
            style={{
              color: "white",
              marginLeft: 10,
              fontSize: 14,
            }}
          />
          <button
            className="flex items-center gap-1 font-bold text-white tap-scale"
            style={{
              height: 32,
              borderRadius: 999,
              padding: "0 14px",
              background: "#FF6B35",
              border: "none",
              fontSize: 13,
              cursor: "pointer",
              flexShrink: 0,
              letterSpacing: -0.2,
            }}
          >
            <SlidersHorizontal size={13} strokeWidth={2.5} />
            Filtres
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(3, 1fr)", margin: "16px 16px 0" }}
      >
        {[
          { emoji: "🏃", label: "Cette semaine", value: "3", sub: "matchs", valueColor: "#1A2B4A" },
          { emoji: "📍", label: "À 1 km", value: "12", sub: "events", valueColor: "#1A2B4A" },
          { emoji: "🔥", label: "Streak", value: "7j", sub: "consécutifs", valueColor: "#FF6B35" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 14,
              border: "1px solid #E5E8EE",
              boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)",
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.emoji}</div>
            <div
              style={{ fontSize: 22, fontWeight: 800, color: stat.valueColor, letterSpacing: -0.5, lineHeight: 1 }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: "#8A93A6", fontWeight: 600, marginTop: 3 }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bannière installation PWA ── */}
      {showInstallBanner && (
        <div style={{ margin: "14px 16px 0" }}>
          <div className="flex items-center gap-3"
            style={{
              background: "linear-gradient(135deg, #7B61FF14, #5B41DF0A)",
              border: "1.5px solid #7B61FF30",
              borderRadius: 16, padding: "12px 14px",
            }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, #7B61FF, #5B41DF)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>
              📲
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#1A2B4A", lineHeight: 1.2 }}>
                Installe TeamUp! sur ton téléphone
              </p>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6", marginTop: 2 }}>
                {isIOS ? "Safari → Partager → Sur l'écran d'accueil" : "Accès rapide, même hors connexion"}
              </p>
            </div>
            {!isIOS && hasNativePrompt && (
              <button
                onClick={async () => { setInstalling(true); await install(); setInstalling(false); }}
                disabled={installing}
                style={{
                  height: 32, borderRadius: 999, padding: "0 12px",
                  background: "linear-gradient(135deg, #7B61FF, #5B41DF)",
                  border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 700, color: "#fff",
                  flexShrink: 0, opacity: installing ? 0.7 : 1,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                <Download size={12} strokeWidth={2.5} />
                {installing ? "…" : "Installer"}
              </button>
            )}
            <button
              onClick={() => setInstallDismissed(true)}
              style={{
                width: 26, height: 26, borderRadius: 8, border: "none",
                background: "rgba(26,43,74,0.06)", cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <X size={13} color="#8A93A6" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Sports chips */}
      <div style={{ marginTop: 20, paddingLeft: 16, paddingRight: 16 }}>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>
            Sports
          </span>
          <Link href="/events" style={{ fontSize: 13, fontWeight: 600, color: "#FF6B35", textDecoration: "none" }}>
            Voir tout
          </Link>
        </div>

        <div
          className="flex items-center mt-3"
          style={{
            gap: 8,
            overflowX: "scroll",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingBottom: 4,
          }}
        >
          {SPORTS.map((sport) => {
            const active = activeSport === sport.id;
            return (
              <button
                key={sport.id}
                onClick={() => setActiveSport(sport.id)}
                className="tap-scale"
                style={{
                  height: 36,
                  borderRadius: 999,
                  padding: "0 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  border: active ? "none" : "1px solid #E5E8EE",
                  background: active ? "#1A2B4A" : "#F1F3F7",
                  color: active ? "#fff" : "#1A2B4A",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.18s ease",
                  flexShrink: 0,
                }}
              >
                {sport.emoji ? `${sport.emoji} ${sport.label}` : sport.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Proposer un sport */}
      <div style={{ padding: "10px 16px 0" }}>
        <Link
          href="/sports"
          className="flex items-center justify-center gap-2 tap-scale"
          style={{
            height: 40, borderRadius: 999,
            background: "rgba(255,107,53,0.08)",
            border: "1.5px dashed rgba(255,107,53,0.4)",
            color: "#FF6B35", textDecoration: "none",
            fontSize: 13, fontWeight: 700,
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Proposer un sport
        </Link>
      </div>

      {/* Mini Map */}
      <div style={{ margin: "16px 16px 0" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>
            Terrains proches
          </span>
          <Link href="/fields" style={{ fontSize: 13, fontWeight: 600, color: "#FF6B35", textDecoration: "none" }}>
            Voir tout
          </Link>
        </div>
        <MiniMapPlaceholder />
      </div>

      {/* Events section */}
      <div style={{ marginTop: 20, padding: "0 16px 32px" }}>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>
            À venir cette semaine
          </span>
          <Link href="/events" style={{ fontSize: 13, fontWeight: 600, color: "#FF6B35", textDecoration: "none" }}>
            Voir tout
          </Link>
        </div>

        <div className="flex flex-col" style={{ gap: 12, marginTop: 12 }}>
          {loadingEvents ? (
            [1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 18 }} />)
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => <EventCard key={event.id} event={event} sportRecord={sportRecord} />)
          ) : (
            <div className="flex flex-col items-center justify-center"
              style={{ background: "#fff", borderRadius: 18, padding: "32px 20px", border: "1px solid #E5E8EE", color: "#8A93A6", fontSize: 14, fontWeight: 600, gap: 8 }}>
              <span style={{ fontSize: 36 }}>🏟️</span>
              <span>Aucun événement à venir</span>
              <Link href="/events/create" style={{ fontSize: 13, fontWeight: 700, color: "#FF6B35", textDecoration: "none" }}>
                Créer un événement →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
