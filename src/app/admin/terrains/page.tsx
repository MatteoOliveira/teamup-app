"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Terrain } from "@/lib/supabase";
import { Search, Plus, Trash2, Star, MapPin } from "lucide-react";

const SPORT_EMOJI: Record<string, string> = {
  basket: "🏀", foot: "⚽", tennis: "🎾", running: "🏃",
  volley: "🏐", padel: "🏓", velo: "🚴", yoga: "🧘",
};

const SPORT_COLOR: Record<string, string> = {
  basket: "#FF6B35", foot: "#2EC4B6", tennis: "#F4B43A",
  running: "#7B61FF", volley: "#EC4899", padel: "#3B82F6",
};

type FormState = { name: string; sport: string; address: string; district: string; price_hour: string };
const EMPTY_FORM: FormState = { name: "", sport: "basket", address: "", district: "", price_hour: "0" };

export default function AdminTerrainsPage() {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadTerrains() {
    const { data } = await supabase.from("terrains").select("*").order("name");
    setTerrains(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadTerrains(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("terrains").insert({
      name: form.name,
      sport: form.sport,
      address: form.address,
      district: form.district || null,
      price_hour: parseFloat(form.price_hour) || 0,
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    await loadTerrains();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce terrain ?")) return;
    setDeletingId(id);
    await supabase.from("terrains").delete().eq("id", id);
    setTerrains((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
  }

  const filtered = terrains.filter((t) =>
    !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.district?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.4 }}>Terrains</h1>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 2 }}>{terrains.length} terrain{terrains.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 tap-scale"
          style={{
            height: 36, borderRadius: 999, padding: "0 16px",
            background: "#FF6B35", color: "#fff", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 700,
            boxShadow: "0 4px 12px rgba(255,107,53,0.35)",
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Ajouter
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: "#fff", borderRadius: 16, border: "1px solid #E5E8EE",
            padding: 20, marginBottom: 20,
            boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)",
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", marginBottom: 14 }}>Nouveau terrain</p>
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[
              { key: "name", label: "Nom", placeholder: "Buttes Chaumont – Terrain A" },
              { key: "address", label: "Adresse", placeholder: "1 Rue Botzaris, Paris" },
              { key: "district", label: "Quartier", placeholder: "Paris 19e" },
              { key: "price_hour", label: "Prix/h (€)", placeholder: "0" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#5B6478", display: "block", marginBottom: 4 }}>{label}</label>
                <input
                  type={key === "price_hour" ? "number" : "text"}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required={key !== "district"}
                  style={{
                    width: "100%", height: 40, borderRadius: 10,
                    border: "1.5px solid #E5E8EE", padding: "0 12px",
                    fontSize: 14, fontWeight: 600, color: "#1A2B4A",
                    fontFamily: "inherit", outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#5B6478", display: "block", marginBottom: 4 }}>Sport</label>
              <select
                value={form.sport}
                onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value }))}
                style={{
                  width: "100%", height: 40, borderRadius: 10,
                  border: "1.5px solid #E5E8EE", padding: "0 12px",
                  fontSize: 14, fontWeight: 600, color: "#1A2B4A",
                  fontFamily: "inherit", outline: "none", background: "#fff",
                }}
              >
                {Object.keys(SPORT_EMOJI).map((s) => (
                  <option key={s} value={s}>{SPORT_EMOJI[s]} {s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3" style={{ marginTop: 16 }}>
            <button type="submit" disabled={saving}
              style={{
                height: 36, borderRadius: 999, padding: "0 20px",
                background: "#FF6B35", color: "#fff", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Enregistrement…" : "Créer le terrain"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ height: 36, borderRadius: 999, padding: "0 20px", background: "#F1F3F7", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#5B6478" }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div
        className="flex items-center gap-2"
        style={{ height: 40, borderRadius: 999, background: "#fff", border: "1px solid #E5E8EE", padding: "0 14px", marginBottom: 16, maxWidth: 340 }}
      >
        <Search size={15} color="#8A93A6" strokeWidth={2} />
        <input
          type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un terrain…"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit" }}
        />
      </div>

      <div
        style={{
          background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", overflow: "hidden",
          boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.12)",
        }}
      >
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "#8A93A6", fontSize: 14, fontWeight: 600 }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#8A93A6", fontSize: 14, fontWeight: 600 }}>Aucun terrain</div>
        ) : (
          filtered.map((terrain, idx) => {
            const color = SPORT_COLOR[terrain.sport] ?? "#8A93A6";
            const emoji = SPORT_EMOJI[terrain.sport] ?? "🏟️";
            return (
              <div
                key={terrain.id}
                className="flex items-center gap-3"
                style={{ padding: "14px 18px", borderBottom: idx < filtered.length - 1 ? "1px solid #F1F3F7" : "none" }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: `${color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>{terrain.name}</p>
                  <div className="flex items-center gap-3" style={{ marginTop: 3 }}>
                    <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                      <MapPin size={11} strokeWidth={2.5} />
                      {terrain.district ?? terrain.address}
                    </span>
                    {terrain.rating > 0 && (
                      <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>
                        <Star size={11} strokeWidth={2.5} fill="#F4B43A" color="#F4B43A" />
                        {terrain.rating.toFixed(1)}
                      </span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, color: terrain.price_hour === 0 ? "#22C55E" : "#FF6B35" }}>
                      {terrain.price_hour === 0 ? "Gratuit" : `${terrain.price_hour}€/h`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(terrain.id)}
                  disabled={deletingId === terrain.id}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "#FEE2E2", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, opacity: deletingId === terrain.id ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={14} color="#EF4444" strokeWidth={2.5} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
