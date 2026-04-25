"use client";

import { useState, useEffect } from "react";
import { Search, Star, MapPin, Clock, Navigation } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Terrain } from "@/lib/supabase";

// ── Sport metadata (UI) ──────────────────────────────────────
const SPORT_META: Record<string, { emoji: string; color: string; soft: string }> = {
  basket:  { emoji: "🏀", color: "#FF6B35", soft: "#FFE6DA" },
  foot:    { emoji: "⚽", color: "#2EC4B6", soft: "#D6F4F1" },
  tennis:  { emoji: "🎾", color: "#F4B43A", soft: "#FEF3C7" },
  running: { emoji: "🏃", color: "#7B61FF", soft: "#EDE9FE" },
  volley:  { emoji: "🏐", color: "#EC4899", soft: "#FCE7F3" },
  padel:   { emoji: "🏓", color: "#3B82F6", soft: "#DBEAFE" },
  velo:    { emoji: "🚴", color: "#06B6D4", soft: "#CFFAFE" },
  yoga:    { emoji: "🧘", color: "#14B8A6", soft: "#CCFBF1" },
};

// Amenity DB keys → French labels
const AMENITY_LABELS: Record<string, string> = {
  lighting:         "💡 Éclairage",
  showers:          "🚿 Douches",
  changing_rooms:   "🏠 Vestiaires",
  pro_shop:         "🏪 Pro Shop",
  equipment_rental: "🎾 Location équipement",
  parking:          "🅿️ Parking",
  cafe:             "☕ Café",
};

// Deterministic map positions based on index
const MAP_POSITIONS = [
  { x: "30%", y: "35%" }, { x: "34%", y: "38%" }, { x: "48%", y: "60%" },
  { x: "68%", y: "72%" }, { x: "22%", y: "75%" }, { x: "14%", y: "62%" },
  { x: "55%", y: "28%" }, { x: "72%", y: "42%" }, { x: "40%", y: "80%" },
];

const SPORT_FILTERS = [
  { id: "all",     label: "Tous",    emoji: "" },
  { id: "basket",  label: "Basket",  emoji: "🏀" },
  { id: "foot",    label: "Foot",    emoji: "⚽" },
  { id: "tennis",  label: "Tennis",  emoji: "🎾" },
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "volley",  label: "Volley",  emoji: "🏐" },
  { id: "padel",   label: "Padel",   emoji: "🏓" },
];

type UITerrain = Terrain & {
  emoji: string;
  sportColor: string;
  sportSoft: string;
  mapX: string;
  mapY: string;
  amenityLabels: string[];
};

function enrichTerrain(t: Terrain, idx: number): UITerrain {
  const meta = SPORT_META[t.sport] ?? { emoji: "🏟️", color: "#8A93A6", soft: "#F1F3F7" };
  const pos = MAP_POSITIONS[idx % MAP_POSITIONS.length];
  return {
    ...t,
    emoji: meta.emoji,
    sportColor: meta.color,
    sportSoft: meta.soft,
    mapX: pos.x,
    mapY: pos.y,
    amenityLabels: (t.amenities ?? []).map((a) => AMENITY_LABELS[a] ?? a),
  };
}

