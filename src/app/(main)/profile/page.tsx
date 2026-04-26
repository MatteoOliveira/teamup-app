"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Share2, SlidersHorizontal, ChevronRight, ShieldCheck, LogOut, Settings } from "lucide-react";
import { supabase, type Profile, type Event } from "@/lib/supabase";

const SPORT_META: Record<string, { emoji: string; label: string; color: string; soft: string }> = {
  basket: { emoji: "🏀", label: "Basket", color: "#FF6B35", soft: "#FFE6DA" },
  foot: { emoji: "⚽", label: "Foot", color: "#2EC4B6", soft: "#D6F4F1" },
  tennis: { emoji: "🎾", label: "Tennis", color: "#F4B43A", soft: "#FEF3C7" },
  padel: { emoji: "🏓", label: "Padel", color: "#3B82F6", soft: "#DBEAFE" },
  running: { emoji: "🏃", label: "Running", color: "#7B61FF", soft: "#EDE9FE" },
  volley: { emoji: "🏐", label: "Volley", color: "#EC4899", soft: "#FCE7F3" },
  yoga: { emoji: "🧘", label: "Yoga", color: "#14B8A6", soft: "#CCFBF1" },
  velo: { emoji: "🚴", label: "Vélo", color: "#06B6D4", soft: "#CFFAFE" },
};

const LEVEL_META: Record<string, { label: string; emoji: string }> = {
  beginner: { label: "Bronze", emoji: "🥉" },
  intermediate: { label: "Argent", emoji: "🥈" },
  advanced: { label: "Or", emoji: "🥇" },
  expert: { label: "Expert", emoji: "🏆" },
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Confirmé",
  expert: "Expert",
  all: "Tous niveaux",
};

const BADGES = [
  { emoji: "🥇", label: "Premier match", sub: "Débloqué", subColor: "#FF6B35" },
  { emoji: "🔥", label: "7 jours", sub: "Streak", subColor: "#2EC4B6" },
  { emoji: "👑", label: "Capitaine", sub: "Équipe", subColor: "#F4B43A" },
  { emoji: "⚡", label: "Rapide", sub: "Réponse", subColor: "#7B61FF" },
  { emoji: "🤝", label: "Fair-play", sub: "Voté", subColor: "#22C55E" },
];

