"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    btnGradient: "linear-gradient(135deg, #FF6B35, #E5551F)",
    btnShadow: "0 6px 18px -6px rgba(255,107,53,0.55)",
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
    btnGradient: "linear-gradient(135deg, #FF6B35, #E5551F)",
    btnShadow: "0 6px 18px -6px rgba(255,107,53,0.55)",
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
    btnGradient: "linear-gradient(135deg, #FF6B35, #E5551F)",
    btnShadow: "0 6px 18px -6px rgba(255,107,53,0.55)",
    decorEmojis: ["💬", "📊", "🥇", "🤝"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

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

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("teamup_onboarding_done", "1");
      router.push("/register");
    } else {
      goTo(slide + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("teamup_onboarding_done", "1");
    router.push("/login");
  };

  return (
    <div
      className="relative flex flex-col min-h-screen overflow-hidden"
      style={{
        background: current.gradient,
        transition: "background 0.4s ease",
      }}
    >
      {/* Floating decorative blobs */}
      <div
        className="absolute top-[-60px] right-[-60px] rounded-full pointer-events-none"
        style={{
          width: 220,
          height: 220,
          background: "rgba(255,255,255,0.07)",
          filter: "blur(2px)",
        }}
      />
      <div
        className="absolute top-[30%] left-[-80px] rounded-full pointer-events-none"
        style={{
          width: 160,
          height: 160,
          background: "rgba(255,255,255,0.05)",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-14">
        <span
          className="text-white font-extrabold tracking-tight"
          style={{ fontSize: 22, letterSpacing: -0.5 }}
        >
          TeamUp<span style={{ color: "rgba(255,255,255,0.7)" }}>!</span>
        </span>
        <button
          onClick={handleSkip}
          className="text-white font-semibold text-sm"
          style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            borderRadius: 999,
            padding: "7px 16px",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          Passer
        </button>
      </div>

      {/* Hero section */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6">
        {/* Decorative floating emojis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {current.decorEmojis.map((em, i) => (
            <span
              key={`${slide}-${i}`}
              className="absolute text-2xl"
              style={{
                top: `${[18, 12, 22, 8][i]}%`,
                left: i % 2 === 0 ? `${[8, 75, 5, 80][i]}%` : undefined,
                right: i % 2 !== 0 ? `${[8, 12][Math.floor(i / 2)]}%` : undefined,
                opacity: 0.22,
                transform: `rotate(${[-12, 15, -8, 20][i]}deg)`,
                fontSize: [28, 22, 20, 26][i],
                transition: "all 0.3s",
              }}
            >
              {em}
            </span>
          ))}
        </div>

        {/* Glassmorphism circle hero */}
        <div
          key={slide}
          className="relative flex items-center justify-center"
          style={{
            width: 260,
            height: 260,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "scale(1) translateY(0)" : "scale(0.9) translateY(12px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: current.glowColor,
              filter: "blur(32px)",
              transform: "scale(1.15)",
            }}
          />
          {/* Frosted glass circle */}
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: 220,
              height: 220,
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1.5px solid rgba(255,255,255,0.32)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            {/* Inner soft ring */}
            <div
              className="absolute inset-4 rounded-full"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
            <span style={{ fontSize: 80, lineHeight: 1 }}>{current.emoji}</span>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div
        className="relative z-10 mx-4 mb-6"
        style={{
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "28px 24px 32px",
          boxShadow: "0 -2px 40px rgba(0,0,0,0.1), 0 2px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Tag */}
        <div className="mb-3">
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              color: current.tagColor,
              background: current.tagBg,
              borderRadius: 999,
              padding: "4px 12px",
            }}
          >
            {current.tag}
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-extrabold mb-3"
          style={{
            fontSize: 26,
            lineHeight: 1.2,
            letterSpacing: -0.5,
            color: "#1A2B4A",
          }}
        >
          {current.title}
        </h1>

        {/* Description */}
        <p
          className="mb-6 font-medium"
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "#5B6478",
          }}
        >
          {current.description}
        </p>

        {/* Dots + Button row */}
        <div className="flex items-center justify-between gap-4">
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={i}
                onClick={() => !animating && goTo(i)}
                style={{
                  width: i === slide ? 20 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: i === slide ? current.dotColor : "#E5E8EE",
                  transition: "all 0.25s ease",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleNext}
            disabled={animating}
            className="tap-scale flex items-center gap-2 font-bold text-white"
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              background: current.btnGradient,
              boxShadow: current.btnShadow,
              border: "none",
              fontSize: 15,
              cursor: "pointer",
              justifyContent: "center",
              letterSpacing: -0.2,
              opacity: animating ? 0.7 : 1,
              transition: "opacity 0.15s, transform 0.12s",
            }}
          >
            {isLast ? (
              <>Commencer <span>🎉</span></>
            ) : (
              <>Suivant <span style={{ fontSize: 16 }}>→</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
