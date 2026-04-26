"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Share2, MapPin, Star, Navigation, Check } from "lucide-react";
import { supabase, type Terrain } from "@/lib/supabase";

const SPORT_META: Record<string, { emoji: string; label: string; color: string; soft: string; gradient: string }> = {
  basket:  { emoji: "🏀", label: "Basket",  color: "#FF6B35", soft: "#FFE6DA", gradient: "135deg, #FF6B35, #E5551F" },
  foot:    { emoji: "⚽", label: "Foot",    color: "#2EC4B6", soft: "#D6F4F1", gradient: "135deg, #2EC4B6, #1FA89B" },
  tennis:  { emoji: "🎾", label: "Tennis",  color: "#F4B43A", soft: "#FEF3C7", gradient: "135deg, #F4B43A, #D4942A" },
  padel:   { emoji: "🏓", label: "Padel",   color: "#3B82F6", soft: "#DBEAFE", gradient: "135deg, #3B82F6, #2563EB" },
  running: { emoji: "🏃", label: "Running", color: "#7B61FF", soft: "#EDE9FE", gradient: "135deg, #7B61FF, #5B3FE0" },
  volley:  { emoji: "🏐", label: "Volley",  color: "#EC4899", soft: "#FCE7F3", gradient: "135deg, #EC4899, #C026A0" },
  yoga:    { emoji: "🧘", label: "Yoga",    color: "#14B8A6", soft: "#CCFBF1", gradient: "135deg, #14B8A6, #0E9E94" },
  velo:    { emoji: "🚴", label: "Vélo",    color: "#06B6D4", soft: "#CFFAFE", gradient: "135deg, #06B6D4, #0491A8" },
};

const AMENITY_LABELS: Record<string, string> = {
  lighting:         "💡 Éclairage",
  showers:          "🚿 Douches",
  changing_rooms:   "🏠 Vestiaires",
  pro_shop:         "🏪 Pro Shop",
  equipment_rental: "🎾 Location",
  parking:          "🅿️ Parking",
  cafe:             "☕ Café",
};

const DURATIONS = [
  { label: "1h",   mins: 60  },
  { label: "1h30", mins: 90  },
  { label: "2h",   mins: 120 },
];

type Slot = { start_time: string; end_time: string };

function genDays() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return {
      date:    d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3),
      dayNum:  d.getDate(),
    };
  });
}

