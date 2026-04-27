"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInstallPWA } from "@/lib/useInstallPWA";

const SLIDES = [
  {
    gradient: "linear-gradient(160deg, #FF6B35 0%, #E5551F 100%)",
    emoji: "🏀",
    glowColor: "rgba(255,107,53,0.35)",
    tag: "NOUVEAUTÉ",
    tagColor: "#FF6B35",
    tagBg: "#FFE6DA",
    title: "Joue avec des passionnés près de chez toi",
    description:
      "Trouve des joueurs de ton niveau, rejoins des matchs et crée ta communauté sportive locale.",
    dotColor: "#FF6B35",
    decorEmojis: ["⚽", "🎾", "🏐", "🏃"],
  },
  {
    gradient: "linear-gradient(160deg, #2EC4B6 0%, #1FA89B 100%)",
    emoji: "📍",
    glowColor: "rgba(46,196,182,0.35)",
    tag: "TERRAINS",
    tagColor: "#2EC4B6",
    tagBg: "#D6F4F1",
    title: "Réserve les meilleurs terrains en quelques taps",
    description:
      "Accède à la carte des espaces sportifs disponibles et réserve ton créneau instantanément.",
    dotColor: "#2EC4B6",
    decorEmojis: ["🏟️", "🗺️", "📅", "✅"],
  },
  {
    gradient: "linear-gradient(160deg, #1A2B4A 0%, #243757 100%)",
    emoji: "🏆",
    glowColor: "rgba(255,107,53,0.25)",
    tag: "ÉQUIPES",
    tagColor: "#FF6B35",
    tagBg: "rgba(255,107,53,0.12)",
    title: "Crée ton équipe et progresse ensemble",
    description:
      "Messagerie en temps réel, stats collectives et événements réservés à ton équipe.",
    dotColor: "#FF6B35",
    decorEmojis: ["💬", "📊", "🥇", "🤝"],
  },
  {
    gradient: "linear-gradient(160deg, #7B61FF 0%, #5B41DF 100%)",
    emoji: "📲",
    glowColor: "rgba(123,97,255,0.35)",
    tag: "APPLICATION",
    tagColor: "#7B61FF",
    tagBg: "rgba(123,97,255,0.1)",
    title: "Installe TeamUp! sur ton écran d'accueil",
    description:
      "Accède directement à l'app comme une application native, même hors connexion.",
    dotColor: "#7B61FF",
    decorEmojis: ["📱", "⚡", "🔔", "✨"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  const { canInstall, isIOS, isInstalled, install, hasNativePrompt } = useInstallPWA();

  const current = SLIDES[slide];
  const isInstallSlide = slide === SLIDES.length - 1;
  const isLast = isInstallSlide;

  const goTo = (next: number) => {
    if (animating) return;
    setAnimating(true);
    setHeroVisible(false);
    setTimeout(() => {
      setSlide(next);
      setHeroVisible(true);
      setAnimating(false);
    }, 220);
  };

  const handleStart = () => {
    localStorage.setItem("teamup_onboarding_done", "1");
    router.push("/register");
  };

  const handleNext = () => {
    if (isLast) {
      handleStart();
    } else {
      goTo(slide + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("teamup_onboarding_done", "1");
    router.push("/login");
  };

  const handleInstall = async () => {
    if (isIOS) return; // iOS : instructions affichées, pas de prompt
    setInstalling(true);
    const accepted = await install();
    setInstalling(false);
    if (accepted) setInstalled(true);
  };

  return (
    <div
      className="relative flex flex-col min-h-screen overflow-hidden"
      style={{
        background: current.gradient,
        transition: "background 0.4s ease",
      }}
    >
      {/* Blobs décoratifs */}
      <div className="absolute top-[-60px] right-[-60px] rounded-full pointer-events-none"
        style={{ width: 220, height: 220, background: "rgba(255,255,255,0.07)", filter: "blur(2px)" }} />
      <div className="absolute top-[30%] left-[-80px] rounded-full pointer-events-none"
        style={{ width: 160, height: 160, background: "rgba(255,255,255,0.05)" }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-14">
        <span className="text-white font-extrabold tracking-tight" style={{ fontSize: 22, letterSpacing: -0.5 }}>
          TeamUp<span style={{ color: "rgba(255,255,255,0.7)" }}>!</span>
        </span>
        <button onClick={handleSkip} className="text-white font-semibold text-sm"
          style={{
            background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
            borderRadius: 999, padding: "7px 16px", border: "1px solid rgba(255,255,255,0.2)",
          }}>
          Passer
        </button>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {current.decorEmojis.map((em, i) => (
            <span key={`${slide}-${i}`} className="absolute text-2xl"
              style={{
                top: `${[18, 12, 22, 8][i]}%`,
                left: i % 2 === 0 ? `${[8, 75, 5, 80][i]}%` : undefined,
                right: i % 2 !== 0 ? `${[8, 12][Math.floor(i / 2)]}%` : undefined,
                opacity: 0.22,
                transform: `rotate(${[-12, 15, -8, 20][i]}deg)`,
                fontSize: [28, 22, 20, 26][i],
                transition: "all 0.3s",
              }}>
              {em}
            </span>
          ))}
        </div>

        <div key={slide} className="relative flex items-center justify-center"
          style={{
            width: 260, height: 260,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "scale(1) translateY(0)" : "scale(0.9) translateY(12px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}>
          <div className="absolute inset-0 rounded-full"
            style={{ background: current.glowColor, filter: "blur(32px)", transform: "scale(1.15)" }} />
          <div className="relative flex items-center justify-center rounded-full"
            style={{
              width: 220, height: 220,
              background: "rgba(255,255,255,0.18)", backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)", border: "1.5px solid rgba(255,255,255,0.32)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}>
            <div className="absolute inset-4 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 80, lineHeight: 1 }}>{current.emoji}</span>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="relative z-10 mx-4 mb-6"
        style={{
          background: "#FFFFFF", borderRadius: 28, padding: "28px 24px 32px",
          boxShadow: "0 -2px 40px rgba(0,0,0,0.1), 0 2px 20px rgba(0,0,0,0.06)",
        }}>
        {/* Tag */}
        <div className="mb-3">
          <span className="text-xs font-bold tracking-widest uppercase"
            style={{ color: current.tagColor, background: current.tagBg, borderRadius: 999, padding: "4px 12px" }}>
            {current.tag}
          </span>
        </div>

        {/* Titre */}
        <h1 className="font-extrabold mb-3"
          style={{ fontSize: 24, lineHeight: 1.2, letterSpacing: -0.5, color: "#1A2B4A" }}>
          {current.title}
        </h1>

        {/* Description */}
        <p className="font-medium" style={{ fontSize: 15, lineHeight: 1.6, color: "#5B6478", marginBottom: isInstallSlide ? 16 : 24 }}>
          {current.description}
        </p>

        {/* ── Slide d'installation ── */}
        {isInstallSlide && (
          <div style={{ marginBottom: 20 }}>
            {isInstalled || installed ? (
              /* Déjà installée */
              <div className="flex items-center gap-3"
                style={{ background: "#D1FAE5", borderRadius: 14, padding: "12px 16px" }}>
                <span style={{ fontSize: 22 }}>✅</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>
                  TeamUp! est déjà installé sur ton appareil !
                </p>
              </div>
            ) : isIOS ? (
              /* Instructions iOS */
              <div style={{ background: "#F6F7FA", borderRadius: 14, padding: "14px 16px" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1A2B4A", marginBottom: 10 }}>
                  Pour installer sur iOS :
                </p>
                {[
                  { icon: "⬆️", text: 'Appuie sur le bouton "Partager"' },
                  { icon: "➕", text: '"Sur l\'écran d\'accueil"' },
                  { icon: "✅", text: 'Appuie sur "Ajouter"' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ marginBottom: i < 2 ? 8 : 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: "#fff", border: "1px solid #E5E8EE",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                    }}>
                      {step.icon}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#5B6478" }}>{step.text}</span>
                  </div>
                ))}
              </div>
            ) : hasNativePrompt ? (
              /* Bouton install natif Android/desktop */
              <button
                onClick={handleInstall}
                disabled={installing}
                className="flex items-center justify-center gap-2 w-full tap-scale"
                style={{
                  height: 52, borderRadius: 14,
                  background: "linear-gradient(135deg, #7B61FF, #5B41DF)",
                  boxShadow: "0 6px 18px -6px rgba(123,97,255,0.55)",
                  border: "none", cursor: "pointer",
                  fontSize: 15, fontWeight: 700, color: "#fff",
                  opacity: installing ? 0.7 : 1, transition: "opacity 0.15s",
                }}>
                {installing ? "Installation…" : <><span style={{ fontSize: 18 }}>📲</span> Installer l&apos;application</>}
              </button>
            ) : (
              /* PWA déjà installée ou non supportée */
              <div style={{ background: "#F6F7FA", borderRadius: 14, padding: "12px 16px" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#8A93A6", textAlign: "center" }}>
                  Ajoute cette page à ton écran d&apos;accueil depuis les options de ton navigateur.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dots + bouton */}
        <div className="flex items-center justify-between gap-4">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => !animating && goTo(i)}
                style={{
                  width: i === slide ? 20 : 8, height: 8, borderRadius: 999,
                  background: i === slide ? current.dotColor : "#E5E8EE",
                  transition: "all 0.25s ease", border: "none", padding: 0, cursor: "pointer",
                }} />
            ))}
          </div>

          {/* CTA */}
          <button onClick={handleNext} disabled={animating}
            className="tap-scale flex items-center gap-2 font-bold text-white"
            style={{
              flex: 1, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #FF6B35, #E5551F)",
              boxShadow: "0 6px 18px -6px rgba(255,107,53,0.55)",
              border: "none", fontSize: 15, cursor: "pointer",
              justifyContent: "center", letterSpacing: -0.2,
              opacity: animating ? 0.7 : 1, transition: "opacity 0.15s, transform 0.12s",
            }}>
            {isLast ? <>Commencer <span>🎉</span></> : <>Suivant <span style={{ fontSize: 16 }}>→</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}
