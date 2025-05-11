/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#0066cc",
          dark: "#4d9fff",
        },
        background: {
          light: "#f9f9f9",
          dark: "#121212",
        },
        card: {
          light: "#ffffff",
          dark: "#1e1e1e",
        },
        text: {
          light: "#333333",
          dark: "#e0e0e0",
        },
        border: {
          light: "#eaeaea",
          dark: "#333333",
        },
      },
      fontFamily: {
        sans: ["Noto Sans KR", "sans-serif"],
      },
    },
  },
  plugins: [],
};
