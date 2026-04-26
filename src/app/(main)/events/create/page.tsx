"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Check, Navigation, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Terrain, Team } from "@/lib/supabase";
import { SPORT_META, formatDuration } from "@/lib/utils";

/* ─── Static data ─────────────────────────────────────────────── */

const SPORTS = Object.entries(SPORT_META).map(([id, meta]) => ({ id, ...meta }));

const LEVELS = [
  { id: "Tous",          label: "Tous",     color: "#1A2B4A" },
  { id: "Débutant",      label: "Débutant", color: "#22C55E" },
  { id: "Intermédiaire", label: "Inter.",   color: "#F4B43A" },
  { id: "Confirmé",      label: "Confirmé", color: "#EF4444" },
];

const STEP_CONFIG = [
  { label: "Sport & Niveau", accent: "#FF6B35", grad: "linear-gradient(135deg, #FF6B35 0%, #E5551F 100%)", hero: "Quel sport veux-tu pratiquer ?" },
  { label: "Date & Heure",   accent: "#2EC4B6", grad: "linear-gradient(135deg, #2EC4B6 0%, #1FA89B 100%)", hero: "Quand se retrouve-t-on ?" },
  { label: "Lieu",           accent: "#1A2B4A", grad: "linear-gradient(135deg, #1A2B4A 0%, #243757 100%)", hero: "Où se retrouve-t-on ?" },
  { label: "Finaliser",      accent: "#22C55E", grad: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)", hero: "Plus que quelques détails !" },
];

const TIMES = [
  "14:30", "15:00", "16:00", "17:30",
  "18:00", "19:30", "20:00", "21:00",
];

const DURATION_SHORTCUTS = [30, 60, 90, 120];

const VISIBILITY = [
  { id: "public",  emoji: "🌍", label: "Public",         desc: "Tout le monde peut rejoindre" },
  { id: "team",    emoji: "👥", label: "Équipe",         desc: "Membres de mon équipe uniquement" },
  { id: "private", emoji: "🔒", label: "Sur invitation", desc: "Lien d'invitation uniquement" },
];

/* ─── Generate 7 days from today ─────────────────────────────── */
function genDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayLabel = d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "").toUpperCase().slice(0, 3);
    const monthLabel = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return { dateStr, num: d.getDate(), dayLabel, monthLabel };
  });
}

const DAYS = genDays();

