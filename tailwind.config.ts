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
          primary: {
            DEFAULT: "#4F46E5",
            dark: "#3730A3",
          },
          electric: {
            DEFAULT: "#2563EB",
            dark: "#1D4ED8",
          },
          graphite: {
            DEFAULT: "#0F172A",
            dark: "#1E293B",
          },
          surface: {
            light: "#F8FAFC",
            dark: "#0F172A",
          },
          card: {
            light: "rgba(255, 255, 255, 0.85)",
            dark: "rgba(30, 41, 59, 0.7)",
          },
          border: {
            light: "#E2E8F0",
            dark: "#1E293B",
          },
          glow: "#F8FAFC",
        },
      },
      boxShadow: {
        premium: "0 4px 30px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      addUtilities({
        ".preserve-3d": {
          "transform-style": "preserve-3d",
        },
        ".backface-hidden": {
          "backface-visibility": "hidden",
        },
        ".perspective-1000": {
          perspective: "1000px",
        },
        ".perspective-2000": {
          perspective: "2000px",
        },
        ".will-change-theme": {
          "will-change": "background-color, border-color, color, box-shadow",
        },
      });
    },
  ],
};

export default config;
