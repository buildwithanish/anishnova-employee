import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A1020",
        mist: "#94A3B8",
        aurora: "#1D4ED8",
        mint: "#10B981",
        danger: "#DC2626",
        surface: "#0F172A",
        panel: "rgba(15, 23, 42, 0.65)",
      },
      boxShadow: {
        glow: "0 18px 40px rgba(15, 23, 42, 0.18)",
        glass: "0 16px 50px rgba(2, 6, 23, 0.16)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 35%), radial-gradient(circle at top right, rgba(16, 185, 129, 0.18), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 38%, #f8fafc 100%)",
        darkmesh: "radial-gradient(circle at top left, rgba(29, 78, 216, 0.28), transparent 30%), radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.18), transparent 25%), linear-gradient(180deg, #020617 0%, #0f172a 52%, #020617 100%)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