function formatEventDate(dateStr: string, timeStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.toLocaleDateString("fr-FR", { weekday: "short" });
  const num = d.getDate();
  const month = d.toLocaleDateString("fr-FR", { month: "short" });
  const time = timeStr.slice(0, 5).replace(":", "h");
  return `${day.charAt(0).toUpperCase() + day.slice(1)}. ${num} ${month.charAt(0).toUpperCase() + month.slice(1)} · ${time}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

function EventCard({ event }: { event: Event }) {
  const sport = SPORT_META[event.sport] ?? { emoji: "🏃", label: event.sport, color: "#5B6478", soft: "#F1F3F7" };
  const levelLabel = LEVEL_LABELS[event.level] ?? event.level;

  return (
    <div
      className="flex overflow-hidden"
      style={{
        background: "#fff", borderRadius: 18,
        border: "1px solid #E5E8EE",
        boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)",
      }}
    >
      <div style={{ width: 6, background: sport.color, flexShrink: 0 }} />
      <div style={{ padding: "14px 14px 14px 16px", flex: 1 }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 11, fontWeight: 700, color: sport.color, background: sport.soft, borderRadius: 999, padding: "3px 10px" }}>
            {sport.emoji} {sport.label}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#5B6478", background: "#F1F3F7", borderRadius: 999, padding: "3px 10px" }}>
            {levelLabel}
          </span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", marginTop: 8, lineHeight: 1.3, letterSpacing: -0.2 }}>
          {event.title}
        </p>
        <div className="flex items-center gap-3" style={{ marginTop: 5, fontSize: 13, color: "#5B6478", fontWeight: 600 }}>
          <span>📅 {formatEventDate(event.event_date, event.start_time)}</span>
          <span>⏱ {formatDuration(event.duration_min)}</span>
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
          <span style={{ fontSize: 12, color: "#8A93A6", fontWeight: 600 }}>
            {event.current_players}/{event.max_players} joueurs
          </span>
          <Link
            href={`/events/${event.id}`}
            className="tap-scale font-bold text-white"
            style={{
              height: 30, borderRadius: 999, padding: "0 14px",
              fontSize: 12, background: sport.color,
              display: "flex", alignItems: "center",
              textDecoration: "none",
            }}
          >
            Voir
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const today = new Date().toISOString().split("T")[0];

      const [{ data: profileData }, { data: participations }, { data: ownedEvents }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("event_participants")
          .select("event_id")
          .eq("user_id", session.user.id)
          .eq("status", "confirmed"),
        supabase.from("events")
          .select("*")
          .eq("organizer_id", session.user.id)
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(3),
      ]);

      setProfile(profileData);

      const participationIds = (participations ?? []).map((p: { event_id: string }) => p.event_id);
      if (participationIds.length > 0) {
        const { data: participatedEvents } = await supabase
          .from("events")
          .select("*")
          .in("id", participationIds)
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(3);

        const merged = [...(ownedEvents ?? []), ...(participatedEvents ?? [])];
        const unique = merged.filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i);
        unique.sort((a, b) => a.event_date.localeCompare(b.event_date));
        setEvents(unique.slice(0, 5));
      } else {
        setEvents(ownedEvents ?? []);
      }

      setLoading(false);
    }
    load();
  }, []);

  const initials = profile?.full_name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  const levelInfo = LEVEL_META[profile?.level ?? "beginner"];

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div style={{ background: "#F6F7FA", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', minHeight: "100vh" }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A2B4A 0%, #243757 100%)", padding: "52px 20px 80px" }}
      >
        <div className="absolute pointer-events-none" style={{ top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,107,53,0.18)", filter: "blur(40px)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: 20, left: -40, width: 130, height: 130, borderRadius: "50%", background: "rgba(46,196,182,0.15)", filter: "blur(30px)" }} />

        <div className="relative flex items-center justify-between" style={{ marginBottom: 24 }}>
          <button className="flex items-center justify-center tap-scale" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <SlidersHorizontal size={18} color="white" strokeWidth={2} />
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: 2 }}>Profil</span>
          <button className="flex items-center justify-center tap-scale" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <Share2 size={18} color="white" strokeWidth={2} />
          </button>
        </div>

        <div className="relative flex flex-col items-center">
          {loading ? (
            <div className="skeleton rounded-full" style={{ width: 76, height: 76 }} />
          ) : (
            <div
              className="flex items-center justify-center rounded-full text-white"
              style={{ width: 76, height: 76, background: "linear-gradient(135deg, #FF6B35, #E5551F)", fontSize: 22, fontWeight: 800, letterSpacing: -0.5, outline: "3px solid rgba(255,107,53,0.6)", outlineOffset: 3, boxShadow: "0 8px 24px rgba(255,107,53,0.35)" }}
            >
              {initials}
            </div>
          )}

          {loading ? (
            <>
              <div className="skeleton" style={{ width: 140, height: 22, borderRadius: 8, marginTop: 12 }} />
              <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 6, marginTop: 6 }} />
            </>
          ) : (
            <>
              <h2 className="text-white text-center font-extrabold" style={{ fontSize: 22, letterSpacing: -0.4, marginTop: 12, lineHeight: 1 }}>
                {profile?.full_name ?? "Utilisateur"}
              </h2>
              <p className="text-center font-semibold" style={{ fontSize: 13, color: "rgba(255,255,255,0.58)", marginTop: 4 }}>
                {profile?.username ? `@${profile.username}` : profile?.full_name?.toLowerCase().replace(" ", "_") ?? ""}
                {profile?.location ? ` · ${profile.location}` : ""}
              </p>
            </>
          )}

          <div
            className="flex items-center gap-2 font-bold"
            style={{ marginTop: 12, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "6px 16px", fontSize: 13, color: "white" }}
          >
            {levelInfo?.emoji ?? "🏆"} Niveau {levelInfo?.label ?? "Or"} · {profile?.points ?? 0} pts
          </div>
        </div>
      </div>

      {/* Stats card */}
      <div
        style={{ margin: "0 16px", transform: "translateY(-40px)", background: "#fff", borderRadius: 20, border: "1px solid #E5E8EE", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", overflow: "hidden" }}
      >
        {[
          { value: profile?.events_count ?? 0, label: "Events" },
          { value: profile?.wins_count ?? 0, label: "Victoires" },
          { value: profile?.teams_count ?? 0, label: "Équipes" },
          { value: profile?.hours_played != null ? `${profile.hours_played}h` : "0h", label: "Joué" },
        ].map((stat, i) => (
          <div key={stat.label} className="flex flex-col items-center justify-center" style={{ padding: "14px 8px", borderRight: i < 3 ? "1px solid #E5E8EE" : "none" }}>
            {loading ? (
              <div className="skeleton" style={{ width: 28, height: 22, borderRadius: 6 }} />
            ) : (
              <span style={{ fontSize: 22, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.5, lineHeight: 1 }}>{stat.value}</span>
            )}
            <span style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6", marginTop: 4 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: -24 }}>

        {/* Sports */}
        <div style={{ margin: "0 16px" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>Mes sports</span>
          <div className="flex flex-col" style={{ gap: 10, marginTop: 12 }}>
            {loading ? (
              [1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 16 }} />)
            ) : (profile?.sports ?? []).length > 0 ? (
              (profile?.sports ?? []).map((sportId) => {
                const s = SPORT_META[sportId] ?? { emoji: "🏃", label: sportId, color: "#5B6478", soft: "#F1F3F7" };
                return (
                  <div
                    key={sportId}
                    className="flex items-center gap-3"
                    style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", border: "1px solid #E5E8EE", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)" }}
                  >
                    <span style={{ fontSize: 28 }}>{s.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>{s.label}</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#5B6478", marginTop: 1 }}>
                        {LEVEL_LABELS[profile?.level ?? "beginner"] ?? "Débutant"}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.soft, borderRadius: 999, padding: "3px 10px" }}>
                      Actif
                    </span>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: 13, color: "#8A93A6", fontWeight: 600 }}>Aucun sport sélectionné</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div style={{ marginTop: 20, paddingLeft: 16, paddingRight: 16 }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>Récompenses</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B35", background: "#FFE6DA", borderRadius: 999, padding: "2px 8px" }}>
              {BADGES.length}
            </span>
          </div>
          <div className="flex" style={{ gap: 12, marginTop: 12, overflowX: "scroll", scrollbarWidth: "none", paddingBottom: 4 }}>
            {BADGES.map((b) => (
              <div key={b.label} className="flex flex-col items-center" style={{ minWidth: 80, background: "#fff", borderRadius: 14, padding: "14px 12px", border: "1px solid #E5E8EE", flexShrink: 0 }}>
                <span style={{ fontSize: 28 }}>{b.emoji}</span>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1A2B4A", marginTop: 8, textAlign: "center", lineHeight: 1.2 }}>{b.label}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: b.subColor, marginTop: 4 }}>{b.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div style={{ margin: "20px 16px 0" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>Prochains événements</span>
          <div className="flex flex-col" style={{ gap: 12, marginTop: 12 }}>
            {loading ? (
              [1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 18 }} />)
            ) : events.length > 0 ? (
              events.map((e) => <EventCard key={e.id} event={e} />)
            ) : (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#8A93A6", fontWeight: 600 }}>Aucun événement à venir</p>
                <Link href="/events/create" style={{ display: "inline-block", marginTop: 10, fontSize: 13, fontWeight: 700, color: "#FF6B35", textDecoration: "none" }}>
                  Créer un événement →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Compte */}
        <div style={{ margin: "20px 16px 32px" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#8A93A6", textTransform: "uppercase", letterSpacing: 0.8 }}>Compte</span>
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", overflow: "hidden", marginTop: 10, boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)" }}>
            <Link href="/profile/settings" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #F1F3F7" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#5B647818", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Settings size={17} color="#5B6478" strokeWidth={2.5} />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>Paramètres</span>
              <ChevronRight size={16} color="#8A93A6" strokeWidth={2} />
            </Link>
            {profile?.is_admin && (
              <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #F1F3F7" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#22C55E18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={17} color="#22C55E" strokeWidth={2.5} />
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>Espace Admin</span>
                <ChevronRight size={16} color="#8A93A6" strokeWidth={2} />
              </Link>
            )}
            <button
              onClick={handleSignOut}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "none", background: "none", cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EF444418", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LogOut size={17} color="#EF4444" strokeWidth={2.5} />
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>Déconnexion</span>
              <ChevronRight size={16} color="#8A93A6" strokeWidth={2} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
