"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { supabase, type Notification } from "@/lib/supabase";

/* ─── Type meta ───────────────────────────────────────────── */

const TYPE_META: Record<string, { emoji: string; color: string; bg: string }> = {
  event_joined:    { emoji: "🎉", color: "#FF6B35", bg: "#FFE6DA" },
  team_joined:     { emoji: "👥", color: "#2EC4B6", bg: "#D6F4F1" },
  event_invite:    { emoji: "📅", color: "#1A2B4A", bg: "#E8EBF0" },
  profile_request: { emoji: "🔒", color: "#7B61FF", bg: "#EDE9FE" },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? { emoji: "🔔", color: "#8A93A6", bg: "#F1F3F7" };
}

/* ─── Time formatter ──────────────────────────────────────── */

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 2)   return "À l'instant";
  if (mins < 60)  return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days === 1) return "Hier";
  if (days < 7)   return `il y a ${days} jours`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/* ─── Skeleton row ────────────────────────────────────────── */

function SkeletonRow({ delay }: { delay: number }) {
  return (
    <div className="flex items-center gap-3"
      style={{ background: "#fff", padding: "14px 16px", opacity: 1 - delay * 0.15, animationDelay: `${delay * 80}ms` }}>
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: "60%", height: 13, borderRadius: 6, marginBottom: 7 }} />
        <div className="skeleton" style={{ width: "80%", height: 11, borderRadius: 6, marginBottom: 7 }} />
        <div className="skeleton" style={{ width: "30%", height: 10, borderRadius: 6 }} />
      </div>
    </div>
  );
}

/* ─── Notification row ────────────────────────────────────── */

