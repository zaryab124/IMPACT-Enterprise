import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FFFFFF",
          cream: "#FAF9F6",
          surface: "#F4F3EE",
          surfaceAlt: "#ECEAE3",
          border: "#E6E3DA",
          borderStrong: "#D1CDC3",
          text: "#0D0D0F",
          charcoal: "#17171B",
          muted: "#5E5B54",
          subtle: "#8B8880",
          accent: "#3B38F5",
          accentHover: "#2A27D4",
          accentSoft: "#EEEDFE",
          amber: "#F59E0B",
          amberSoft: "#FEF3C7",
          teal: "#0D9488",
          tealSoft: "#CCFBF1",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(13, 13, 15, 0.04), 0 1px 2px -1px rgba(13, 13, 15, 0.04)",
        cardHover: "0 10px 25px -5px rgba(13, 13, 15, 0.08), 0 8px 10px -6px rgba(13, 13, 15, 0.04)",
        elevated: "0 20px 35px -10px rgba(13, 13, 15, 0.09), 0 10px 10px -5px rgba(13, 13, 15, 0.03)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
