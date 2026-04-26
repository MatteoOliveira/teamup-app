"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MoreHorizontal, SendHorizonal, Plus, Users, Lock, CalendarDays, MapPin, UserMinus, Crown, X } from "lucide-react";
import { supabase, type Message } from "@/lib/supabase";
import { getInitials, SPORT_META } from "@/lib/utils";

type TeamInfo = {
  id: string;
  name: string;
  sport: string;
  members_count: number;
  is_public: boolean;
  owner_id: string;
};

type TeamMemberWithProfile = {
  id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  profile: { id: string; full_name: string | null; username: string | null } | null;
};

const BUBBLE_GRADIENTS = [
  "linear-gradient(135deg, #2EC4B6, #1FA89B)",
  "linear-gradient(135deg, #7B61FF, #5B41DF)",
  "linear-gradient(135deg, #EC4899, #DB2777)",
  "linear-gradient(135deg, #1A2B4A, #243757)",
  "linear-gradient(135deg, #F4B43A, #E09B2A)",
  "linear-gradient(135deg, #22C55E, #16A34A)",
  "linear-gradient(135deg, #3B82F6, #2563EB)",
];

function avatarGradient(userId: string) {
  const hash = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return BUBBLE_GRADIENTS[hash % BUBBLE_GRADIENTS.length];
}

function formatMsgTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours()}h${d.getMinutes().toString().padStart(2, "0")}`;
}

function ReceivedBubble({ msg, showName }: { msg: Message; showName: boolean }) {
  const initials = getInitials(msg.sender?.full_name);
  const gradient = avatarGradient(msg.sender_id);
  return (
    <div className="flex items-end gap-2" style={{ marginBottom: showName ? 10 : 4 }}>
      <div
        className="flex items-center justify-center rounded-full text-white flex-shrink-0"
        style={{ width: 30, height: 30, background: gradient, fontSize: 10, fontWeight: 800, alignSelf: "flex-end" }}
      >
        {initials}
      </div>
      <div style={{ maxWidth: "75%" }}>
        {showName && (
          <p style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6", marginBottom: 3, paddingLeft: 2 }}>
            {msg.sender?.full_name ?? "Membre"}
          </p>
        )}
        <div style={{ background: "#fff", border: "1px solid #E5E8EE", borderRadius: "18px 18px 18px 4px", padding: "10px 14px" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1A2B4A", lineHeight: 1.5 }}>{msg.content}</p>
        </div>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#8A93A6", marginTop: 3, paddingLeft: 2 }}>
          {formatMsgTime(msg.created_at)}
        </p>
      </div>
    </div>
  );
}

function SentBubble({ msg }: { msg: Message }) {
  return (
    <div className="flex flex-col items-end" style={{ marginBottom: 8 }}>
      <div style={{ background: "linear-gradient(135deg, #FF6B35, #E5551F)", borderRadius: "18px 18px 4px 18px", padding: "10px 14px", maxWidth: "75%" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.5 }}>{msg.content}</p>
      </div>
      <p style={{ fontSize: 10, fontWeight: 600, color: "#8A93A6", marginTop: 3 }}>
        {formatMsgTime(msg.created_at)}
      </p>
    </div>
  );
}

type EventCardData = {
  title: string;
  sport: string;
  date: string;
  time: string;
  duration: number;
  terrain: string | null;
  eventId: string;
};

function EventInviteCard({ msg }: { msg: Message }) {
  let data: EventCardData | null = null;
  try { data = JSON.parse(msg.content) as EventCardData; } catch { /* ignore */ }
  if (!data) return null;

  const sport = SPORT_META[data.sport] ?? { emoji: "🏟️", label: data.sport, color: "#FF6B35" };
  const dateLabel = new Date(`${data.date}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }).replace(/^\w/, c => c.toUpperCase());
  const durationLabel = data.duration < 60 ? `${data.duration}min` : `${Math.floor(data.duration / 60)}h${data.duration % 60 > 0 ? (data.duration % 60).toString().padStart(2, "0") : ""}`;

  return (
    <div style={{ marginBottom: 12, maxWidth: "85%" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6", marginBottom: 4, paddingLeft: 2 }}>
        {msg.sender?.full_name ?? "Membre"} · {formatMsgTime(msg.created_at)}
      </p>
      <div style={{ background: "#fff", border: "1.5px solid #E5E8EE", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
        {/* Header gradient */}
        <div style={{ background: `linear-gradient(135deg, ${sport.color}, ${sport.color}cc)`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>{sport.emoji}</span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 0.5 }}>Nouvel événement</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: -0.2, lineHeight: 1.2 }}>{data.title}</p>
          </div>
        </div>
        {/* Details */}
        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
          <div className="flex items-center gap-2">
            <CalendarDays size={13} color="#8A93A6" strokeWidth={2} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#5B6478" }}>{dateLabel} à {data.time} · {durationLabel}</span>
          </div>
          {data.terrain && (
            <div className="flex items-center gap-2">
              <MapPin size={13} color="#8A93A6" strokeWidth={2} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#5B6478" }}>{data.terrain}</span>
            </div>
          )}
        </div>
        {/* CTA */}
        <div style={{ padding: "0 14px 12px" }}>
          <Link href={`/events/${data.eventId}`}
            style={{
              height: 38, borderRadius: 10,
              background: sport.color, textDecoration: "none",
              color: "#fff", fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 12px ${sport.color}44`,
            }}>
            Voir et rejoindre →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TeamChatPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const teamId = params.id;

  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [joining, setJoining] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [kickingId, setKickingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setCurrentUserId(session.user.id);

      const [{ data: teamData }, { data: membership }] = await Promise.all([
        supabase.from("teams").select("id,name,sport,members_count,is_public,owner_id").eq("id", teamId).single(),
        supabase.from("team_members").select("id").eq("team_id", teamId).eq("user_id", session.user.id).single(),
      ]);

      setTeam(teamData);
      const member = !!membership;
      setIsMember(member);

      if (member) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("*, sender:profiles!sender_id(id, full_name, avatar_url)")
          .eq("team_id", teamId)
          .order("created_at", { ascending: true })
          .limit(50);
        const list = (msgs ?? []) as Message[];
        list.forEach((m) => seenIds.current.add(m.id));
        setMessages(list);
      }

      setLoading(false);
    }
    load();
  }, [teamId, router]);

  // Realtime subscription
  useEffect(() => {
    if (isMember !== true) return;

    const channel = supabase
      .channel(`team-messages-${teamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `team_id=eq.${teamId}` },
        async (payload) => {
          const newId = payload.new.id as string;
          if (seenIds.current.has(newId)) return;
          seenIds.current.add(newId);

          const { data: msg } = await supabase
            .from("messages")
            .select("*, sender:profiles!sender_id(id, full_name, avatar_url)")
            .eq("id", newId)
            .single();
          if (msg) setMessages((prev) => [...prev, msg as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [teamId, isMember]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || !currentUserId || sending) return;
    setSending(true);
    setInputText("");
    await supabase.from("messages").insert({
      team_id: teamId,
      sender_id: currentUserId,
      content: text,
    });
    setSending(false);
    inputRef.current?.focus();
  }

  async function openMembers() {
    setShowMembers(true);
    if (members.length > 0) return;
    setLoadingMembers(true);
    const { data } = await supabase
      .from("team_members")
      .select("id, user_id, role, joined_at, profile:profiles!user_id(id, full_name, username)")
      .eq("team_id", teamId)
      .order("joined_at", { ascending: true });
    setMembers((data ?? []) as unknown as TeamMemberWithProfile[]);
    setLoadingMembers(false);
  }

  async function handleKick(member: TeamMemberWithProfile) {
    if (!team || kickingId) return;
    const name = member.profile?.full_name ?? "ce membre";
    if (!window.confirm(`Exclure ${name} de l'équipe ?`)) return;
    setKickingId(member.user_id);
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", member.user_id);
    if (!error) {
      setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
      setTeam((t) => t ? { ...t, members_count: Math.max(0, t.members_count - 1) } : t);
    }
    setKickingId(null);
  }

  async function handleJoin() {
    if (!currentUserId || joining || !team) return;
    setJoining(true);
    await supabase.from("team_members").insert({ team_id: teamId, user_id: currentUserId, role: "member" });
    setIsMember(true);
    setTeam((t) => t ? { ...t, members_count: t.members_count + 1 } : t);
    // Load messages after joining
    const { data: msgs } = await supabase
      .from("messages")
      .select("*, sender:profiles!sender_id(id, full_name, avatar_url)")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true })
      .limit(50);
    const list = (msgs ?? []) as Message[];
    list.forEach((m) => seenIds.current.add(m.id));
    setMessages(list);
    setJoining(false);
  }

  const sport = SPORT_META[team?.sport ?? ""] ?? SPORT_META.basket;

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: "#F6F7FA", minHeight: "100vh", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E8EE", padding: "48px 16px 12px" }}>
          <div className="flex items-center gap-3">
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: 120, height: 15, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 6 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-end gap-2" style={{ marginBottom: 16 }}>
              <div className="skeleton rounded-full" style={{ width: 30, height: 30, flexShrink: 0 }} />
              <div className="skeleton" style={{ width: `${40 + i * 20}%`, height: 44, borderRadius: 18 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Team not found ───────────────────────────────────────────
  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "100vh", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>😕</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#1A2B4A" }}>Équipe introuvable</p>
        <button onClick={() => router.push("/teams")} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, background: "#FF6B35", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
          Retour
        </button>
      </div>
    );
  }

  // ── Not a member — show team info + join CTA ─────────────────
  if (!isMember) {
    return (
      <div style={{ background: "#F6F7FA", minHeight: "100vh", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E8EE", padding: "48px 16px 12px" }}>
          <button onClick={() => router.push("/teams")} className="flex items-center gap-2 tap-scale" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>
            <ChevronLeft size={18} strokeWidth={2.5} /> Équipes
          </button>
        </div>

        {/* Team hero */}
        <div className="flex flex-col items-center" style={{ padding: "40px 20px 24px", background: "linear-gradient(160deg, #1A2B4A 0%, #243757 100%)" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: sport.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 14, boxShadow: `0 8px 24px ${sport.color}44` }}>
            {sport.emoji}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: -0.4, textAlign: "center" }}>{team.name}</h1>
          <div className="flex items-center gap-3" style={{ marginTop: 8 }}>
            <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
              <Users size={12} strokeWidth={2.5} /> {team.members_count} membres
            </span>
            {!team.is_public && (
              <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                <Lock size={12} strokeWidth={2.5} /> Privée
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: "24px 16px" }}>
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", padding: 20, marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1A2B4A", marginBottom: 6 }}>Tu n'es pas encore membre</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6" }}>Rejoins l'équipe pour accéder au chat et aux événements.</p>
          </div>

          <button
            onClick={handleJoin}
            disabled={joining}
            className="tap-scale w-full"
            style={{
              height: 52, borderRadius: 14, width: "100%",
              background: "linear-gradient(135deg, #FF6B35, #E5551F)",
              color: "#fff", border: "none", cursor: joining ? "not-allowed" : "pointer",
              fontSize: 16, fontWeight: 800, letterSpacing: -0.2,
              boxShadow: "0 6px 18px -6px rgba(255,107,53,0.55)",
              opacity: joining ? 0.7 : 1, transition: "opacity 0.15s",
            }}
          >
            {joining ? "Rejoindre…" : `Rejoindre ${team.name}`}
          </button>
        </div>
      </div>
    );
  }

  // ── Full chat view ───────────────────────────────────────────
  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 72px)", background: "#F6F7FA", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E8EE", padding: "48px 16px 12px", flexShrink: 0, zIndex: 40 }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/teams")}
            className="flex items-center justify-center tap-scale flex-shrink-0"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F3F7", border: "none", cursor: "pointer" }}
          >
            <ChevronLeft size={20} color="#1A2B4A" strokeWidth={2.5} />
          </button>

          <div className="relative flex-shrink-0">
            <div
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 12, background: sport.gradient, fontSize: 20 }}
            >
              {sport.emoji}
            </div>
            <div className="absolute" style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", border: "2px solid #fff", bottom: -1, right: -1 }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2, lineHeight: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {team.name}
            </p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#22C55E", marginTop: 2 }}>
              ● {team.members_count} membres
            </p>
          </div>

          <button
            onClick={openMembers}
            className="flex items-center justify-center tap-scale flex-shrink-0"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F3F7", border: "none", cursor: "pointer" }}
          >
            <MoreHorizontal size={18} color="#1A2B4A" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "12px 16px 20px" }}>
        {/* Day separator */}
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "#E5E8EE" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6", textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>
            Aujourd'hui
          </span>
          <div style={{ flex: 1, height: 1, background: "#E5E8EE" }} />
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center" style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>{sport.emoji}</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1A2B4A" }}>Soyez les premiers à écrire !</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 4 }}>L'aventure commence ici.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.message_type === "event_invite") {
            return <EventInviteCard key={msg.id} msg={msg} />;
          }
          const isMine = msg.sender_id === currentUserId;
          const showName = !isMine && (i === 0 || messages[i - 1].sender_id !== msg.sender_id);
          return isMine
            ? <SentBubble key={msg.id} msg={msg} />
            : <ReceivedBubble key={msg.id} msg={msg} showName={showName} />;
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2"
        style={{ background: "#fff", borderTop: "1px solid #E5E8EE", padding: "8px 12px", flexShrink: 0 }}
      >
        <button
          className="flex items-center justify-center tap-scale flex-shrink-0"
          style={{ width: 36, height: 36, borderRadius: 999, background: "#F1F3F7", border: "none", cursor: "pointer" }}
        >
          <Plus size={18} color="#5B6478" strokeWidth={2.5} />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Message..."
          style={{ flex: 1, height: 40, borderRadius: 999, background: "#F1F3F7", border: "none", outline: "none", padding: "0 16px", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit" }}
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || sending}
          className="flex items-center justify-center tap-scale flex-shrink-0"
          style={{
            width: 36, height: 36, borderRadius: 999,
            background: inputText.trim() ? "#FF6B35" : "#F1F3F7",
            border: "none", cursor: inputText.trim() ? "pointer" : "not-allowed",
            transition: "background 0.18s ease",
            boxShadow: inputText.trim() ? "0 4px 12px rgba(255,107,53,0.35)" : "none",
          }}
        >
          <SendHorizonal size={17} color={inputText.trim() ? "#fff" : "#8A93A6"} strokeWidth={2.5} style={{ transition: "color 0.18s ease" }} />
        </button>
      </div>

      {/* ── Members bottom sheet ── */}
      {showMembers && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowMembers(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(26,43,74,0.45)",
              backdropFilter: "blur(2px)",
            }}
          />

          {/* Panel */}
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 61,
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 -8px 40px rgba(26,43,74,0.18)",
            animation: "slideUp 0.28s cubic-bezier(0.32,0.72,0,1)",
          }}>
            <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>

            {/* Handle + header */}
            <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E5E8EE", margin: "0 auto 14px" }} />
              <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A" }}>
                  Membres · {team?.members_count ?? members.length}
                </p>
                <button
                  onClick={() => setShowMembers(false)}
                  className="flex items-center justify-center tap-scale"
                  style={{ width: 32, height: 32, borderRadius: 10, background: "#F6F7FA", border: "none", cursor: "pointer" }}
                >
                  <X size={16} color="#5B6478" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 32px" }}>
              {loadingMembers ? (
                [0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3" style={{ padding: "10px 0" }}>
                    <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: "50%", height: 13, borderRadius: 6, marginBottom: 7 }} />
                      <div className="skeleton" style={{ width: "30%", height: 10, borderRadius: 6 }} />
                    </div>
                  </div>
                ))
              ) : (
                members.map((m, i) => {
                  const isOwner = m.user_id === team?.owner_id;
                  const isMe = m.user_id === currentUserId;
                  const amOwner = currentUserId === team?.owner_id;
                  const initials = getInitials(m.profile?.full_name);
                  const gradient = avatarGradient(m.user_id);

                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3"
                      style={{
                        padding: "10px 0",
                        borderBottom: i < members.length - 1 ? "1px solid #F1F3F7" : "none",
                      }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{ width: 42, height: 42, borderRadius: 13, background: gradient, fontSize: 14, fontWeight: 800, color: "#fff" }}
                      >
                        {initials}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 14, fontWeight: 700, color: "#1A2B4A",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {m.profile?.full_name ?? m.profile?.username ?? "Membre"}
                          {isMe && <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6", marginLeft: 6 }}>( vous )</span>}
                        </p>
                        <div className="flex items-center gap-1" style={{ marginTop: 2 }}>
                          {isOwner && <Crown size={11} color="#F4B43A" strokeWidth={2.5} />}
                          <p style={{ fontSize: 12, fontWeight: 600, color: isOwner ? "#F4B43A" : "#8A93A6" }}>
                            {isOwner ? "Propriétaire" : m.role === "admin" ? "Admin" : "Membre"}
                          </p>
                        </div>
                      </div>

                      {amOwner && !isOwner && (
                        <button
                          onClick={() => handleKick(m)}
                          disabled={kickingId === m.user_id}
                          className="flex items-center justify-center tap-scale"
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: kickingId === m.user_id ? "#F1F3F7" : "#FFF0EC",
                            border: "none", cursor: "pointer", flexShrink: 0,
                            transition: "background 0.15s",
                          }}
                        >
                          <UserMinus size={15} color={kickingId === m.user_id ? "#8A93A6" : "#FF6B35"} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
