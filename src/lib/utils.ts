// Shared utility functions — tested in src/tests/utils.test.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SPORT_META: Record<string, { emoji: string; label: string; color: string; soft: string; gradient: string }> = {
  basket:  { emoji: "🏀", label: "Basket",  color: "#FF6B35", soft: "#FFE6DA", gradient: "linear-gradient(160deg, #FF6B35 0%, #E5551F 100%)" },
  foot:    { emoji: "⚽", label: "Foot",    color: "#2EC4B6", soft: "#D6F4F1", gradient: "linear-gradient(160deg, #2EC4B6 0%, #1FA89B 100%)" },
  tennis:  { emoji: "🎾", label: "Tennis",  color: "#F4B43A", soft: "#FEF3C7", gradient: "linear-gradient(160deg, #F4B43A 0%, #E09B2A 100%)" },
  padel:   { emoji: "🏓", label: "Padel",   color: "#3B82F6", soft: "#DBEAFE", gradient: "linear-gradient(160deg, #3B82F6 0%, #2563EB 100%)" },
  running: { emoji: "🏃", label: "Running", color: "#7B61FF", soft: "#EDE9FE", gradient: "linear-gradient(160deg, #7B61FF 0%, #5B41DF 100%)" },
  volley:  { emoji: "🏐", label: "Volley",  color: "#EC4899", soft: "#FCE7F3", gradient: "linear-gradient(160deg, #EC4899 0%, #DB2777 100%)" },
  yoga:    { emoji: "🧘", label: "Yoga",    color: "#14B8A6", soft: "#CCFBF1", gradient: "linear-gradient(160deg, #14B8A6 0%, #0D9488 100%)" },
  velo:    { emoji: "🚴", label: "Vélo",    color: "#06B6D4", soft: "#CFFAFE", gradient: "linear-gradient(160deg, #06B6D4 0%, #0891B2 100%)" },
};

export const LEVEL_LABELS: Record<string, string> = {
  beginner:     "Débutant",
  intermediate: "Intermédiaire",
  advanced:     "Confirmé",
  expert:       "Expert",
  all:          "Tous niveaux",
};

/**
 * Formats a duration in minutes to a human-readable string.
 * 30 → "30min" | 60 → "1h" | 90 → "1h30" | 75 → "1h15"
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0min";
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

/**
 * Formats a DB date string (YYYY-MM-DD) and time string (HH:MM:SS) into French.
 * "2026-04-26", "15:00:00" → "Sam. 26 Avr · 15h00"
 */
export function formatEventDate(dateStr: string, timeStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const day   = d.toLocaleDateString("fr-FR", { weekday: "short" });
  const num   = d.getDate();
  const month = d.toLocaleDateString("fr-FR", { month: "short" });
  const time  = timeStr.slice(0, 5).replace(":", "h");
  const cap   = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return `${cap(day)}. ${num} ${cap(month)} · ${time}`;
}

/**
 * Returns the 1–2 letter initials from a full name.
 * "Jean Dupont" → "JD" | "alice" → "A" | null → "?"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── Event form validation ─────────────────────────────────────

export type EventFormErrors = {
  title?:      string;
  sport?:      string;
  maxPlayers?: string;
  duration?:   string;
  eventDate?:  string;
};

export function validateEventForm(data: {
  title:       string;
  sport:       string;
  maxPlayers:  number;
  durationMin: number;
  eventDate:   string;
}): EventFormErrors {
  const errors: EventFormErrors = {};

  if (!data.title.trim())
    errors.title = "Le titre est requis.";
  else if (data.title.trim().length > 100)
    errors.title = "Le titre ne doit pas dépasser 100 caractères.";

  if (!data.sport || !SPORT_META[data.sport])
    errors.sport = "Sélectionne un sport valide.";

  if (!Number.isInteger(data.maxPlayers) || data.maxPlayers < 2)
    errors.maxPlayers = "Il faut au moins 2 joueurs.";
  else if (data.maxPlayers > 100)
    errors.maxPlayers = "Maximum 100 joueurs.";

  if (data.durationMin < 15)
    errors.duration = "Durée minimum : 15 minutes.";
  else if (data.durationMin > 480)
    errors.duration = "Durée maximum : 8 heures.";

  if (!data.eventDate)
    errors.eventDate = "La date est requise.";
  else {
    const d = new Date(data.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(d.getTime()) || d < today)
      errors.eventDate = "La date doit être aujourd'hui ou dans le futur.";
  }

  return errors;
}

export function hasErrors(errors: EventFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
