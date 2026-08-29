/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "../../packages/rotaract-finance/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rotaract: {
          pink: "#FF2D7A",
          "pink-soft": "#FF4D92",
          magenta: "#E81B6A",
          ink: "#18181B",
          paper: "#FFFFFF",
          mist: "#F7F5F7",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
