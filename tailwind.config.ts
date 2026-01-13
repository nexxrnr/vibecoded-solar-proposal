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
        // Serbian solar proposal brand colors
        solar: {
          yellow: "#f8d26a",
          blue: "#102e5d",
          "blue-light": "#1e4a8f",
        },
        tariff: {
          green: "#22c55e",
          blue: "#3b82f6",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
