import { describe, it, expect } from "vitest";
import {
  formatDuration,
  getInitials,
  validateEventForm,
  hasErrors,
  SPORT_META,
  LEVEL_LABELS,
} from "@/lib/utils";

// ── formatDuration ────────────────────────────────────────────

describe("formatDuration", () => {
  it("returns 0min for 0 minutes", () => {
    expect(formatDuration(0)).toBe("0min");
  });

  it("returns 0min for negative values", () => {
    expect(formatDuration(-5)).toBe("0min");
  });

  it("formats minutes below 60", () => {
    expect(formatDuration(15)).toBe("15min");
    expect(formatDuration(30)).toBe("30min");
    expect(formatDuration(45)).toBe("45min");
  });

  it("formats exactly 60 minutes as 1h", () => {
    expect(formatDuration(60)).toBe("1h");
  });

  it("formats 90 minutes as 1h30", () => {
    expect(formatDuration(90)).toBe("1h30");
  });

  it("formats 75 minutes as 1h15", () => {
    expect(formatDuration(75)).toBe("1h15");
  });

  it("formats 120 minutes as 2h", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("pads single-digit minutes with zero", () => {
    expect(formatDuration(65)).toBe("1h05");
  });

  it("formats 480 minutes as 8h", () => {
    expect(formatDuration(480)).toBe("8h");
  });
});

// ── getInitials ───────────────────────────────────────────────

describe("getInitials", () => {
  it("returns ? for null", () => {
    expect(getInitials(null)).toBe("?");
  });

  it("returns ? for undefined", () => {
    expect(getInitials(undefined)).toBe("?");
  });

  it("returns ? for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("returns ? for whitespace-only string", () => {
    expect(getInitials("   ")).toBe("?");
  });

  it("returns single uppercase letter for one-word name", () => {
    expect(getInitials("alice")).toBe("A");
    expect(getInitials("Jean")).toBe("J");
  });

  it("returns two uppercase letters for two-word name", () => {
    expect(getInitials("Jean Dupont")).toBe("JD");
    expect(getInitials("marie claire")).toBe("MC");
  });

  it("only returns two letters even for longer names", () => {
    expect(getInitials("Jean Pierre Martin")).toBe("JP");
  });

  it("handles extra spaces between words", () => {
    expect(getInitials("Jean   Dupont")).toBe("JD");
  });
});

// ── validateEventForm ─────────────────────────────────────────

const VALID_FORM = {
  title:       "Basket 3v3 Buttes Chaumont",
  sport:       "basket",
  maxPlayers:  10,
  durationMin: 60,
  eventDate:   "2099-12-31",
};