export default function FieldsPage() {
  const [terrains, setTerrains] = useState<UITerrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSport, setActiveSport] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reserving, setReserving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("terrains")
        .select("*")
        .order("name");
      setTerrains((data ?? []).map((t, i) => enrichTerrain(t as Terrain, i)));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = terrains.filter((t) => {
    const matchSport = activeSport === "all" || t.sport === activeSport;
    const matchQ = !query
      || t.name.toLowerCase().includes(query.toLowerCase())
      || (t.district ?? "").toLowerCase().includes(query.toLowerCase());
    return matchSport && matchQ;
  });

  function handleReserve(id: string) {
    setReserving(id);
    setTimeout(() => setReserving(null), 1800);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F7FA",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        paddingBottom: 96,
      }}
    >
      {/* Sticky header */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "#fff", borderBottom: "1px solid #E5E8EE",
          padding: "48px 16px 12px",
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4 }}>
            Terrains
          </p>
          <div className="flex items-center gap-1"
            style={{ fontSize: 12, fontWeight: 700, color: "#2EC4B6", background: "#D6F4F1", borderRadius: 999, padding: "4px 10px" }}>
            <Navigation size={11} strokeWidth={2.5} />
            Paris
          </div>
        </div>

        <div
          className="flex items-center gap-2"
          style={{ height: 44, borderRadius: 999, background: "#F1F3F7", padding: "0 14px" }}
        >
          <Search size={16} color="#8A93A6" strokeWidth={2} />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un terrain ou quartier..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A93A6", fontSize: 16 }}>×</button>
          )}
        </div>
      </div>

      {/* Sport chips */}
      <div className="flex items-center" style={{ gap: 8, padding: "12px 16px", overflowX: "scroll", scrollbarWidth: "none" }}>
        {SPORT_FILTERS.map((s) => {
          const active = activeSport === s.id;
          return (
            <button key={s.id} onClick={() => setActiveSport(s.id)} className="tap-scale"
              style={{
                height: 34, borderRadius: 999, padding: "0 14px",
                fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                border: active ? "none" : "1px solid #E5E8EE",
                background: active ? "#1A2B4A" : "#fff",
                color: active ? "#fff" : "#1A2B4A",
                transition: "all 0.18s ease",
              }}
            >
              {s.emoji ? `${s.emoji} ${s.label}` : s.label}
            </button>
          );
        })}
      </div>

      {/* Mini map */}
      <div style={{ margin: "0 16px 16px" }}>
        <div className="relative overflow-hidden"
          style={{ borderRadius: 20, height: 180, background: "linear-gradient(135deg, #e8f4fd, #d6eef8)", border: "1px solid #E5E8EE" }}>
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.22 }}>
            {[20, 40, 60, 80].map((y) => <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#5B6478" strokeWidth="1" />)}
            {[15, 30, 45, 60, 75, 90].map((x) => <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#5B6478" strokeWidth="1" />)}
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#5B6478" strokeWidth="2" />
            <line x1="42%" y1="0" x2="42%" y2="100%" stroke="#5B6478" strokeWidth="2" />
            <line x1="0" y1="28%" x2="60%" y2="65%" stroke="#5B6478" strokeWidth="1.5" />
            <line x1="35%" y1="0" x2="80%" y2="80%" stroke="#5B6478" strokeWidth="1.5" />
          </svg>

          {filtered.map((t) => (
            <button key={t.id} onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
              style={{ position: "absolute", left: t.mapX, top: t.mapY, transform: "translate(-50%,-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: `${t.sportColor}28` }} />
                <div style={{
                  width: selectedId === t.id ? 36 : 28, height: selectedId === t.id ? 36 : 28,
                  borderRadius: "50%", background: t.sportColor,
                  border: "2.5px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: selectedId === t.id ? 16 : 13,
                  transition: "all 0.2s ease", position: "relative", zIndex: 2,
                }}>
                  {t.emoji}
                </div>
              </div>
            </button>
          ))}

          {/* User dot */}
          <div style={{ position: "absolute", left: "50%", top: "52%", transform: "translate(-50%,-50%)" }}>
            <div style={{ position: "relative", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(59,130,246,0.3)", animation: "pulse-ring 1.5s ease-out infinite" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3B82F6", border: "2px solid #fff", position: "relative", zIndex: 2 }} />
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(26,43,74,0.85)", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, color: "#fff", backdropFilter: "blur(4px)" }}>
            {filtered.length} terrain{filtered.length !== 1 ? "s" : ""} proches
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: "0 16px" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#8A93A6", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
          {loading ? "Chargement…" : `${filtered.length} résultat${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {loading ? (
          <div className="flex flex-col" style={{ gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 18 }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 18, padding: "40px 20px", border: "1px solid #E5E8EE", textAlign: "center", color: "#8A93A6", fontSize: 14, fontWeight: 600 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🏟️</div>
                Aucun terrain trouvé
              </div>
            ) : (
              filtered.map((terrain) => {
                const isSelected = selectedId === terrain.id;
                const isReserving = reserving === terrain.id;
                return (
                  <div key={terrain.id} onClick={() => setSelectedId(isSelected ? null : terrain.id)}
                    style={{
                      background: "#fff", borderRadius: 18,
                      border: isSelected ? `2px solid ${terrain.sportColor}` : "1px solid #E5E8EE",
                      padding: "16px",
                      boxShadow: isSelected ? `0 4px 20px -8px ${terrain.sportColor}66` : "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.14)",
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: terrain.sportSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                        {terrain.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-start justify-between gap-2">
                          <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2, lineHeight: 1.2 }}>
                            {terrain.name}
                          </p>
                          <span style={{
                            fontSize: 11, fontWeight: 800, flexShrink: 0,
                            background: terrain.price_hour === 0 ? "#D1FAE5" : "#FFE6DA",
                            color: terrain.price_hour === 0 ? "#16A34A" : "#FF6B35",
                            borderRadius: 999, padding: "3px 9px",
                          }}>
                            {terrain.price_hour === 0 ? "Gratuit" : `${terrain.price_hour}€/h`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 5 }}>
                          <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                            <MapPin size={11} strokeWidth={2.5} />
                            {terrain.district ?? terrain.address}
                          </span>
                          {terrain.rating > 0 && (
                            <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                              <Star size={11} strokeWidth={2} fill="#F4B43A" color="#F4B43A" />
                              {terrain.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #F1F3F7" }}>
                        {terrain.amenityLabels.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 12 }}>
                            {terrain.amenityLabels.map((a) => (
                              <span key={a} style={{ fontSize: 12, fontWeight: 600, color: "#5B6478", background: "#F1F3F7", borderRadius: 999, padding: "3px 10px" }}>{a}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2"
                          style={{ background: "#D6F4F1", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
                          <Clock size={14} color="#1FA89B" strokeWidth={2.5} />
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#1FA89B", textTransform: "uppercase", letterSpacing: 0.5 }}>Disponible</span>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A", marginTop: 1 }}>Réserver un créneau</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReserve(terrain.id); }}
                          disabled={isReserving}
                          className="tap-scale"
                          style={{
                            width: "100%", height: 44, borderRadius: 12, border: "none",
                            cursor: "pointer", fontSize: 14, fontWeight: 800,
                            background: isReserving ? "#D6F4F1" : `linear-gradient(135deg, ${terrain.sportColor}, ${terrain.sportColor}CC)`,
                            color: isReserving ? "#1FA89B" : "#fff",
                            boxShadow: !isReserving ? `0 4px 14px -4px ${terrain.sportColor}66` : "none",
                            transition: "all 0.2s ease", letterSpacing: -0.2,
                          }}
                        >
                          {isReserving ? "✓ Réservé !" : "Réserver ce terrain"}
                        </button>
                      </div>
                    )}

                    {!isSelected && (
                      <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
                        <div className="flex items-center gap-1">
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#22C55E" }}>Disponible</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>Voir détails →</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