function genSlots(): string[] {
  const slots: string[] = [];
  for (let h = 7; h < 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return slots;
}

function toMins(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function addMins(t: string, mins: number): string {
  const total = toMins(t) + mins;
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}

const DAYS = genDays();
const ALL_SLOTS = genSlots();

export default function TerrainDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [terrain,        setTerrain]        = useState<Terrain | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [occupied,       setOccupied]       = useState<Slot[]>([]);
  const [loadingSlots,   setLoadingSlots]   = useState(false);
  const [selectedDate,   setSelectedDate]   = useState(DAYS[0].date);
  const [selectedSlot,   setSelectedSlot]   = useState<string | null>(null);
  const [selectedDur,    setSelectedDur]    = useState(60);
  const [confirming,     setConfirming]     = useState(false);
  const [confirmed,      setConfirmed]      = useState(false);
  const [copied,         setCopied]         = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("terrains").select("*").eq("id", id).single();
      if (!data) { router.push("/fields"); return; }
      setTerrain(data as Terrain);
      setLoading(false);
    })();
  }, [id, router]);

  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    const { data } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("terrain_id", id)
      .eq("date", date)
      .neq("status", "cancelled");
    setOccupied((data ?? []) as Slot[]);
    setLoadingSlots(false);
  }, [id]);

  useEffect(() => {
    if (!loading) fetchSlots(selectedDate);
  }, [selectedDate, loading, fetchSlots]);

  function isSlotTaken(slot: string): boolean {
    const sm = toMins(slot);
    return occupied.some(b => {
      const start = toMins(b.start_time.slice(0, 5));
      const end   = toMins(b.end_time.slice(0, 5));
      return sm >= start && sm < end;
    });
  }

  function isRangeOk(startSlot: string, durMins: number): boolean {
    const startM = toMins(startSlot);
    const endM   = startM + durMins;
    if (endM > 22 * 60) return false;
    for (let t = startM; t < endM; t += 30) {
      const ts = `${Math.floor(t / 60).toString().padStart(2, "0")}:${(t % 60).toString().padStart(2, "0")}`;
      if (isSlotTaken(ts)) return false;
    }
    return true;
  }

  async function handleConfirm() {
    if (!selectedSlot || !terrain) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }

    setConfirming(true);
    const endTime = addMins(selectedSlot, selectedDur);
    const { error } = await supabase.from("bookings").insert({
      terrain_id: id,
      user_id:    session.user.id,
      date:       selectedDate,
      start_time: selectedSlot + ":00",
      end_time:   endTime + ":00",
      status:     "confirmed",
    });
    setConfirming(false);
    if (!error) {
      setConfirmed(true);
      setTimeout(() => router.push("/profile/reservations"), 1100);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openMaps() {
    if (!terrain) return;
    const q = terrain.lat && terrain.lng
      ? `${terrain.lat},${terrain.lng}`
      : encodeURIComponent(terrain.address);
    window.open(`https://maps.google.com/?q=${q}`, "_blank");
  }

  const sport      = terrain ? (SPORT_META[terrain.sport] ?? { emoji: "🏟️", label: terrain.sport, color: "#5B6478", soft: "#F1F3F7", gradient: "135deg, #5B6478, #3A4257" }) : null;
  const canConfirm = !!selectedSlot && !loadingSlots && isRangeOk(selectedSlot, selectedDur);
  const totalPrice = terrain
    ? terrain.price_hour === 0
      ? "Gratuit"
      : `${((terrain.price_hour * selectedDur) / 60).toFixed(0)}€`
    : "—";

  return (
    <div style={{
      minHeight: "100vh", background: "#F6F7FA",
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      paddingBottom: selectedSlot ? 180 : 100,
    }}>
      {/* Fixed top bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "46px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.back()} className="tap-scale flex items-center justify-center"
          style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(0,0,0,0.32)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer" }}>
          <ChevronLeft size={20} color="white" strokeWidth={2.5} />
        </button>
        <button onClick={handleShare} className="tap-scale flex items-center justify-center"
          style={{ width: 38, height: 38, borderRadius: 12, background: copied ? "rgba(46,196,182,0.55)" : "rgba(0,0,0,0.32)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer", transition: "background 0.2s" }}>
          {copied ? <Check size={17} color="#fff" strokeWidth={3} /> : <Share2 size={17} color="white" strokeWidth={2} />}
        </button>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: 290 }}>
        {loading ? (
          <div className="skeleton" style={{ width: "100%", height: "100%" }} />
        ) : sport && (
          <>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${sport.gradient})` }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.42) 100%)" }} />
            {/* Big decorative emoji */}
            <div style={{ position: "absolute", right: -8, top: 32, fontSize: 130, opacity: 0.13, transform: "rotate(10deg)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>
              {sport.emoji}
            </div>
            {/* Bottom content */}
            <div style={{ position: "absolute", bottom: 24, left: 20, right: 20 }}>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 9 }}>
                <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", color: "#fff", borderRadius: 999, padding: "3px 11px" }}>
                  {sport.emoji} {sport.label}
                </span>
                {terrain?.rating != null && terrain.rating > 0 && (
                  <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", color: "#fff", borderRadius: 999, padding: "3px 11px" }}>
                    <Star size={10} fill="#fff" color="#fff" strokeWidth={2} />
                    {terrain.rating.toFixed(1)}
                  </span>
                )}
                <span style={{ fontSize: 12, fontWeight: 800, background: terrain?.price_hour === 0 ? "#22C55E" : "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", color: "#fff", borderRadius: 999, padding: "3px 11px" }}>
                  {terrain?.price_hour === 0 ? "Gratuit" : `${terrain?.price_hour}€/h`}
                </span>
              </div>
              <h1 style={{ fontSize: 27, fontWeight: 900, color: "#fff", letterSpacing: -0.7, lineHeight: 1.1, textShadow: "0 2px 10px rgba(0,0,0,0.28)" }}>
                {terrain?.name}
              </h1>
              <div className="flex items-center gap-1" style={{ marginTop: 6 }}>
                <MapPin size={13} color="rgba(255,255,255,0.78)" strokeWidth={2.5} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>
                  {terrain?.district ?? terrain?.address}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info card — overlaps hero */}
      <div style={{ margin: "0 16px", transform: "translateY(-20px)" }}>
        <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #E5E8EE", padding: "18px 16px", boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)" }}>
          {loading ? (
            <>
              <div className="flex gap-2 flex-wrap" style={{ marginBottom: 14 }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ width: 85, height: 26, borderRadius: 999 }} />)}
              </div>
              <div className="skeleton" style={{ height: 38, borderRadius: 12 }} />
            </>
          ) : (
            <>
              {(terrain?.amenities ?? []).length > 0 && (
                <div className="flex gap-2 flex-wrap" style={{ marginBottom: 14 }}>
                  {(terrain?.amenities ?? []).map((a) => (
                    <span key={a} style={{ fontSize: 12, fontWeight: 600, color: "#5B6478", background: "#F1F3F7", borderRadius: 999, padding: "4px 10px" }}>
                      {AMENITY_LABELS[a] ?? a}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                  <MapPin size={14} color="#8A93A6" strokeWidth={2} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#5B6478", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {terrain?.address}
                  </span>
                </div>
                <button onClick={openMaps} className="tap-scale flex items-center gap-1"
                  style={{ flexShrink: 0, height: 34, borderRadius: 999, padding: "0 14px", background: "#1A2B4A", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                  <Navigation size={11} strokeWidth={2.5} />
                  Itinéraire
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Booking section */}
      <div style={{ padding: "4px 16px 0" }}>
        <p style={{ fontSize: 18, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.3, marginBottom: 16 }}>
          Réserver un créneau
        </p>

        {/* Date strip */}
        <div className="flex gap-2" style={{ overflowX: "scroll", scrollbarWidth: "none", paddingBottom: 4, marginBottom: 18 }}>
          {DAYS.map((d) => {
            const active = selectedDate === d.date;
            return (
              <button key={d.date}
                onClick={() => { setSelectedDate(d.date); setSelectedSlot(null); }}
                className="tap-scale flex flex-col items-center justify-center"
                style={{
                  flexShrink: 0, width: 52, height: 72, borderRadius: 16,
                  background: active ? "#1A2B4A" : "#fff",
                  cursor: "pointer", gap: 4,
                  border: active ? "none" : "1px solid #E5E8EE",
                  boxShadow: active ? "0 4px 14px -4px rgba(26,43,74,0.4)" : "none",
                  transition: "all 0.2s ease",
                  position: "relative", overflow: "hidden",
                }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: active ? "rgba(255,255,255,0.6)" : "#8A93A6", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {d.dayName}
                </span>
                <span style={{ fontSize: 20, fontWeight: 900, color: active ? "#fff" : "#1A2B4A", letterSpacing: -0.5 }}>
                  {d.dayNum}
                </span>
                {active && (
                  <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 20, height: 3, borderRadius: "3px 3px 0 0", background: "#FF6B35" }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Duration selector */}
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#5B6478" }}>Durée</span>
          <div className="flex items-center gap-2">
            {DURATIONS.map((dur) => {
              const active = selectedDur === dur.mins;
              return (
                <button key={dur.mins}
                  onClick={() => { setSelectedDur(dur.mins); setSelectedSlot(null); }}
                  className="tap-scale"
                  style={{
                    height: 34, padding: "0 16px", borderRadius: 999, border: "none",
                    background: active ? "#FF6B35" : "#F1F3F7",
                    color: active ? "#fff" : "#5B6478",
                    fontSize: 13, fontWeight: 800, cursor: "pointer",
                    boxShadow: active ? "0 4px 12px -4px rgba(255,107,53,0.5)" : "none",
                    transition: "all 0.2s ease",
                  }}>
                  {dur.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend + slots */}
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#5B6478" }}>
            {loadingSlots ? "Chargement…" : "Sélectionner un horaire"}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6" }}>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: "#F1F3F7" }} />
              Pris
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6" }}>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: "#fff", border: "1px solid #D5DAE3" }} />
              Libre
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 600, color: "#8A93A6" }}>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: "#1A2B4A" }} />
              Choisi
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {ALL_SLOTS.map((slot) => {
            const taken     = !loadingSlots && isSlotTaken(slot);
            const rangeOk   = !loadingSlots && !taken && isRangeOk(slot, selectedDur);
            const selected  = selectedSlot === slot;

            return (
              <button key={slot}
                disabled={taken || loadingSlots}
                onClick={() => setSelectedSlot(selected ? null : slot)}
                className={taken || loadingSlots ? "" : "tap-scale"}
                style={{
                  height: 42, borderRadius: 12,
                  background: selected ? "#1A2B4A" : taken ? "#F1F3F7" : rangeOk ? "#fff" : "#FFF8F6",
                  color:      selected ? "#fff"    : taken ? "#C4C9D4" : "#1A2B4A",
                  fontSize: 12, fontWeight: 700,
                  border: selected ? "none" : taken ? "none" : rangeOk ? "1.5px solid #E5E8EE" : "1.5px solid #FFD5C5",
                  cursor: taken ? "not-allowed" : "pointer",
                  boxShadow: selected ? "0 4px 14px -4px rgba(26,43,74,0.5)" : "none",
                  transition: "all 0.18s ease",
                  textDecoration: taken ? "line-through" : "none",
                  opacity: loadingSlots ? 0.4 : 1,
                }}>
                {slot.replace(":", "h")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky CTA — appears when slot selected */}
      {selectedSlot && (
        <div style={{
          position: "fixed", bottom: 72, left: 0, right: 0, zIndex: 50,
          padding: "14px 16px 12px",
          background: "rgba(246,247,250,0.97)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid #E5E8EE",
        }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6", marginBottom: 2 }}>Créneau sélectionné</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.3 }}>
                {selectedSlot.replace(":", "h")} → {addMins(selectedSlot, selectedDur).replace(":", "h")}
                <span style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginLeft: 6 }}>
                  · {DURATIONS.find(d => d.mins === selectedDur)?.label}
                </span>
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6", marginBottom: 2 }}>Total</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#1A2B4A", letterSpacing: -0.5 }}>{totalPrice}</p>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || confirming || confirmed}
            className="tap-scale"
            style={{
              width: "100%", height: 52, borderRadius: 16, border: "none",
              background: confirmed
                ? "linear-gradient(135deg, #22C55E, #16A34A)"
                : canConfirm
                ? "linear-gradient(135deg, #FF6B35, #E5551F)"
                : "#E5E8EE",
              color:  canConfirm || confirmed ? "#fff" : "#8A93A6",
              fontSize: 15, fontWeight: 800,
              cursor: canConfirm && !confirming && !confirmed ? "pointer" : "not-allowed",
              boxShadow: canConfirm && !confirmed ? "0 6px 20px -6px rgba(255,107,53,0.55)" : "none",
              transition: "all 0.22s ease",
              letterSpacing: -0.2,
            }}>
            {confirmed ? "✓ Réservation confirmée !" : confirming ? "Confirmation…" : canConfirm ? "Confirmer la réservation" : "Créneau non disponible"}
          </button>
        </div>
      )}
    </div>
  );
}
