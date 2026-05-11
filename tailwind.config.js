/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./404.html",
    "./includes/**/*.html",
    "./js/**/*.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: {
          50: "#fcfcfa",
          100: "#f1f3f6",
          500: "#94a3b8",
          600: "#475569",
          700: "#334155",
          800: "#1f2937",
          900: "#0e1520",
        },
        accent: "#4c93ff",
        "accent-light": "#7ab0ff",
        muted: "#94a3b8",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        serif: ["Playfair Display", "ui-serif"],
      },
      fontSize: {
        base: "1.125rem",
        lg: "1.25rem",
      },
      letterSpacing: {
        wider: ".08em",
        widest: ".15em",
        tightest: "-0.02em",
      },
      lineHeight: {
        relaxed: "1.75",
        loose: "2",
      },
      boxShadow: {
        glow: "0 0 15px rgba(76, 147, 255, 0.4)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(30px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 1.2s ease-out forwards",
        fade: "fade 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};
