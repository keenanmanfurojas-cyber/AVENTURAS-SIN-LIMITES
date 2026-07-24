import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        volcanic: "#070606",
        obsidian: "#070606",
        charcoal: "#161112",
        forest: "#161112",
        lava: "#e4452f",
        molten: "#ff5a36",
        ember: "#ff9a4f",
        sand: "#ff9a4f",
        smoke: "#f4f0eb",
        ash: "#aaa19d",
        moss: "#e4452f",
        rock: "#716966",
        success: "#55b982",
        warning: "#f2a84b",
        danger: "#ef5b5b",
      },
      fontFamily: {
        display: [
          "var(--font-instrument-serif)",
          "Instrument Serif",
          "Baskerville",
          "Times New Roman",
          "serif",
        ],
        sans: [
          "var(--font-manrope)",
          "Manrope",
          "Avenir Next",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0, 0, 0, 0.34)",
        lava: "0 0 42px rgba(228, 69, 47, 0.22)",
        "lava-soft": "0 0 80px rgba(255, 90, 54, 0.12)",
      },
      borderRadius: {
        panel: "1.25rem",
        soft: "0.75rem",
      },
      maxWidth: {
        content: "90rem",
        reading: "46rem",
      },
      letterSpacing: {
        brand: "0.28em",
      },
      transitionDuration: {
        refined: "420ms",
      },
      transitionTimingFunction: {
        refined: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "intro-rise": "intro-rise 1.15s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slow-drift": "slow-drift 18s ease-in-out infinite alternate",
        "pulse-line": "pulse-line 2.4s ease-in-out infinite",
        "fog-drift": "fog-drift 22s ease-in-out infinite alternate",
        "soft-float": "soft-float 7s ease-in-out infinite",
      },
      keyframes: {
        "intro-rise": {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slow-drift": {
          "0%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1.08)" },
        },
        "pulse-line": {
          "0%, 100%": { opacity: "0.35", transform: "scaleY(0.6)" },
          "50%": { opacity: "1", transform: "scaleY(1)" },
        },
        "fog-drift": {
          "0%": { opacity: "0.12", transform: "translate3d(-4%, 0, 0) scale(1)" },
          "100%": { opacity: "0.24", transform: "translate3d(4%, -2%, 0) scale(1.08)" },
        },
        "soft-float": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -6px, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
