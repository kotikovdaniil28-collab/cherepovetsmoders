import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#edf7f0",
        muted: "#9fb3a8",
        line: "rgba(197,255,216,0.16)",
        surface: "#07110d",
        brand: "#43ff9a"
      }
    }
  },
  plugins: []
};

export default config;
