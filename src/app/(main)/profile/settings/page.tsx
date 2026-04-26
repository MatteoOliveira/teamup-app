"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, AtSign, FileText, User, Bell, Lock, Trash2, KeyRound, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";

/* ─── Constants ───────────────────────────────────────────── */

const SPORT_META: Record<string, { emoji: string; label: string; color: string }> = {
  basket:  { emoji: "🏀", label: "Basket",  color: "#FF6B35" },
  foot:    { emoji: "⚽", label: "Foot",    color: "#2EC4B6" },
  tennis:  { emoji: "🎾", label: "Tennis",  color: "#F4B43A" },
  padel:   { emoji: "🏓", label: "Padel",   color: "#3B82F6" },
  running: { emoji: "🏃", label: "Running", color: "#7B61FF" },
  volley:  { emoji: "🏐", label: "Volley",  color: "#EC4899" },
  yoga:    { emoji: "🧘", label: "Yoga",    color: "#14B8A6" },
  velo:    { emoji: "🚴", label: "Vélo",    color: "#06B6D4" },
};

const SPORTS = Object.entries(SPORT_META).map(([id, m]) => ({ id, ...m }));

const LEVELS = [
  { id: "beginner",     label: "Débutant",      color: "#22C55E" },
  { id: "intermediate", label: "Intermédiaire",  color: "#F4B43A" },
  { id: "advanced",     label: "Confirmé",       color: "#EF4444" },
  { id: "expert",       label: "Expert",         color: "#7B61FF" },
];

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

/* ─── Toggle switch ───────────────────────────────────────── */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 999, border: "none", cursor: "pointer",
        background: value ? "#FF6B35" : "#D5DAE3",
        position: "relative", flexShrink: 0, transition: "background 0.22s ease",
        padding: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: value ? 23 : 3,
        width: 22, height: 22, borderRadius: "50%",
        background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
        transition: "left 0.22s ease",
      }} />
    </button>
  );
}

/* ─── Section header ──────────────────────────────────────── */
function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: "#1A2B4A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <span style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.3 }}>{label}</span>
    </div>
  );
}

