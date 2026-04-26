"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Share2, Check, Lock, Users, Calendar } from "lucide-react";
import { supabase, type Profile, type Event } from "@/lib/supabase";

const SPORT_META: Record<string, { emoji: string; label: string; color: string; soft: string }> = {
  basket:  { emoji: "🏀", label: "Basket",  color: "#FF6B35", soft: "#FFE6DA" },
  foot:    { emoji: "⚽", label: "Foot",    color: "#2EC4B6", soft: "#D6F4F1" },
  tennis:  { emoji: "🎾", label: "Tennis",  color: "#F4B43A", soft: "#FEF3C7" },
  padel:   { emoji: "🏓", label: "Padel",   color: "#3B82F6", soft: "#DBEAFE" },
  running: { emoji: "🏃", label: "Running", color: "#7B61FF", soft: "#EDE9FE" },
  volley:  { emoji: "🏐", label: "Volley",  color: "#EC4899", soft: "#FCE7F3" },
  yoga:    { emoji: "🧘", label: "Yoga",    color: "#14B8A6", soft: "#CCFBF1" },
  velo:    { emoji: "🚴", label: "Vélo",    color: "#06B6D4", soft: "#CFFAFE" },
};

const LEVEL_META: Record<string, { label: string; emoji: string }> = {
  beginner:     { label: "Bronze",  emoji: "🥉" },
  intermediate: { label: "Argent",  emoji: "🥈" },
  advanced:     { label: "Or",      emoji: "🥇" },
  expert:       { label: "Expert",  emoji: "🏆" },
};

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatEventDate(dateStr: string, timeStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.toLocaleDateString("fr-FR", { weekday: "short" });
  const num = d.getDate();
  const month = d.toLocaleDateString("fr-FR", { month: "short" });
  const time = timeStr.slice(0, 5).replace(":", "h");
  return `${day.charAt(0).toUpperCase() + day.slice(1)}. ${num} ${month.charAt(0).toUpperCase() + month.slice(1)} · ${time}`;
}

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const profileId = params.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [requested, setRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user.id ?? null;
      setCurrentUserId(uid);

      if (uid && uid === profileId) {
        router.replace("/profile");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (!profileData) { router.push("/teams"); return; }
      setProfile(profileData as Profile);

      if (!profileData.is_private) {
        const today = new Date().toISOString().split("T")[0];
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .eq("organizer_id", profileId)
          .eq("visibility", "public")
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(3);
        setEvents((eventsData ?? []) as Event[]);
      }

      setLoading(false);
    }
    load();
  }, [profileId, router]);

  async function handleShare() {
    await navigator.clipboard.writeText(`${window.location.origin}/profile/${profileId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleRequest() {
    if (!currentUserId || requesting || requested) return;
    setRequesting(true);
    await supabase.from("notifications").insert({
      user_id: profileId,
      type: "profile_request",
      title: "Demande d'accès au profil",
      body: "Quelqu'un souhaite voir votre profil.",
      data: { requester_id: currentUserId },
      read: false,
    });
    setRequested(true);
    setRequesting(false);
  }

  const initials = getInitials(profile?.full_name);
  const levelInfo = LEVEL_META[profile?.level ?? "beginner"];

  if (loading) {
    return (
      <div style={{ background: "#F6F7FA", minHeight: "100vh", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
        <div style={{ background: "linear-gradient(160deg, #1A2B4A 0%, #243757 100%)", padding: "52px 16px 80px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
          </div>
          <div className="flex flex-col items-center">
            <div className="skeleton rounded-full" style={{ width: 76, height: 76 }} />
            <div className="skeleton" style={{ width: 140, height: 20, borderRadius: 8, marginTop: 14 }} />
            <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 6, marginTop: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isPrivate = profile.is_private;

  return (
    <div style={{ background: "#F6F7FA", minHeight: "100vh", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', paddingBottom: 40 }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A2B4A 0%, #243757 100%)", padding: "52px 20px 80px" }}>
        <div className="absolute pointer-events-none" style={{ top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,107,53,0.18)", filter: "blur(40px)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: 20, left: -40, width: 130, height: 130, borderRadius: "50%", background: "rgba(46,196,182,0.15)", filter: "blur(30px)" }} />

        <div className="relative flex items-center justify-between" style={{ marginBottom: 24 }}>
          <button onClick={() => router.back()} className="flex items-center justify-center tap-scale"
            style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
            <ChevronLeft size={20} color="white" strokeWidth={2.5} />
          </button>
          <button onClick={handleShare} className="flex items-center justify-center tap-scale"
            style={{ width: 40, height: 40, borderRadius: 12, background: copied ? "rgba(46,196,182,0.3)" : "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", transition: "background 0.2s" }}>
            {copied ? <Check size={18} color="#2EC4B6" strokeWidth={3} /> : <Share2 size={18} color="white" strokeWidth={2} />}
          </button>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="flex items-center justify-center rounded-full text-white"
            style={{ width: 76, height: 76, background: "linear-gradient(135deg, #FF6B35, #E5551F)", fontSize: 22, fontWeight: 800, letterSpacing: -0.5, outline: "3px solid rgba(255,107,53,0.6)", outlineOffset: 3, boxShadow: "0 8px 24px rgba(255,107,53,0.35)" }}>
            {initials}
          </div>
          <h2 className="text-white text-center font-extrabold" style={{ fontSize: 22, letterSpacing: -0.4, marginTop: 12, lineHeight: 1 }}>
            {profile.full_name ?? "Utilisateur"}
          </h2>
          <p className="text-center font-semibold" style={{ fontSize: 13, color: "rgba(255,255,255,0.58)", marginTop: 4 }}>
            {profile.username ? `@${profile.username}` : ""}
            {profile.location ? ` · 📍 ${profile.location}` : ""}
          </p>
          <div className="flex items-center gap-2 font-bold"
            style={{ marginTop: 12, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "6px 16px", fontSize: 13, color: "white" }}>
            {levelInfo?.emoji ?? "🏆"} Niveau {levelInfo?.label ?? "Or"} · {profile.points} pts
          </div>
        </div>
      </div>

      {/* ── Stats card ── */}
      <div style={{ margin: "0 16px", transform: "translateY(-40px)", background: "#fff", borderRadius: 20, border: "1px solid #E5E8EE", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", overflow: "hidden" }}>
        {[
          { value: profile.events_count, label: "Events" },
          { value: profile.wins_count,   label: "Victoires" },
          { value: profile.teams_count,  label: "Équipes" },
          { value: `${profile.hours_played}h`, label: "Joué" },
        ].map((stat, i) => (
          <div key={stat.label} className="flex flex-col items-center justify-center" style={{ padding: "14px 8px", borderRight: i < 3 ? "1px solid #E5E8EE" : "none", filter: isPrivate ? "blur(4px)" : "none", userSelect: isPrivate ? "none" : "auto" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.5, lineHeight: 1 }}>{stat.value}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6", marginTop: 4 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: -24 }}>

        {isPrivate ? (
          /* ── Private profile locked state ── */
          <div className="flex flex-col items-center" style={{ margin: "0 16px", padding: "40px 24px", background: "#fff", borderRadius: 20, border: "1px solid #E5E8EE", textAlign: "center", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)" }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: "#F1F3F7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Lock size={24} color="#8A93A6" strokeWidth={2} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.3, marginBottom: 8 }}>
              Profil privé
            </p>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#8A93A6", lineHeight: 1.5, marginBottom: 24 }}>
              Ce profil est en mode privé.<br />Envoie une demande pour voir ses sports et événements.
            </p>
            {currentUserId ? (
              <button
                onClick={handleRequest}
                disabled={requesting || requested}
                className="tap-scale"
                style={{
                  height: 48, borderRadius: 14, border: "none", cursor: requested ? "default" : "pointer",
                  background: requested ? "#F1F3F7" : "linear-gradient(135deg, #FF6B35, #E5551F)",
                  color: requested ? "#8A93A6" : "#fff",
                  fontSize: 15, fontWeight: 800, padding: "0 32px",
                  boxShadow: requested ? "none" : "0 6px 18px -6px rgba(255,107,53,0.5)",
                  transition: "all 0.2s",
                  opacity: requesting ? 0.7 : 1,
                }}
              >
                {requested ? "✓ Demande envoyée" : requesting ? "Envoi…" : "Demander l'accès"}
              </button>
            ) : (
              <Link href="/login" style={{ height: 48, borderRadius: 14, background: "linear-gradient(135deg, #FF6B35, #E5551F)", color: "#fff", fontSize: 15, fontWeight: 800, padding: "0 32px", display: "flex", alignItems: "center", textDecoration: "none" }}>
                Se connecter pour demander
              </Link>
            )}
          </div>
        ) : (
          /* ── Public profile content ── */
          <>
            {/* Sports */}
            <div style={{ margin: "0 16px" }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2, marginBottom: 12 }}>Sports pratiqués</p>
              {profile.sports.length === 0 ? (
                <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6" }}>Aucun sport renseigné</p>
              ) : (
                <div className="flex flex-col" style={{ gap: 10 }}>
                  {profile.sports.map((sportId) => {
                    const s = SPORT_META[sportId] ?? { emoji: "🏃", label: sportId, color: "#5B6478", soft: "#F1F3F7" };
                    return (
                      <div key={sportId} className="flex items-center gap-3"
                        style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", border: "1px solid #E5E8EE", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)" }}>
                        <span style={{ fontSize: 28 }}>{s.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>{s.label}</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#5B6478", marginTop: 1 }}>{LEVEL_META[profile.level]?.label ?? "Débutant"}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.soft, borderRadius: 999, padding: "3px 10px" }}>
                          Actif
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Events */}
            <div style={{ margin: "20px 16px 0" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                <Calendar size={16} color="#1A2B4A" strokeWidth={2.5} />
                <p style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>Prochains événements</p>
              </div>
              {events.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #E5E8EE", textAlign: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6" }}>Aucun événement public à venir</p>
                </div>
              ) : (
                <div className="flex flex-col" style={{ gap: 10 }}>
                  {events.map((event) => {
                    const s = SPORT_META[event.sport] ?? { emoji: "🏃", label: event.sport, color: "#5B6478", soft: "#F1F3F7" };
                    return (
                      <Link key={event.id} href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
                        <div className="flex overflow-hidden tap-scale"
                          style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)" }}>
                          <div style={{ width: 6, background: s.color, flexShrink: 0 }} />
                          <div style={{ padding: "14px 16px", flex: 1 }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.soft, borderRadius: 999, padding: "3px 10px" }}>
                                {s.emoji} {s.label}
                              </span>
                            </div>
                            <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2, lineHeight: 1.3 }}>{event.title}</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#5B6478", marginTop: 5 }}>
                              📅 {formatEventDate(event.event_date, event.start_time)}
                            </p>
                            <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
                              <Users size={11} color="#8A93A6" strokeWidth={2.5} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>{event.current_players}/{event.max_players} joueurs</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Copied toast ── */}
      {copied && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          zIndex: 80, background: "#1A2B4A", color: "#fff",
          borderRadius: 999, padding: "10px 20px",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 13, fontWeight: 700,
          boxShadow: "0 8px 24px rgba(26,43,74,0.35)",
          whiteSpace: "nowrap",
        }}>
          <Check size={14} color="#2EC4B6" strokeWidth={3} />
          Lien copié !
        </div>
      )}
    </div>
  );
}
