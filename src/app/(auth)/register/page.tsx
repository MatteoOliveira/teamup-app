"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { signInWithGoogle, supabase } from "@/lib/supabase";

const SPORTS = [
  { id: "basket", label: "Basket", emoji: "🏀" },
  { id: "foot", label: "Foot", emoji: "⚽" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "volley", label: "Volley", emoji: "🏐" },
  { id: "padel", label: "Padel", emoji: "🏓" },
  { id: "velo", label: "Vélo", emoji: "🚴" },
  { id: "yoga", label: "Yoga", emoji: "🧘" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSport(id: string) {
    setSelectedSports((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data.session && selectedSports.length > 0) {
        await supabase
          .from("profiles")
          .update({ sports: selectedSports })
          .eq("id", data.session.user.id);
      }
      window.location.href = "/home";
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await signInWithGoogle();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #1A2B4A 0%, #243757 55%, #2EC4B6 150%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px 20px",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <div style={{ position: "fixed", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(46,196,182,0.12)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,107,53,0.1)", pointerEvents: "none" }} />

      {/* Logo */}
      <div className="flex flex-col items-center" style={{ marginBottom: 36 }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: 20,
            background: "linear-gradient(135deg, #FF6B35, #E5551F)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, boxShadow: "0 8px 28px rgba(255,107,53,0.4)",
            marginBottom: 14,
          }}
        >
          🏟️
        </div>
        <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: -0.5, lineHeight: 1 }}>TeamUp!</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
          {step === 1 ? "Crée ton compte" : "Tes sports préférés"}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
        {[1, 2].map((s) => (
          <div key={s} style={{ width: s === step ? 24 : 8, height: 8, borderRadius: 999, background: s === step ? "#FF6B35" : "rgba(255,255,255,0.3)", transition: "all 0.3s ease" }} />
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%", maxWidth: 380,
          background: "#fff", borderRadius: 24,
          padding: "28px 24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
        }}
      >
        {step === 1 ? (
          <>
            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full tap-scale"
              style={{
                height: 48, borderRadius: 14,
                background: "#F1F3F7", border: "1.5px solid #E5E8EE",
                fontSize: 14, fontWeight: 700, color: "#1A2B4A",
                cursor: "pointer", marginBottom: 20, width: "100%",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>

            <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#E5E8EE" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#8A93A6" }}>ou</span>
              <div style={{ flex: 1, height: 1, background: "#E5E8EE" }} />
            </div>

            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A", display: "block", marginBottom: 6 }}>Prénom & Nom</label>
                <div className="flex items-center gap-2"
                  style={{ height: 48, borderRadius: 12, border: "1.5px solid #E5E8EE", padding: "0 14px" }}>
                  <User size={16} color="#8A93A6" strokeWidth={2} />
                  <input
                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Dupont" required
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A", display: "block", marginBottom: 6 }}>Email</label>
                <div className="flex items-center gap-2"
                  style={{ height: 48, borderRadius: 12, border: "1.5px solid #E5E8EE", padding: "0 14px" }}>
                  <Mail size={16} color="#8A93A6" strokeWidth={2} />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com" required
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A", display: "block", marginBottom: 6 }}>Mot de passe</label>
                <div className="flex items-center gap-2"
                  style={{ height: 48, borderRadius: 12, border: "1.5px solid #E5E8EE", padding: "0 14px" }}>
                  <Lock size={16} color="#8A93A6" strokeWidth={2} />
                  <input
                    type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 caractères" required minLength={8}
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#1A2B4A", fontFamily: "inherit", background: "transparent" }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                    {showPwd ? <EyeOff size={16} color="#8A93A6" /> : <Eye size={16} color="#8A93A6" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!fullName || !email || !password}
                className="w-full tap-scale"
                style={{
                  width: "100%", height: 48, borderRadius: 14,
                  background: fullName && email && password ? "linear-gradient(135deg, #FF6B35, #E5551F)" : "#F1F3F7",
                  color: fullName && email && password ? "#fff" : "#8A93A6",
                  border: "none", cursor: "pointer",
                  fontSize: 15, fontWeight: 800, letterSpacing: -0.2,
                  boxShadow: fullName && email && password ? "0 6px 18px rgba(255,107,53,0.35)" : "none",
                  transition: "all 0.18s ease",
                }}
              >
                Continuer →
              </button>
            </form>
          </>
        ) : (
          /* Step 2 — sports */
          <form onSubmit={handleRegister}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1A2B4A", marginBottom: 4 }}>
              Quels sports pratiques-tu ?
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", marginBottom: 16 }}>
              Sélectionne tout ce qui te correspond
            </p>

            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
              {SPORTS.map((sport) => {
                const active = selectedSports.includes(sport.id);
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => toggleSport(sport.id)}
                    className="tap-scale"
                    style={{
                      height: 56, borderRadius: 14,
                      border: active ? "none" : "1.5px solid #E5E8EE",
                      background: active ? "#FF6B35" : "#F1F3F7",
                      color: active ? "#fff" : "#1A2B4A",
                      fontSize: 13, fontWeight: 700,
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{sport.emoji}</span>
                    {sport.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "#FEE2E2", color: "#EF4444", fontSize: 13, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1, height: 48, borderRadius: 14,
                  background: "#F1F3F7", border: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: 700, color: "#5B6478",
                }}
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2, height: 48, borderRadius: 14,
                  background: "linear-gradient(135deg, #FF6B35, #E5551F)",
                  color: "#fff", border: "none", cursor: "pointer",
                  fontSize: 15, fontWeight: 800,
                  boxShadow: "0 6px 18px rgba(255,107,53,0.35)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Création…" : "Créer mon compte 🎉"}
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "#8A93A6", marginTop: 18 }}>
          Déjà un compte ?{" "}
          <Link href="/login" style={{ color: "#FF6B35", fontWeight: 700, textDecoration: "none" }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
