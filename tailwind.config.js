/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/web/app/**/*.{ts,tsx,js,jsx}",
    "./packages/rotaract-finance/src/**/*.{ts,tsx}",
    "./packages/rotaract-components/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
