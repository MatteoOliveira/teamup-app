"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar, Clock, MapPin } from "lucide-react";
import { supabase, type Terrain } from "@/lib/supabase";

const SPORT_META: Record<string, { emoji: string; color: string; soft: string }> = {
  basket:  { emoji: "🏀", color: "#FF6B35", soft: "#FFE6DA" },
  foot:    { emoji: "⚽", color: "#2EC4B6", soft: "#D6F4F1" },
  tennis:  { emoji: "🎾", color: "#F4B43A", soft: "#FEF3C7" },
  padel:   { emoji: "🏓", color: "#3B82F6", soft: "#DBEAFE" },
  running: { emoji: "🏃", color: "#7B61FF", soft: "#EDE9FE" },
  volley:  { emoji: "🏐", color: "#EC4899", soft: "#FCE7F3" },
  yoga:    { emoji: "🧘", color: "#14B8A6", soft: "#CCFBF1" },
  velo:    { emoji: "🚴", color: "#06B6D4", soft: "#CFFAFE" },
};

type BookingRow = {
  id:         string;
  terrain_id: string;
  date:       string;
  start_time: string;
  end_time:   string;
  status:     string;
  terrain:    Terrain;
};

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const day   = d.toLocaleDateString("fr-FR", { weekday: "long" });
  const num   = d.getDate();
  const month = d.toLocaleDateString("fr-FR", { month: "long" });
  return `${day.charAt(0).toUpperCase() + day.slice(1)} ${num} ${month}`;
}

function formatTime(t: string): string {
  return t.slice(0, 5).replace(":", "h");
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 16, border: "1px solid #E5E8EE" }}>
      <div className="flex items-start gap-3">
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: "55%", height: 14, borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: "80%", height: 11, borderRadius: 6, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: "60%", height: 11, borderRadius: 6 }} />
        </div>
        <div className="skeleton" style={{ width: 64, height: 22, borderRadius: 999, flexShrink: 0 }} />
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const router = useRouter();
  const [bookings,    setBookings]    = useState<BookingRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState<"upcoming" | "past">("upcoming");
  const [cancelling,  setCancelling]  = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data } = await supabase
        .from("bookings")
        .select("*, terrain:terrains(*)")
        .eq("user_id", session.user.id)
        .order("date",       { ascending: true })
        .order("start_time", { ascending: true });
      setBookings((data ?? []) as BookingRow[]);
      setLoading(false);
    })();
  }, [router]);

  const upcoming = bookings.filter(b => b.date >= today && b.status !== "cancelled");
  const past     = bookings.filter(b => b.date < today  || b.status === "cancelled");
  const displayed = tab === "upcoming" ? upcoming : past;

  async function handleCancel(bookingId: string) {
    if (!window.confirm("Annuler cette réservation ?")) return;
    setCancelling(bookingId);
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    setCancelling(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7FA", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', paddingBottom: 32 }}>
      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: "1px solid #E5E8EE", padding: "44px 16px 0" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
          <button onClick={() => router.back()} className="tap-scale flex items-center justify-center"
            style={{ width: 38, height: 38, borderRadius: 12, background: "#F1F3F7", border: "none", cursor: "pointer" }}>
            <ChevronLeft size={20} color="#1A2B4A" strokeWidth={2.5} />
          </button>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.3 }}>Mes réservations</p>
        </div>

        {/* Tabs */}
        <div className="flex">
          {(["upcoming", "past"] as const).map((t) => {
            const labels  = { upcoming: "À venir",              past: "Passées" };
            const counts  = { upcoming: upcoming.length,        past: past.length };
            const active  = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, height: 40, border: "none", background: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 700,
                  color: active ? "#1A2B4A" : "#8A93A6",
                  borderBottom: active ? "2.5px solid #FF6B35" : "2.5px solid transparent",
                  transition: "all 0.18s ease",
                }}>
                {labels[t]}
                {!loading && counts[t] > 0 && (
                  <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, background: active ? "#FFE6DA" : "#F1F3F7", color: active ? "#FF6B35" : "#8A93A6", borderRadius: 999, padding: "2px 7px" }}>
                    {counts[t]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 0" }}>
        {loading ? (
          <div className="flex flex-col" style={{ gap: 12 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", marginBottom: 6 }}>
              {tab === "upcoming" ? "Aucune réservation à venir" : "Aucun historique"}
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginBottom: 24 }}>
              {tab === "upcoming"
                ? "Réservez un terrain pour commencer !"
                : "Vos réservations passées apparaîtront ici"}
            </p>
            {tab === "upcoming" && (
              <button onClick={() => router.push("/fields")} className="tap-scale"
                style={{ height: 44, padding: "0 24px", borderRadius: 999, background: "linear-gradient(135deg, #FF6B35, #E5551F)", border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 14px -4px rgba(255,107,53,0.5)" }}>
                Voir les terrains →
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 12 }}>
            {displayed.map((booking) => {
              const s           = SPORT_META[booking.terrain?.sport ?? ""] ?? { emoji: "🏟️", color: "#5B6478", soft: "#F1F3F7" };
              const isCancelled = booking.status === "cancelled";
              const isFuture    = booking.date >= today && !isCancelled;

              return (
                <div key={booking.id}
                  style={{
                    background: "#fff", borderRadius: 18, padding: "16px",
                    border: "1px solid #E5E8EE",
                    boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.14)",
                    opacity: isCancelled ? 0.6 : 1,
                    transition: "opacity 0.2s",
                  }}>
                  <div className="flex items-start gap-3">
                    <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: s.soft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {s.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-start justify-between gap-2">
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2, lineHeight: 1.2 }}>
                          {booking.terrain?.name ?? "Terrain"}
                        </p>
                        <span style={{
                          fontSize: 11, fontWeight: 800, flexShrink: 0, borderRadius: 999, padding: "3px 9px",
                          background: isCancelled ? "#F1F3F7"  : "#D1FAE5",
                          color:      isCancelled ? "#8A93A6"  : "#16A34A",
                        }}>
                          {isCancelled ? "Annulée" : "Confirmée"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1" style={{ marginTop: 5 }}>
                        <Calendar size={11} color="#8A93A6" strokeWidth={2.5} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#5B6478" }}>
                          {formatDate(booking.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3" style={{ marginTop: 4, flexWrap: "wrap" }}>
                        <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 700, color: "#1A2B4A" }}>
                          <Clock size={11} color="#8A93A6" strokeWidth={2.5} />
                          {formatTime(booking.start_time)} → {formatTime(booking.end_time)}
                        </span>
                        {booking.terrain?.district && (
                          <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                            <MapPin size={11} strokeWidth={2.5} />
                            {booking.terrain.district}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isFuture && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F1F3F7" }}>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                        className="tap-scale"
                        style={{
                          height: 34, padding: "0 16px", borderRadius: 999,
                          border: "1.5px solid #FECACA", background: "none",
                          color: "#EF4444", fontSize: 13, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.18s",
                          opacity: cancelling === booking.id ? 0.6 : 1,
                        }}>
                        {cancelling === booking.id ? "Annulation…" : "Annuler"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
