"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, X, CalendarDays, Clock } from "lucide-react";

const SPORT_EMOJI: Record<string, string> = {
  basket: "🏀", foot: "⚽", tennis: "🎾", running: "🏃",
  volley: "🏐", padel: "🏓", velo: "🚴", yoga: "🧘",
};

type BookingRow = {
  id: string;
  terrain_id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "cancelled";
  created_at: string;
  terrain: { name: string; sport: string; district: string } | null;
  user: { full_name: string | null; username: string | null; avatar_url: string | null } | null;
};

function Avatar({ user }: { user: BookingRow["user"] }) {
  const name = user?.full_name ?? user?.username ?? "?";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={name}
        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #FF6B35, #E5551F)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 800, color: "#fff",
      }}
    >
      {initials}
    </div>
  );
}

function SkeletonRow({ last }: { last?: boolean }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{ padding: "14px 18px", borderBottom: last ? "none" : "1px solid #F1F3F7" }}
    >
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ minWidth: 140, flexShrink: 0 }}>
        <div className="skeleton" style={{ width: 110, height: 13, borderRadius: 6, marginBottom: 5 }} />
        <div className="skeleton" style={{ width: 70, height: 11, borderRadius: 6 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: 160, height: 13, borderRadius: 6, marginBottom: 5 }} />
        <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 999 }} />
      </div>
      <div style={{ minWidth: 110, flexShrink: 0 }}>
        <div className="skeleton" style={{ width: 90, height: 12, borderRadius: 6, marginBottom: 5, marginLeft: "auto" }} />
        <div className="skeleton" style={{ width: 70, height: 11, borderRadius: 6, marginLeft: "auto" }} />
      </div>
      <div className="skeleton" style={{ width: 70, height: 24, borderRadius: 999, flexShrink: 0 }} />
      <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
    </div>
  );
}

export default function AdminReservationsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("bookings")
        .select("*, terrain:terrains(name, sport, district), user:profiles!user_id(full_name, username, avatar_url)")
        .order("created_at", { ascending: false });
      setBookings((data as BookingRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleCancel(id: string) {
    if (!confirm("Annuler cette réservation ?")) return;
    setCancellingId(id);
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    setBookings((prev) =>
      prev.map((b) => b.id === id ? { ...b, status: "cancelled" as const } : b)
    );
    setCancellingId(null);
  }

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (b.terrain?.name ?? "").toLowerCase().includes(q) ||
      (b.user?.full_name ?? "").toLowerCase().includes(q) ||
      (b.user?.username ?? "").toLowerCase().includes(q)
    );
  });

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "short", day: "numeric", month: "short",
    });
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4 }}>
            Réservations
          </h1>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 2 }}>
            {loading ? "…" : `${bookings.length} réservation${bookings.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Mini stats */}
        {!loading && (
          <div className="flex items-center gap-4"
            style={{
              background: "#fff", borderRadius: 14, border: "1px solid #E5E8EE",
              padding: "10px 18px",
              boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#22C55E", letterSpacing: -0.5, lineHeight: 1 }}>
                {confirmedCount}
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8A93A6", marginTop: 2 }}>Confirmées</p>
            </div>
            <div style={{ width: 1, height: 32, background: "#E5E8EE" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#EF4444", letterSpacing: -0.5, lineHeight: 1 }}>
                {cancelledCount}
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8A93A6", marginTop: 2 }}>Annulées</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <div
          className="flex items-center gap-2"
          style={{
            height: 40, borderRadius: 999, background: "#fff",
            border: "1px solid #E5E8EE", padding: "0 14px",
            flex: 1, maxWidth: 320,
          }}
        >
          <Search size={15} color="#8A93A6" strokeWidth={2} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Terrain, utilisateur…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit",
            }}
          />
        </div>
        {(["all", "confirmed", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              height: 36, borderRadius: 999, padding: "0 14px",
              fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              background: statusFilter === s ? "#1A2B4A" : "#fff",
              color: statusFilter === s ? "#fff" : "#5B6478",
              boxShadow: statusFilter === s ? "none" : "0 0 0 1px #E5E8EE",
              transition: "all 0.15s ease",
            }}
          >
            {s === "all" ? "Toutes" : s === "confirmed" ? "Confirmées" : "Annulées"}
          </button>
        ))}
      </div>

      {/* List */}
      <div
        style={{
          background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", overflow: "hidden",
          boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)",
        }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} last={i === 4} />)
        ) : filtered.length === 0 ? (
          <div style={{ padding: "52px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A" }}>Aucune réservation</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 4 }}>
              {query || statusFilter !== "all"
                ? "Essayez d'autres filtres"
                : "Les réservations apparaîtront ici"}
            </p>
          </div>
        ) : (
          filtered.map((booking, idx) => {
            const emoji = SPORT_EMOJI[booking.terrain?.sport ?? ""] ?? "🏟️";
            const userName = booking.user?.full_name ?? booking.user?.username ?? "Utilisateur";
            const isConfirmed = booking.status === "confirmed";
            return (
              <div
                key={booking.id}
                className="flex items-center gap-3"
                style={{
                  padding: "14px 18px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid #F1F3F7" : "none",
                }}
              >
                <Avatar user={booking.user} />

                {/* User */}
                <div style={{ minWidth: 140, flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A", lineHeight: 1.2 }}>
                    {userName}
                  </p>
                  {booking.user?.username && (
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6", marginTop: 2 }}>
                      @{booking.user.username}
                    </p>
                  )}
                </div>

                {/* Terrain */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-1" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 15 }}>{emoji}</span>
                    <span
                      style={{
                        fontSize: 13, fontWeight: 700, color: "#1A2B4A",
                        overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                      }}
                    >
                      {booking.terrain?.name ?? "Terrain inconnu"}
                    </span>
                  </div>
                  {booking.terrain?.district && (
                    <span
                      style={{
                        display: "inline-block", fontSize: 11, fontWeight: 700,
                        color: "#5B6478", background: "#F1F3F7",
                        borderRadius: 999, padding: "2px 8px",
                      }}
                    >
                      {booking.terrain.district}
                    </span>
                  )}
                </div>

                {/* Date + time */}
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 110 }}>
                  <div
                    className="flex items-center gap-1 justify-end"
                    style={{ marginBottom: 3 }}
                  >
                    <CalendarDays size={11} color="#8A93A6" strokeWidth={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#5B6478" }}>
                      {formatDate(booking.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Clock size={11} color="#8A93A6" strokeWidth={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                      {booking.start_time.slice(0, 5)} → {booking.end_time.slice(0, 5)}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <span
                  style={{
                    fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "3px 10px",
                    background: isConfirmed ? "#D1FAE5" : "#FEE2E2",
                    color: isConfirmed ? "#22C55E" : "#EF4444",
                    flexShrink: 0,
                  }}
                >
                  {isConfirmed ? "Confirmée" : "Annulée"}
                </span>

                {/* Cancel button (only for confirmed) */}
                {isConfirmed ? (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    title="Annuler cette réservation"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#FEE2E2", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      opacity: cancellingId === booking.id ? 0.5 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <X size={14} color="#EF4444" strokeWidth={2.5} />
                  </button>
                ) : (
                  <div style={{ width: 32, flexShrink: 0 }} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