/* ─── Mini Map ────────────────────────────────────────────────── */
function MiniMap() {
  return (
    <div className="relative overflow-hidden" style={{ height: 150, borderRadius: 16, background: "linear-gradient(135deg,#e8f4fd,#d6eef8)", border: "1px solid #E5E8EE" }}>
      <style>{`@keyframes pp2{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}`}</style>
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
        {[20,40,60,80].map(y=><line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#5B6478" strokeWidth="1"/>)}
        {[15,30,50,65,80].map(x=><line key={x} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#5B6478" strokeWidth="1"/>)}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#5B6478" strokeWidth="2"/>
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#5B6478" strokeWidth="2"/>
        <line x1="0" y1="30%" x2="60%" y2="70%" stroke="#5B6478" strokeWidth="1.5"/>
        <line x1="40%" y1="0" x2="80%" y2="55%" stroke="#5B6478" strokeWidth="1.5"/>
      </svg>
      {[{l:"30%",t:"38%",c:"#FF6B35"},{l:"55%",t:"55%",c:"#2EC4B6"},{l:"65%",t:"28%",c:"#7B61FF"},{l:"20%",t:"62%",c:"#F4B43A"}].map((p,i)=>(
        <div key={i} className="absolute" style={{left:p.l,top:p.t,transform:"translate(-50%,-50%)"}}>
          <div className="relative flex items-center justify-center" style={{width:20,height:20}}>
            <div className="absolute inset-0 rounded-full" style={{background:`${p.c}44`,animation:`pp2 1.8s ease-out infinite`,animationDelay:`${i*0.35}s`}}/>
            <div className="rounded-full border-2 border-white" style={{width:10,height:10,background:p.c,position:"relative",zIndex:2}}/>
          </div>
        </div>
      ))}
      <div className="absolute" style={{left:"50%",top:"50%",transform:"translate(-50%,-50%)"}}>
        <div className="rounded-full border-2 border-white" style={{width:14,height:14,background:"#3B82F6",boxShadow:"0 0 0 4px rgba(59,130,246,0.25)"}}/>
      </div>
      <div className="absolute" style={{ bottom: 10, left: 10 }}>
        <div style={{ background: "#1A2B4A", color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700 }}>
          3 terrains proches
        </div>
      </div>
    </div>
  );
}

/* ─── Invite Modal ────────────────────────────────────────────── */
function InviteModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/events/${eventId}` : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "8px 20px 44px", width: "100%", maxWidth: 480 }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: "#E5E8EE", margin: "12px auto 22px" }} />
        <p style={{ fontSize: 20, fontWeight: 800, color: "#1A2B4A", marginBottom: 6 }}>🔒 Événement sur invitation</p>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#5B6478", lineHeight: 1.5, marginBottom: 20 }}>
          Seules les personnes ayant ce lien peuvent rejoindre l&apos;événement. Partage-le avec qui tu veux !
        </p>

        {/* Link display */}
        <div style={{ background: "#F6F7FA", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1A2B4A", wordBreak: "break-all", lineHeight: 1.4 }}>
            {link}
          </span>
        </div>

        <button onClick={handleCopy}
          style={{
            width: "100%", height: 52, borderRadius: 14, border: "none",
            background: copied ? "#22C55E" : "#1A2B4A",
            color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
            marginBottom: 10, transition: "background 0.2s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
          <Copy size={18} />
          {copied ? "Lien copié !" : "Copier le lien"}
        </button>

        <button onClick={onClose}
          style={{
            width: "100%", height: 44, borderRadius: 12,
            background: "transparent", border: "1.5px solid #E5E8EE",
            color: "#1A2B4A", fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
          <ExternalLink size={15} />
          Voir l&apos;événement
        </button>
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────── */
export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep]                         = useState(0);
  const [animIn, setAnimIn]                     = useState(true);
  const [publishing, setPublishing]             = useState(false);
  const [selectedSport, setSelectedSport]       = useState("");
  const [selectedLevel, setSelectedLevel]       = useState("Tous");
  const [selectedDate, setSelectedDate]         = useState(DAYS[0].dateStr);
  const [selectedTime, setSelectedTime]         = useState("");
  const [duration, setDuration]                 = useState(90);
  const [selectedTerrain, setSelectedTerrain]   = useState("");
  const [eventName, setEventName]               = useState("");
  const [maxPlayers, setMaxPlayers]             = useState(10);
  const [visibility, setVisibility]             = useState("public");
  const [selectedTeam, setSelectedTeam]         = useState("");
  const [dbTerrains, setDbTerrains]             = useState<Terrain[]>([]);
  const [userTeams, setUserTeams]               = useState<Team[]>([]);
  const [createdEventId, setCreatedEventId]     = useState<string | null>(null);

  /* Fetch terrains on step 3 */
  useEffect(() => {
    if (step !== 2) return;
    supabase
      .from("terrains")
      .select("*")
      .order("name")
      .then(({ data }) => setDbTerrains((data ?? []) as Terrain[]));
  }, [step]);

  /* Fetch user's teams on step 4 */
  useEffect(() => {
    if (step !== 3) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase
        .from("team_members")
        .select("team:teams!team_id(*)")
        .eq("user_id", session.user.id)
        .then(({ data }) => {
          const teams = (data ?? []).map((d) => (d as unknown as { team: Team }).team).filter(Boolean);
          setUserTeams(teams);
        });
    });
  }, [step]);

  const canContinue = [
    selectedSport !== "",
    selectedTime !== "",
    selectedTerrain !== "",
    eventName.trim() !== "" && (visibility !== "team" || selectedTeam !== ""),
  ][step];

  const go = (next: number) => {
    setAnimIn(false);
    setTimeout(() => { setStep(next); setAnimIn(true); }, 180);
  };

  const handleNext = async () => {
    if (step < 3) { go(step + 1); return; }
    setPublishing(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }

    const levelMap: Record<string, string> = {
      "Tous": "all", "Débutant": "beginner",
      "Intermédiaire": "intermediate", "Confirmé": "advanced",
    };
    const visMap: Record<string, string> = {
      public: "public", team: "private", private: "invite",
    };

    const [hh, mm] = selectedTime.split(":");
    const terrain = dbTerrains.find((t) => t.id === selectedTerrain);

    const { data: newEvent, error } = await supabase
      .from("events")
      .insert({
        organizer_id: session.user.id,
        terrain_id: selectedTerrain || null,
        team_id: visibility === "team" ? selectedTeam || null : null,
        title: eventName,
        sport: selectedSport,
        level: levelMap[selectedLevel] ?? "all",
        event_date: selectedDate,
        start_time: `${hh}:${mm}:00`,
        duration_min: duration,
        max_players: maxPlayers,
        visibility: visMap[visibility] ?? "public",
        location_text: terrain?.address ?? null,
      })
      .select()
      .single();

    if (error || !newEvent) {
      setPublishing(false);
      return;
    }

    /* Auto-join: creator is a participant */
    await supabase.from("event_participants").insert({
      event_id: newEvent.id,
      user_id: session.user.id,
      status: "confirmed",
    });

    /* Team event: send an event-invite card to the team chat */
    if (visibility === "team" && selectedTeam) {
      const cardPayload = JSON.stringify({
        title: eventName,
        sport: selectedSport,
        date: selectedDate,
        time: selectedTime,
        duration,
        terrain: terrain?.name ?? null,
        eventId: newEvent.id,
      });
      await supabase.from("messages").insert({
        team_id: selectedTeam,
        sender_id: session.user.id,
        content: cardPayload,
        message_type: "event_invite",
        event_id: newEvent.id,
      });
    }

    setPublishing(false);

    /* Invite event: show share modal before redirecting */
    if (visibility === "private") {
      setCreatedEventId(newEvent.id);
      return;
    }

    router.push("/events");
  };

  const handleBack = () => step === 0 ? router.back() : go(step - 1);

  const { accent, grad } = STEP_CONFIG[step];
  const monthLabel = (DAYS.find(d => d.dateStr === selectedDate) ?? DAYS[0]).monthLabel;
  const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F6F7FA", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      <style>{`
        @keyframes fillBar   { from { width: 0% }   to { width: 100% } }
        @keyframes heroSpin  { from { transform: rotate(-20deg) scale(0.7); opacity: 0 } to { transform: rotate(0deg) scale(1); opacity: 1 } }
        @keyframes heroFadeIn{ from { opacity: 0; transform: translateY(6px) }           to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {/* ── Invite link modal (shown after creating invite event) ── */}
      {createdEventId && (
        <InviteModal
          eventId={createdEventId}
          onClose={() => router.push(`/events/${createdEventId}`)}
        />
      )}

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-40" style={{ background: "#fff", borderBottom: "1px solid #F1F3F7" }}>
        <div style={{ paddingTop: 52 }}>
          <div className="flex items-center gap-3" style={{ padding: "10px 16px 8px" }}>
            <button onClick={handleBack} className="flex items-center justify-center tap-scale flex-shrink-0"
              style={{ width: 36, height: 36, borderRadius: 10, background: "#F6F7FA", border: "none", cursor: "pointer" }}>
              <ChevronLeft size={20} color="#1A2B4A" strokeWidth={2.5} />
            </button>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.3, flex: 1 }}>
              {STEP_CONFIG[step].label}
            </span>
            <div style={{ background: accent, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, transition: "background 0.3s ease" }}>
              {step + 1}/4
            </div>
          </div>
        </div>
        {/* 4-segment progress bar */}
        <div className="flex gap-1" style={{ padding: "0 16px 12px" }}>
          {[0,1,2,3].map(i => {
            const past   = i < step;
            const active = i === step;
            const sc = STEP_CONFIG[i];
            return (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: past ? sc.accent : "#F1F3F7", overflow: "hidden", position: "relative" }}>
                {active && (
                  <div style={{ position: "absolute", inset: 0, background: sc.accent, borderRadius: 999, animation: "fillBar 0.4s ease forwards" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 160 }}>
        <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.2s ease, transform 0.2s ease" }}>

          {/* Hero banner */}
          <div className="flex items-center justify-between overflow-hidden"
            style={{ height: 80, background: grad, padding: "0 20px", transition: "background 0.3s ease" }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: -0.3, flex: 1, lineHeight: 1.3, animation: "heroFadeIn 0.3s ease" }}>
              {STEP_CONFIG[step].hero}
            </p>
            <span key={`emoji-${step}-${selectedSport}`}
              style={{ fontSize: 52, lineHeight: 1, marginLeft: 16, flexShrink: 0, animation: "heroSpin 0.35s ease" }}>
              {step === 0 ? (selectedSport ? SPORT_META[selectedSport]?.emoji : "🏟️")
                : step === 1 ? "📅"
                : step === 2 ? "📍"
                : "🎉"}
            </span>
          </div>

          {/* ═══════ STEP 1 — Sport & Niveau ═══════ */}
          {step === 0 && (
            <div style={{ paddingTop: 16, paddingBottom: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, margin: "0 16px" }}>
                {SPORTS.map(sport => {
                  const active = selectedSport === sport.id;
                  return (
                    <button key={sport.id} onClick={() => setSelectedSport(sport.id)}
                      className="tap-scale flex flex-col items-center justify-center gap-1"
                      style={{
                        height: 88, borderRadius: 14,
                        border: active ? "none" : "1.5px solid #E5E8EE",
                        background: active ? sport.color : "#fff",
                        boxShadow: active ? `0 4px 16px ${sport.color}55` : "none",
                        cursor: "pointer", transition: "all 0.18s ease",
                      }}>
                      <span style={{ fontSize: 28 }}>{sport.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#fff" : "#1A2B4A" }}>{sport.label}</span>
                    </button>
                  );
                })}
              </div>

              <p style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2, margin: "20px 16px 10px" }}>
                Niveau requis
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "0 16px" }}>
                {LEVELS.map(lvl => {
                  const active = selectedLevel === lvl.id;
                  return (
                    <button key={lvl.id} onClick={() => setSelectedLevel(lvl.id)}
                      className="tap-scale flex flex-col items-center justify-center gap-1"
                      style={{
                        height: 52, borderRadius: 12, border: "none",
                        background: active ? lvl.color : "#F1F3F7",
                        cursor: "pointer", transition: "all 0.18s ease", padding: "4px 2px",
                      }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#fff" : lvl.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: active ? "#fff" : "#1A2B4A", textAlign: "center", lineHeight: 1.2 }}>{lvl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════ STEP 2 — Date & Heure ═══════ */}
          {step === 1 && (
            <div style={{ paddingTop: 16, paddingBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1A2B4A", margin: "0 16px 8px" }}>
                {capFirst(monthLabel)}
              </p>

              <div className="flex gap-2" style={{ overflowX: "auto", scrollbarWidth: "none", padding: "0 16px 4px" }}>
                {DAYS.map(d => {
                  const active = selectedDate === d.dateStr;
                  return (
                    <button key={d.dateStr} onClick={() => setSelectedDate(d.dateStr)}
                      className="tap-scale flex flex-col items-center justify-center flex-shrink-0"
                      style={{
                        width: 52, height: 72, borderRadius: 14, border: "none",
                        background: active ? "#1A2B4A" : "#fff",
                        cursor: "pointer", transition: "all 0.18s ease",
                        position: "relative", overflow: "hidden",
                      }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: active ? "rgba(255,255,255,0.65)" : "#8A93A6" }}>
                        {d.dayLabel}
                      </span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: active ? "#fff" : "#1A2B4A", marginTop: 2 }}>
                        {d.num}
                      </span>
                      {active && (
                        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 24, height: 3, borderRadius: 999, background: "#FF6B35" }} />
                      )}
                    </button>
                  );
                })}
              </div>

              <p style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2, margin: "20px 16px 10px" }}>
                Heure de début
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "0 16px" }}>
                {TIMES.map(t => {
                  const active = selectedTime === t;
                  return (
                    <button key={t} onClick={() => setSelectedTime(t)} className="tap-scale"
                      style={{
                        height: 44, borderRadius: 12, fontSize: 14, fontWeight: 700, border: "none",
                        background: active ? "#2EC4B6" : "#fff",
                        color: active ? "#fff" : "#1A2B4A",
                        boxShadow: active ? "0 4px 12px rgba(46,196,182,0.35)" : "none",
                        cursor: "pointer", transition: "all 0.18s ease",
                      }}>
                      {t}
                    </button>
                  );
                })}
              </div>

              <p style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2, margin: "20px 16px 10px" }}>
                Durée
              </p>
              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E5E8EE", padding: 16, margin: "0 16px" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6" }}>30min</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#2EC4B6", letterSpacing: -0.5 }}>{formatDuration(duration)}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6" }}>3h</span>
                </div>
                <div className="relative" style={{ height: 24, display: "flex", alignItems: "center", marginBottom: 14 }}>
                  <div className="absolute" style={{ left: 0, right: 0, height: 4, borderRadius: 999, background: "#E5E8EE" }} />
                  <div className="absolute" style={{ left: 0, width: `${((duration - 30) / 150) * 100}%`, height: 4, borderRadius: 999, background: "#2EC4B6", transition: "width 0.04s" }} />
                  <input type="range" min={30} max={180} step={15} value={duration} onChange={e => setDuration(Number(e.target.value))}
                    style={{ position: "relative", width: "100%", height: 24, opacity: 0, cursor: "pointer", zIndex: 2 }} />
                  <div className="absolute pointer-events-none"
                    style={{ left: `calc(${((duration - 30) / 150) * 100}% - 10px)`, width: 20, height: 20, borderRadius: "50%", background: "#2EC4B6", border: "3px solid #fff", boxShadow: "0 2px 6px rgba(46,196,182,0.4)", zIndex: 1, transition: "left 0.04s" }} />
                </div>
                <div className="flex gap-2">
                  {DURATION_SHORTCUTS.map(val => {
                    const active = duration === val;
                    return (
                      <button key={val} onClick={() => setDuration(val)} className="tap-scale"
                        style={{
                          flex: 1, height: 32, borderRadius: 8, border: "none",
                          background: active ? "#D6F4F1" : "#F1F3F7",
                          color: active ? "#1FA89B" : "#5B6478",
                          fontSize: 12, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.15s ease",
                        }}>
                        {formatDuration(val)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════ STEP 3 — Lieu ═══════ */}
          {step === 2 && (
            <div style={{ paddingTop: 16, paddingBottom: 8 }}>
              <div className="flex items-center gap-2"
                style={{ height: 50, background: "#fff", borderRadius: 14, border: "1.5px solid #E5E8EE", padding: "0 14px", margin: "0 16px" }}>
                <Search size={16} color="#8A93A6" strokeWidth={2} />
                <input type="text" placeholder="Rechercher un lieu..."
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit" }} />
                <button className="tap-scale flex items-center gap-1 flex-shrink-0"
                  style={{ background: "#1A2B4A", borderRadius: 999, padding: "6px 12px", border: "none", cursor: "pointer", height: 32 }}>
                  <Navigation size={12} color="#fff" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Localiser</span>
                </button>
              </div>

              <div style={{ margin: "12px 16px 0" }}>
                <MiniMap />
              </div>

              <div className="flex items-center gap-2" style={{ margin: "20px 16px 10px" }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>
                  Suggestions près de toi
                </p>
                {dbTerrains.length > 0 && (
                  <div style={{ background: "#1A2B4A", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                    {dbTerrains.length}
                  </div>
                )}
              </div>
              <div className="flex flex-col" style={{ gap: 8, margin: "0 16px" }}>
                {dbTerrains.length === 0 ? (
                  <>
                    <div className="skeleton" style={{ height: 72, borderRadius: 16 }} />
                    <div className="skeleton" style={{ height: 72, borderRadius: 16, opacity: 0.6 }} />
                  </>
                ) : (
                  dbTerrains.map(t => {
                    const active = selectedTerrain === t.id;
                    const sportMeta = SPORT_META[t.sport];
                    const priceLabel = t.price_hour === 0 ? "Gratuit" : `${t.price_hour}€/h`;
                    const priceColor = t.price_hour === 0 ? "#22C55E" : "#FF6B35";
                    return (
                      <button key={t.id} onClick={() => setSelectedTerrain(t.id)} className="tap-scale"
                        style={{
                          background: active ? "rgba(26,43,74,0.04)" : "#fff",
                          borderRadius: 16, padding: "14px 16px",
                          border: `1.5px solid ${active ? "#1A2B4A" : "#E5E8EE"}`,
                          cursor: "pointer", textAlign: "left", transition: "all 0.15s ease",
                          display: "flex", alignItems: "center", gap: 12,
                        }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex items-center gap-2" style={{ marginBottom: 5 }}>
                            <span style={{ fontSize: 22, flexShrink: 0 }}>{sportMeta?.emoji ?? "🏟️"}</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {t.name}
                            </span>
                            <div style={{ background: priceColor, borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                              {priceLabel}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                              📍 {t.district ?? "Paris"}{t.district ? " · ~1 km" : ""}
                            </span>
                            {t.rating > 0 && (
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>⭐ {t.rating}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-center flex-shrink-0"
                          style={{ width: 22, height: 22, borderRadius: "50%", background: active ? "#1A2B4A" : "transparent", border: active ? "none" : "2px solid #D5DAE3", transition: "all 0.15s ease" }}>
                          {active && <Check size={13} color="#fff" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ═══════ STEP 4 — Finaliser ═══════ */}
          {step === 3 && (
            <div style={{ paddingTop: 16, paddingBottom: 8 }}>
              {/* Summary recap */}
              <div style={{ background: "#1A2B4A", borderRadius: 16, padding: "14px 16px", margin: "0 16px" }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{SPORT_META[selectedSport]?.emoji ?? "🏟️"}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{SPORT_META[selectedSport]?.label ?? "—"}</span>
                  <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                    {selectedLevel}
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ marginBottom: 5 }}>
                  <span style={{ fontSize: 14 }}>📅</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                    {selectedDate}{selectedTime ? ` à ${selectedTime}` : ""} · {formatDuration(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>📍</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                    {dbTerrains.find(t => t.id === selectedTerrain)?.name ?? "—"}
                  </span>
                </div>
              </div>

              {/* Event name */}
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A", margin: "20px 16px 8px" }}>
                Nom de l&apos;événement
              </p>
              <div style={{ margin: "0 16px" }}>
                <input type="text" value={eventName} onChange={e => setEventName(e.target.value)}
                  placeholder="Ex: Basket 3vs3 Buttes Ch."
                  style={{
                    display: "block", width: "100%", height: 52, borderRadius: 14,
                    border: "1.5px solid #E5E8EE", background: "#fff",
                    padding: "0 16px", fontSize: 15, fontWeight: 600, color: "#1A2B4A",
                    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#22C55E")}
                  onBlur={e => (e.target.style.borderColor = "#E5E8EE")} />
              </div>

              {/* Max players */}
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A", margin: "20px 16px 10px" }}>
                Participants max
              </p>
              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E5E8EE", padding: "12px 16px", margin: "0 16px" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <button onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))} className="tap-scale flex items-center justify-center"
                    style={{ width: 40, height: 40, borderRadius: 10, background: "#F1F3F7", border: "1.5px solid #E5E8EE", fontSize: 22, fontWeight: 700, color: "#1A2B4A", cursor: "pointer" }}>
                    −
                  </button>
                  <div className="flex flex-col items-center">
                    <span style={{ fontSize: 32, fontWeight: 800, color: "#1A2B4A", letterSpacing: -1, lineHeight: 1 }}>{maxPlayers}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6", marginTop: 2 }}>joueurs</span>
                  </div>
                  <button onClick={() => setMaxPlayers(Math.min(100, maxPlayers + 1))} className="tap-scale flex items-center justify-center"
                    style={{ width: 40, height: 40, borderRadius: 10, background: "#22C55E", border: "none", fontSize: 22, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(34,197,94,0.35)" }}>
                    +
                  </button>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: Math.min(maxPlayers, 24) }, (_, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: `hsl(${142 - i * 4}, 60%, ${50 + i * 0.8}%)`, opacity: 0.75 }} />
                  ))}
                  {maxPlayers > 24 && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#8A93A6", marginLeft: 4 }}>+{maxPlayers - 24}</span>
                  )}
                </div>
              </div>

              {/* Visibility */}
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A", margin: "20px 16px 10px" }}>
                Visibilité
              </p>
              <div className="flex flex-col" style={{ gap: 8, margin: "0 16px" }}>
                {VISIBILITY.map(v => {
                  const active = visibility === v.id;
                  return (
                    <button key={v.id} onClick={() => { setVisibility(v.id); setSelectedTeam(""); }} className="flex items-center justify-between tap-scale"
                      style={{
                        background: active ? "rgba(34,197,94,0.06)" : "#fff",
                        borderRadius: 14, padding: "14px 16px",
                        border: `1.5px solid ${active ? "#22C55E" : "#E5E8EE"}`,
                        cursor: "pointer", textAlign: "left", transition: "all 0.15s ease",
                      }}>
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: 20 }}>{v.emoji}</span>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>{v.label}</p>
                          <p style={{ fontSize: 12, fontWeight: 500, color: "#8A93A6", marginTop: 1 }}>{v.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center flex-shrink-0"
                        style={{ width: 22, height: 22, borderRadius: "50%", background: active ? "#22C55E" : "transparent", border: active ? "none" : "2px solid #D5DAE3", transition: "all 0.15s ease" }}>
                        {active && <Check size={13} color="#fff" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Team selector — shown only when visibility === "team" */}
              {visibility === "team" && (
                <>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A", margin: "20px 16px 10px" }}>
                    Équipe concernée
                  </p>
                  {userTeams.length === 0 ? (
                    <div style={{ margin: "0 16px", padding: "16px", background: "#fff", borderRadius: 14, border: "1.5px solid #E5E8EE", textAlign: "center" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6" }}>Aucune équipe trouvée.</p>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "#8A93A6", marginTop: 4 }}>Rejoins ou crée une équipe d&apos;abord.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col" style={{ gap: 8, margin: "0 16px" }}>
                      {userTeams.map(team => {
                        const active = selectedTeam === team.id;
                        return (
                          <button key={team.id} onClick={() => setSelectedTeam(team.id)}
                            className="flex items-center tap-scale"
                            style={{
                              background: active ? "rgba(255,107,53,0.06)" : "#fff",
                              borderRadius: 14, padding: "12px 16px", gap: 12,
                              border: `1.5px solid ${active ? "#FF6B35" : "#E5E8EE"}`,
                              cursor: "pointer", textAlign: "left", transition: "all 0.15s ease",
                            }}>
                            <span style={{ fontSize: 24 }}>{SPORT_META[team.sport]?.emoji ?? "👥"}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>{team.name}</p>
                              <p style={{ fontSize: 12, fontWeight: 500, color: "#8A93A6" }}>{team.members_count} membres</p>
                            </div>
                            <div className="flex items-center justify-center flex-shrink-0"
                              style={{ width: 22, height: 22, borderRadius: "50%", background: active ? "#FF6B35" : "transparent", border: active ? "none" : "2px solid #D5DAE3", transition: "all 0.15s ease" }}>
                              {active && <Check size={13} color="#fff" strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Invite info banner */}
              {visibility === "private" && (
                <div style={{ margin: "16px 16px 0", background: "rgba(26,43,74,0.05)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(26,43,74,0.1)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1A2B4A", lineHeight: 1.4 }}>
                    🔒 Un lien d&apos;invitation sera généré après la publication. Tu pourras le partager avec n&apos;importe qui.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── STICKY FOOTER ── */}
      <div className="fixed left-0 right-0 flex gap-3"
        style={{ bottom: 72, background: "#fff", borderTop: "1px solid #F1F3F7", padding: "12px 16px", zIndex: 49 }}>
        {step > 0 && (
          <button onClick={handleBack} className="tap-scale font-bold flex-shrink-0"
            style={{ height: 52, padding: "0 20px", borderRadius: 14, fontSize: 15, color: "#1A2B4A", background: "#F6F7FA", border: "1.5px solid #E5E8EE", cursor: "pointer" }}>
            Retour
          </button>
        )}
        <button onClick={handleNext} disabled={!canContinue || publishing} className="tap-scale font-bold text-white"
          style={{
            flex: 1, height: 52, borderRadius: 14, fontSize: 15, border: "none",
            background: canContinue ? grad : "#F1F3F7",
            color: canContinue ? "#fff" : "#8A93A6",
            boxShadow: canContinue ? `0 6px 18px -6px ${accent}80` : "none",
            cursor: canContinue ? "pointer" : "not-allowed",
            transition: "all 0.25s ease", letterSpacing: -0.2,
          }}>
          {publishing ? "Publication…" : step === 3 ? "Publier l'événement 🎉" : "Continuer →"}
        </button>
      </div>
    </div>
  );
}