/* ─── Field input ─────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#8A93A6", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", height: 48, borderRadius: 12,
  border: "1.5px solid #E5E8EE", background: "#F6F7FA",
  padding: "0 14px", fontSize: 14, fontWeight: 600, color: "#1A2B4A",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  transition: "border-color 0.15s, background 0.15s",
};

/* ─── Main page ───────────────────────────────────────────── */
export default function SettingsPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  /* editable fields */
  const [fullName, setFullName]   = useState("");
  const [username, setUsername]   = useState("");
  const [bio, setBio]             = useState("");
  const [location, setLocation]   = useState("");
  const [sports, setSports]       = useState<string[]>([]);
  const [level, setLevel]         = useState("beginner");

  /* notification prefs */
  const [notifEvents,   setNotifEvents]   = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifTeam,     setNotifTeam]     = useState(false);

  /* privacy prefs */
  const [isPrivate,    setIsPrivate]    = useState(false);
  const [showSports,   setShowSports]   = useState(true);
  const [showLocation, setShowLocation] = useState(false);

  /* access list */
  type AccessEntry = { id: string; viewer_id: string; granted_at: string; viewer: { id: string; full_name: string | null; username: string | null } | null };
  const [accessList, setAccessList] = useState<AccessEntry[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const profileId = profile?.id;

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) {
        setProfile(data as Profile);
        setFullName(data.full_name ?? "");
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setLocation(data.location ?? "");
        setSports(data.sports ?? []);
        setLevel(data.level ?? "beginner");
        setIsPrivate(data.is_private ?? false);
        if (data.is_private) loadAccessList(session.user.id);
        setNotifEvents(data.notif_events ?? true);
        setNotifMessages(data.notif_messages ?? true);
        setNotifReminder(data.notif_reminder ?? true);
        setNotifTeam(data.notif_team ?? false);
        setShowSports(data.show_sports ?? true);
        setShowLocation(data.show_location ?? false);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function autoSave(field: string, value: boolean) {
    if (!profileId) return;
    await supabase.from("profiles").update({ [field]: value }).eq("id", profileId);
  }

  async function loadAccessList(pid: string) {
    const { data } = await supabase
      .from("profile_access")
      .select("id, viewer_id, granted_at, viewer:profiles!viewer_id(id, full_name, username)")
      .eq("profile_id", pid)
      .order("granted_at", { ascending: false });
    setAccessList((data ?? []) as unknown as AccessEntry[]);
  }

  async function handleRevokeAccess(entry: AccessEntry) {
    if (revokingId) return;
    setRevokingId(entry.id);
    await supabase.from("profile_access").delete().eq("id", entry.id);
    setAccessList((prev) => prev.filter((e) => e.id !== entry.id));
    setRevokingId(null);
  }

  function handleToggle(
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    field: string,
    current: boolean,
  ) {
    const next = !current;
    setter(next);
    autoSave(field, next);
    if (field === "is_private" && next && profileId) {
      loadAccessList(profileId);
    }
  }

  function toggleSport(id: string) {
    setSports((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  async function handleSave() {
    if (!profile || saving) return;
    setSaving(true);
    await supabase.from("profiles").update({
      full_name: fullName,
      username: username || null,
      bio: bio || null,
      location: location || null,
      sports,
      level,
    }).eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ background: "#F6F7FA", minHeight: "100vh", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E8EE", padding: "52px 16px 12px" }}>
          <div className="skeleton" style={{ width: 100, height: 20, borderRadius: 8 }} />
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {[120, 80, 80, 60].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  const initials = getInitials(fullName || profile?.full_name);

  return (
    <div style={{ background: "#F6F7FA", minHeight: "100vh", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', paddingBottom: 80 }}>
      <style>{`
        textarea { resize: none; }
        input:focus, textarea:focus { border-color: #FF6B35 !important; background: #fff !important; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
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
              Paramètres
            </span>
            {saved && (
              <div className="flex items-center gap-1" style={{ background: "#D1FAE5", borderRadius: 999, padding: "4px 12px", animation: "slideDown 0.2s ease" }}>
                <Check size={13} color="#16A34A" strokeWidth={3} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A" }}>Enregistré</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ══ MON PROFIL ══ */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", padding: 16, boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.1)" }}>
          <SectionTitle icon={<User size={15} color="#fff" strokeWidth={2.5} />} label="Mon profil" />

          {/* Avatar row */}
          <div className="flex items-center gap-12" style={{ marginBottom: 20, padding: "4px 0" }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full text-white font-extrabold"
                style={{ width: 56, height: 56, background: "linear-gradient(135deg, #FF6B35, #E5551F)", fontSize: 18, letterSpacing: -0.5, flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#1A2B4A", letterSpacing: -0.2 }}>{fullName || "—"}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>@{username || "username"}</p>
              </div>
            </div>
            <button onClick={() => setEditing(!editing)} className="tap-scale"
              style={{ marginLeft: "auto", height: 32, borderRadius: 999, padding: "0 16px", border: "none", background: editing ? "#F1F3F7" : "#1A2B4A", color: editing ? "#1A2B4A" : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
              {editing ? "Annuler" : "Modifier"}
            </button>
          </div>

          {/* Editable fields */}
          <Field label="Nom complet">
            <input value={fullName} onChange={e => setFullName(e.target.value)} disabled={!editing}
              placeholder="Jean Dupont" style={{ ...inputStyle, opacity: editing ? 1 : 0.7 }} />
          </Field>

          <Field label="Nom d'utilisateur">
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <AtSign size={15} color="#8A93A6" strokeWidth={2} />
              </div>
              <input value={username} onChange={e => setUsername(e.target.value)} disabled={!editing}
                placeholder="jean_dupont" style={{ ...inputStyle, paddingLeft: 34, opacity: editing ? 1 : 0.7 }} />
            </div>
          </Field>

          <Field label="Bio">
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 12, top: 12 }}>
                <FileText size={15} color="#8A93A6" strokeWidth={2} />
              </div>
              <textarea value={bio} onChange={e => setBio(e.target.value)} disabled={!editing}
                placeholder="Passionné de basket et de running..."
                rows={3}
                style={{ ...inputStyle, height: "auto", paddingLeft: 34, paddingTop: 12, paddingBottom: 12, lineHeight: 1.5, opacity: editing ? 1 : 0.7 } as React.CSSProperties} />
            </div>
          </Field>

          <Field label="Localisation">
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <MapPin size={15} color="#8A93A6" strokeWidth={2} />
              </div>
              <input value={location} onChange={e => setLocation(e.target.value)} disabled={!editing}
                placeholder="Paris, France" style={{ ...inputStyle, paddingLeft: 34, opacity: editing ? 1 : 0.7 }} />
            </div>
          </Field>

          {/* Sports */}
          <Field label="Sports favoris">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {SPORTS.map(sport => {
                const active = sports.includes(sport.id);
                return (
                  <button key={sport.id} onClick={() => editing && toggleSport(sport.id)}
                    className="tap-scale flex flex-col items-center justify-center gap-1"
                    style={{
                      height: 68, borderRadius: 12, border: active ? "none" : "1.5px solid #E5E8EE",
                      background: active ? sport.color : "#F6F7FA",
                      boxShadow: active ? `0 4px 12px ${sport.color}44` : "none",
                      cursor: editing ? "pointer" : "default",
                      transition: "all 0.15s ease", opacity: editing ? 1 : 0.8,
                    }}>
                    <span style={{ fontSize: 22 }}>{sport.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: active ? "#fff" : "#5B6478" }}>{sport.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Level */}
          <Field label="Niveau général">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {LEVELS.map(lvl => {
                const active = level === lvl.id;
                return (
                  <button key={lvl.id} onClick={() => editing && setLevel(lvl.id)}
                    className="tap-scale flex items-center justify-center"
                    style={{
                      height: 38, borderRadius: 10, border: "none",
                      background: active ? lvl.color : "#F1F3F7",
                      cursor: editing ? "pointer" : "default",
                      transition: "all 0.15s ease", opacity: editing ? 1 : 0.8,
                    }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : "#5B6478", textAlign: "center", lineHeight: 1.2 }}>
                      {lvl.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Save button */}
          {editing && (
            <button onClick={handleSave} disabled={saving} className="tap-scale w-full"
              style={{
                width: "100%", height: 50, borderRadius: 14, border: "none", marginTop: 4,
                background: saving ? "#F1F3F7" : "linear-gradient(135deg, #FF6B35, #E5551F)",
                color: saving ? "#8A93A6" : "#fff", fontSize: 15, fontWeight: 800,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving ? "none" : "0 6px 18px -6px rgba(255,107,53,0.55)",
                letterSpacing: -0.2, transition: "all 0.2s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              {saving ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          )}
        </div>

        {/* ══ NOTIFICATIONS ══ */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", padding: 16, boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.1)" }}>
          <SectionTitle icon={<Bell size={15} color="#fff" strokeWidth={2.5} />} label="Notifications" />

          {[
            { label: "Nouveaux événements près de toi", sub: "Alertes quotidiennes",                    value: notifEvents,   setter: setNotifEvents,   field: "notif_events"   },
            { label: "Messages d'équipe",               sub: "Nouveaux messages dans tes chats",        value: notifMessages, setter: setNotifMessages, field: "notif_messages" },
            { label: "Rappel avant événement",          sub: "1h avant le début",                       value: notifReminder, setter: setNotifReminder, field: "notif_reminder" },
            { label: "Demandes d'équipe",               sub: "Quelqu'un veut rejoindre ton équipe",     value: notifTeam,     setter: setNotifTeam,     field: "notif_team"     },
          ].map((item, i, arr) => (
            <div key={i} className="flex items-center justify-between"
              style={{ paddingBottom: i < arr.length - 1 ? 14 : 0, marginBottom: i < arr.length - 1 ? 14 : 0, borderBottom: i < arr.length - 1 ? "1px solid #F1F3F7" : "none" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>{item.label}</p>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#8A93A6", marginTop: 2 }}>{item.sub}</p>
              </div>
              <Toggle value={item.value} onChange={() => handleToggle(item.setter, item.field, item.value)} />
            </div>
          ))}
        </div>

        {/* ══ CONFIDENTIALITÉ ══ */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", padding: 16, boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.1)" }}>
          <SectionTitle icon={<Lock size={15} color="#fff" strokeWidth={2.5} />} label="Confidentialité" />

          {[
            { label: "Profil privé",            sub: "Cache tes stats et événements aux autres",  value: isPrivate,    setter: setIsPrivate,    field: "is_private"    },
            { label: "Afficher mes sports",     sub: "Dans la recherche et ton profil",            value: showSports,   setter: setShowSports,   field: "show_sports"   },
            { label: "Afficher ma localisation",sub: "Ville affichée sur ton profil",              value: showLocation, setter: setShowLocation, field: "show_location" },
          ].map((item, i, arr) => (
            <div key={i} className="flex items-center justify-between"
              style={{ paddingBottom: i < arr.length - 1 ? 14 : 0, marginBottom: i < arr.length - 1 ? 14 : 0, borderBottom: i < arr.length - 1 ? "1px solid #F1F3F7" : "none" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>{item.label}</p>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#8A93A6", marginTop: 2 }}>{item.sub}</p>
              </div>
              <Toggle value={item.value} onChange={() => handleToggle(item.setter, item.field, item.value)} />
            </div>
          ))}
        </div>

        {/* ══ ACCÈS AUTORISÉS (visible seulement si profil privé) ══ */}
        {isPrivate && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", padding: 16, boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.1)" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#7B61FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14 }}>👥</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#1A2B4A" }}>Accès autorisés</p>
              </div>
              {accessList.length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, background: "#EDE9FE", color: "#7B61FF", borderRadius: 999, padding: "3px 9px" }}>
                  {accessList.length}
                </span>
              )}
            </div>

            {accessList.length === 0 ? (
              <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", textAlign: "center", padding: "12px 0" }}>
                Personne n'a accès à ton profil privé.
              </p>
            ) : (
              <div className="flex flex-col" style={{ gap: 0 }}>
                {accessList.map((entry, i) => {
                  const name = entry.viewer?.full_name ?? entry.viewer?.username ?? "Utilisateur";
                  const initials = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <div key={entry.id} className="flex items-center gap-3"
                      style={{ padding: "10px 0", borderBottom: i < accessList.length - 1 ? "1px solid #F1F3F7" : "none" }}>
                      <div className="flex items-center justify-center flex-shrink-0"
                        style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg, #7B61FF, #5B41DF)", fontSize: 13, fontWeight: 800, color: "#fff" }}>
                        {initials}
                      </div>
                      <p style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#1A2B4A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </p>
                      <button
                        onClick={() => handleRevokeAccess(entry)}
                        disabled={revokingId === entry.id}
                        className="tap-scale"
                        style={{ height: 28, borderRadius: 999, padding: "0 12px", fontSize: 11, fontWeight: 700, border: "1.5px solid #FFD5CC", background: "#FFF5F3", color: "#FF6B35", cursor: "pointer", flexShrink: 0, opacity: revokingId === entry.id ? 0.5 : 1 }}>
                        {revokingId === entry.id ? "…" : "Retirer"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ COMPTE ══ */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E8EE", padding: 16, boxShadow: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.1)" }}>
          <SectionTitle icon={<KeyRound size={15} color="#fff" strokeWidth={2.5} />} label="Compte" />

          {/* Change password — disabled */}
          <div className="flex items-center justify-between"
            style={{ paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #F1F3F7" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B4A" }}>Changer de mot de passe</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#8A93A6", marginTop: 2 }}>Disponible prochainement</p>
            </div>
            <div style={{ background: "#F1F3F7", borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#8A93A6" }}>
              Bientôt
            </div>
          </div>

          {/* Delete account */}
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#EF4444" }}>Supprimer mon compte</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#8A93A6", marginTop: 2 }}>Action irréversible</p>
            </div>
            <button
              onClick={() => {
                const ok = window.confirm("Supprimer définitivement ton compte ? Cette action est irréversible.");
                if (ok) alert("Pour supprimer ton compte, contacte le support : support@teamup.app");
              }}
              className="tap-scale flex items-center justify-center"
              style={{ width: 36, height: 36, borderRadius: 10, background: "#FEE2E2", border: "none", cursor: "pointer" }}>
              <Trash2 size={16} color="#EF4444" strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