describe("validateEventForm", () => {
  it("returns no errors for a valid form", () => {
    expect(hasErrors(validateEventForm(VALID_FORM))).toBe(false);
  });

  // title
  it("requires a title", () => {
    const errors = validateEventForm({ ...VALID_FORM, title: "" });
    expect(errors.title).toBeDefined();
  });

  it("rejects whitespace-only title", () => {
    const errors = validateEventForm({ ...VALID_FORM, title: "   " });
    expect(errors.title).toBeDefined();
  });

  it("rejects title longer than 100 characters", () => {
    const errors = validateEventForm({ ...VALID_FORM, title: "A".repeat(101) });
    expect(errors.title).toBeDefined();
  });

  it("accepts a title of exactly 100 characters", () => {
    const errors = validateEventForm({ ...VALID_FORM, title: "A".repeat(100) });
    expect(errors.title).toBeUndefined();
  });

  // sport
  it("rejects an unknown sport", () => {
    const errors = validateEventForm({ ...VALID_FORM, sport: "curling" });
    expect(errors.sport).toBeDefined();
  });

  it("rejects an empty sport", () => {
    const errors = validateEventForm({ ...VALID_FORM, sport: "" });
    expect(errors.sport).toBeDefined();
  });

  it("accepts all valid sports", () => {
    for (const sport of Object.keys(SPORT_META)) {
      const errors = validateEventForm({ ...VALID_FORM, sport });
      expect(errors.sport).toBeUndefined();
    }
  });

  // maxPlayers
  it("rejects 1 player (minimum is 2)", () => {
    const errors = validateEventForm({ ...VALID_FORM, maxPlayers: 1 });
    expect(errors.maxPlayers).toBeDefined();
  });

  it("rejects 0 players", () => {
    const errors = validateEventForm({ ...VALID_FORM, maxPlayers: 0 });
    expect(errors.maxPlayers).toBeDefined();
  });

  it("rejects more than 100 players", () => {
    const errors = validateEventForm({ ...VALID_FORM, maxPlayers: 101 });
    expect(errors.maxPlayers).toBeDefined();
  });

  it("accepts exactly 2 players", () => {
    const errors = validateEventForm({ ...VALID_FORM, maxPlayers: 2 });
    expect(errors.maxPlayers).toBeUndefined();
  });

  it("accepts exactly 100 players", () => {
    const errors = validateEventForm({ ...VALID_FORM, maxPlayers: 100 });
    expect(errors.maxPlayers).toBeUndefined();
  });

  // duration
  it("rejects duration below 15 minutes", () => {
    const errors = validateEventForm({ ...VALID_FORM, durationMin: 10 });
    expect(errors.duration).toBeDefined();
  });

  it("accepts exactly 15 minutes", () => {
    const errors = validateEventForm({ ...VALID_FORM, durationMin: 15 });
    expect(errors.duration).toBeUndefined();
  });

  it("rejects duration above 480 minutes (8h)", () => {
    const errors = validateEventForm({ ...VALID_FORM, durationMin: 481 });
    expect(errors.duration).toBeDefined();
  });

  it("accepts exactly 480 minutes", () => {
    const errors = validateEventForm({ ...VALID_FORM, durationMin: 480 });
    expect(errors.duration).toBeUndefined();
  });

  // eventDate
  it("rejects a missing date", () => {
    const errors = validateEventForm({ ...VALID_FORM, eventDate: "" });
    expect(errors.eventDate).toBeDefined();
  });

  it("rejects a date in the past", () => {
    const errors = validateEventForm({ ...VALID_FORM, eventDate: "2020-01-01" });
    expect(errors.eventDate).toBeDefined();
  });

  it("accepts today's date", () => {
    const today = new Date().toISOString().split("T")[0];
    const errors = validateEventForm({ ...VALID_FORM, eventDate: today });
    expect(errors.eventDate).toBeUndefined();
  });

  it("accepts a future date", () => {
    const errors = validateEventForm({ ...VALID_FORM, eventDate: "2099-12-31" });
    expect(errors.eventDate).toBeUndefined();
  });

  // multiple errors
  it("collects multiple errors at once", () => {
    const errors = validateEventForm({
      title: "",
      sport: "unknown",
      maxPlayers: 0,
      durationMin: 5,
      eventDate: "2000-01-01",
    });
    expect(Object.keys(errors).length).toBe(5);
    expect(hasErrors(errors)).toBe(true);
  });
});

// ── SPORT_META & LEVEL_LABELS ─────────────────────────────────

describe("SPORT_META", () => {
  const EXPECTED_SPORTS = ["basket", "foot", "tennis", "padel", "running", "volley", "yoga", "velo"];

  it("contains all 8 sports", () => {
    expect(Object.keys(SPORT_META)).toHaveLength(8);
  });

  it("has every expected sport key", () => {
    for (const sport of EXPECTED_SPORTS) {
      expect(SPORT_META).toHaveProperty(sport);
    }
  });

  it("every entry has required fields", () => {
    for (const [key, meta] of Object.entries(SPORT_META)) {
      expect(meta.emoji,    `${key}.emoji`).toBeTruthy();
      expect(meta.label,    `${key}.label`).toBeTruthy();
      expect(meta.color,    `${key}.color`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(meta.soft,     `${key}.soft`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(meta.gradient, `${key}.gradient`).toContain("linear-gradient");
    }
  });
});

describe("LEVEL_LABELS", () => {
  it("maps all DB level values to French labels", () => {
    expect(LEVEL_LABELS.beginner).toBe("Débutant");
    expect(LEVEL_LABELS.intermediate).toBe("Intermédiaire");
    expect(LEVEL_LABELS.advanced).toBe("Confirmé");
    expect(LEVEL_LABELS.expert).toBe("Expert");
    expect(LEVEL_LABELS.all).toBe("Tous niveaux");
  });
});