function NotifRow({
  notif,
  onClick,
  isLast,
  onAccept,
  onReject,
  actionDone,
}: {
  notif: Notification;
  onClick: () => void;
  isLast: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  actionDone?: "accepted" | "rejected" | null;
}) {
  const meta = getTypeMeta(notif.type);
  const hasLink = !!(notif.data?.event_id || notif.data?.team_id);
  const unread = !notif.read;
  const isRequest = notif.type === "profile_request";

  return (
    <div
      style={{
        background: unread ? "#fff" : "#FAFAFA",
        padding: "14px 16px",
        borderBottom: isLast ? "none" : "1px solid #F1F3F7",
        position: "relative",
      }}
    >
      {unread && (
        <div style={{
          position: "absolute", left: 0, top: 12, bottom: 12,
          width: 3, borderRadius: "0 3px 3px 0", background: "#FF6B35",
        }} />
      )}

      <div className="flex items-center gap-3" onClick={isRequest ? undefined : onClick}
        style={{ cursor: hasLink ? "pointer" : "default" }}>
        <div className="flex items-center justify-center flex-shrink-0"
          style={{ width: 44, height: 44, borderRadius: 14, background: meta.bg, fontSize: 20 }}>
          {meta.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: unread ? 800 : 600,
            color: unread ? "#1A2B4A" : "#5B6478",
            lineHeight: 1.3, marginBottom: 3,
          }}>
            {notif.title}
          </p>
          {notif.body && (
            <p style={{
              fontSize: 13, fontWeight: 500, color: "#8A93A6",
              lineHeight: 1.4, marginBottom: 4,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {notif.body}
            </p>
          )}
          <p style={{ fontSize: 11, fontWeight: 600, color: meta.color }}>
            {formatTimeAgo(notif.created_at)}
          </p>
        </div>

        {hasLink && !isRequest && (
          <ChevronRight size={16} color="#D5DAE3" strokeWidth={2.5} style={{ flexShrink: 0 }} />
        )}
      </div>

      {/* Accept / Reject buttons for profile_request */}
      {isRequest && (
        <div className="flex gap-2" style={{ marginTop: 10, paddingLeft: 56 }}>
          {actionDone === "accepted" ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: "#22C55E" }}>✓ Accès accordé</span>
          ) : actionDone === "rejected" ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: "#8A93A6" }}>✗ Refusé</span>
          ) : (
            <>
              <button onClick={onAccept}
                className="tap-scale flex items-center gap-1"
                style={{ height: 30, borderRadius: 999, padding: "0 14px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", background: "#22C55E", color: "#fff" }}>
                <Check size={12} strokeWidth={3} /> Accepter
              </button>
              <button onClick={onReject}
                className="tap-scale flex items-center gap-1"
                style={{ height: 30, borderRadius: 999, padding: "0 14px", fontSize: 12, fontWeight: 700, border: "1.5px solid #E5E8EE", cursor: "pointer", background: "#fff", color: "#5B6478" }}>
                <X size={12} strokeWidth={2.5} /> Refuser
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<Record<string, "accepted" | "rejected">>({});

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setCurrentUserId(session.user.id);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      const list = (data ?? []) as Notification[];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
      setLoading(false);

      // Mark all as read
      if (list.some((n) => !n.read)) {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", session.user.id)
          .eq("read", false);
      }
    }
    load();
  }, [router]);

  async function handleAccept(notif: Notification) {
    if (!currentUserId || !notif.data?.requester_id) return;
    await supabase.from("profile_access").insert({
      profile_id: currentUserId,
      viewer_id: notif.data.requester_id,
    });
    await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
    setActionDone((prev) => ({ ...prev, [notif.id]: "accepted" }));
  }

  async function handleReject(notif: Notification) {
    await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
    setActionDone((prev) => ({ ...prev, [notif.id]: "rejected" }));
  }

  function handleNotifClick(notif: Notification) {
    if (notif.type === "event_joined" || notif.type === "event_invite") {
      if (notif.data?.event_id) router.push(`/events/${notif.data.event_id}`);
    } else if (notif.type === "team_joined") {
      if (notif.data?.team_id) router.push(`/teams/${notif.data.team_id}`);
    }
  }

  return (
    <div style={{ background: "#F6F7FA", minHeight: "100vh", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="sticky top-0 z-40" style={{ background: "#fff", borderBottom: "1px solid #F1F3F7" }}>
        <div style={{ paddingTop: 52 }}>
          <div className="flex items-center gap-3" style={{ padding: "10px 16px 12px" }}>
            <button onClick={() => router.back()} className="flex items-center justify-center tap-scale"
              style={{ width: 36, height: 36, borderRadius: 10, background: "#F6F7FA", border: "none", cursor: "pointer" }}>
              <ChevronLeft size={20} color="#1A2B4A" strokeWidth={2.5} />
            </button>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4, flex: 1 }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <div style={{
                background: "#FF6B35", borderRadius: 999, minWidth: 24, height: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 8px", fontSize: 12, fontWeight: 800, color: "#fff",
              }}>
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ background: "#fff", marginTop: 12, borderRadius: 18, overflow: "hidden", margin: "12px 16px 0" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonRow key={i} delay={i} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center"
          style={{ padding: "80px 32px", textAlign: "center", animation: "fadeSlide 0.3s ease" }}>
          <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>🔔</div>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.3, marginBottom: 8 }}>
            Aucune notification
          </p>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#8A93A6", lineHeight: 1.5 }}>
            Rejoins des événements et des équipes pour recevoir des notifications !
          </p>
        </div>
      ) : (
        /* List */
        <div style={{ margin: "12px 0 0" }}>

          {/* Group: today */}
          {notifications.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8A93A6", textTransform: "uppercase", letterSpacing: 0.8, padding: "0 16px 8px" }}>
                Récentes
              </p>
              <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", margin: "0 16px", border: "1px solid #E5E8EE", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.08)" }}>
                {notifications.map((notif, i) => (
                  <div key={notif.id} style={{ animation: `fadeSlide 0.25s ease both`, animationDelay: `${i * 40}ms` }}>
                    <NotifRow
                      notif={notif}
                      onClick={() => handleNotifClick(notif)}
                      isLast={i === notifications.length - 1}
                      onAccept={() => handleAccept(notif)}
                      onReject={() => handleReject(notif)}
                      actionDone={actionDone[notif.id] ?? null}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
