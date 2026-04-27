"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays, Users, MapPin, TrendingUp, BookMarked,
  ChevronRight, Clock,
} from "lucide-react";

type Stats = {
  totalEvents: number;
  openEvents: number;
  totalUsers: number;
  totalTeams: number;
  totalTerrains: number;
  totalParticipants: number;
  totalBookings: number;
};

type RecentEvent = {
  id: string;
  title: string;
  sport: string;
  event_date: string;
  start_time: string;
  current_players: number;
  max_players: number;
  status: string;
};

const SPORT_EMOJI: Record<string, string> = {
  basket: "🏀", foot: "⚽", tennis: "🎾", running: "🏃",
  volley: "🏐", padel: "🏓", velo: "🚴", yoga: "🧘",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: "#D6F4F1", text: "#1FA89B", label: "Ouvert" },
  full: { bg: "#FEF3C7", text: "#D97706", label: "Complet" },
  cancelled: { bg: "#FEE2E2", text: "#EF4444", label: "Annulé" },
  done: { bg: "#F1F3F7", text: "#8A93A6", label: "Terminé" },
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string;
}) {
  return (
    <div
      style={{
        background: "#fff", borderRadius: 16,
        padding: "20px", border: "1px solid #E5E8EE",
        boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${color}18`, marginBottom: 12,
        }}
      >
        <Icon size={20} color={color} strokeWidth={2.5} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.5, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2B4A", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0, openEvents: 0, totalUsers: 0,
    totalTeams: 0, totalTerrains: 0, totalParticipants: 0, totalBookings: 0,
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [
        { count: totalEvents },
        { count: openEvents },
        { count: totalUsers },
        { count: totalTeams },
        { count: totalTerrains },
        { count: totalParticipants },
        { count: totalBookings },
        { data: events },
      ] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("teams").select("*", { count: "exact", head: true }),
        supabase.from("terrains").select("*", { count: "exact", head: true }),
        supabase.from("event_participants").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
        supabase.from("events").select("id,title,sport,event_date,start_time,current_players,max_players,status")
          .order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        totalEvents: totalEvents ?? 0,
        openEvents: openEvents ?? 0,
        totalUsers: totalUsers ?? 0,
        totalTeams: totalTeams ?? 0,
        totalTerrains: totalTerrains ?? 0,
        totalParticipants: totalParticipants ?? 0,
        totalBookings: totalBookings ?? 0,
      });
      setRecentEvents(events ?? []);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 300 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#8A93A6" }}>Chargement…</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4, lineHeight: 1 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#8A93A6", marginTop: 4 }}>
          Vue d'ensemble de TeamUp!
        </p>
      </div>

      {/* Stats grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", marginBottom: 32 }}
      >
        <StatCard icon={CalendarDays} label="Événements" value={stats.totalEvents}
          sub={`${stats.openEvents} ouverts`} color="#FF6B35" />
        <StatCard icon={Users} label="Utilisateurs" value={stats.totalUsers}
          sub="inscrits" color="#2EC4B6" />
        <StatCard icon={TrendingUp} label="Équipes" value={stats.totalTeams}
          color="#7B61FF" />
        <StatCard icon={MapPin} label="Terrains" value={stats.totalTerrains}
          color="#F4B43A" />
        <StatCard icon={Users} label="Participations" value={stats.totalParticipants}
          sub="total" color="#22C55E" />
        <StatCard icon={BookMarked} label="Réservations" value={stats.totalBookings}
          sub="confirmées" color="#3B82F6" />
      </div>

      {/* Recent events */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.3 }}>
            Événements récents
          </h2>
          <Link
            href="/admin/events"
            style={{ fontSize: 13, fontWeight: 700, color: "#FF6B35", textDecoration: "none" }}
          >
            Voir tout →
          </Link>
        </div>

        <div
          style={{
            background: "#fff", borderRadius: 18,
            border: "1px solid #E5E8EE", overflow: "hidden",
            boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)",
          }}
        >
          {recentEvents.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#8A93A6", fontSize: 14, fontWeight: 600 }}>
              Aucun événement pour l'instant
            </div>
          ) : (
            recentEvents.map((event, idx) => {
              const statusStyle = STATUS_COLORS[event.status] ?? STATUS_COLORS.open;
              const emoji = SPORT_EMOJI[event.sport] ?? "🏅";
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div
                    className="flex items-center gap-3 tap-scale"
                    style={{
                      padding: "14px 18px",
                      borderBottom: idx < recentEvents.length - 1 ? "1px solid #F1F3F7" : "none",
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {event.title}
                      </p>
                      <div className="flex items-center gap-3" style={{ marginTop: 3 }}>
                        <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                          <Clock size={11} strokeWidth={2.5} />
                          {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {event.start_time.slice(0, 5)}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                          {event.current_players}/{event.max_players} joueurs
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700,
                        background: statusStyle.bg, color: statusStyle.text,
                        borderRadius: 999, padding: "3px 10px",
                        flexShrink: 0,
                      }}
                    >
                      {statusStyle.label}
                    </span>
                    <ChevronRight size={16} color="#8A93A6" strokeWidth={2} />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
