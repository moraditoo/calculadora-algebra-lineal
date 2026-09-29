/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: "#7B61FF",
          card: "rgba(255, 255, 255, 0.22)",
          cardHover: "rgba(255, 255, 255, 0.32)",
          border: "rgba(255, 255, 255, 0.45)",
          textDark: "#220D54",
          textLight: "#FFFFFF",
        }
      }
    },
  },
  plugins: [],
}