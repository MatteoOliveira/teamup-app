import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF6B35",
          "orange-dark": "#E5551F",
          "orange-soft": "#FFE6DA",
          teal: "#2EC4B6",
          "teal-dark": "#1FA89B",
          "teal-soft": "#D6F4F1",
          navy: "#1A2B4A",
        },
        bg: "#F6F7FA",
        surface: "#FFFFFF",
        "surface-alt": "#F1F3F7",
        border: "#E5E8EE",
        "border-strong": "#D5DAE3",
        ink: "#1A2B4A",
        "ink-muted": "#5B6478",
        "ink-soft": "#8A93A6",
        sport: {
          basket: "#FF6B35",
          foot: "#2EC4B6",
          tennis: "#F4B43A",
          padel: "#3B82F6",
          running: "#7B61FF",
          volley: "#EC4899",
          yoga: "#14B8A6",
          velo: "#06B6D4",
        },
        level: {
          beginner: "#22C55E",
          intermediate: "#F4B43A",
          confirmed: "#EF4444",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "999px",
        button: "14px",
        card: "18px",
        "card-lg": "20px",
      },
      boxShadow: {
        card: "0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)",
        "orange-glow": "0 6px 18px -6px rgba(255,107,53,0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
