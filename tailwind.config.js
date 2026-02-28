/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: "#0A0A0F",
        card: "#141420",
        elevated: "#1C1C2E",
        input: "#1A1A2A",
        gold: {
          DEFAULT: "#D4A843",
          light: "#F0D68A",
          dim: "rgba(212, 168, 67, 0.15)",
        },
        accent: {
          green: "#40916C",
          red: "#E74C3C",
          blue: "#1565C0",
          purple: "#7B2D8E",
          orange: "#E65100",
          brown: "#B8860B",
          slate: "#37474F",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Source Sans 3'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
