module.exports = {
  darkMode: "class",
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#e0b328",
          50: "#fdfbe9",
          100: "#fbf6c7",
          200: "#f8ec91",
          300: "#f3dc52",
          400: "#ecc92b",
          500: "#e0b328",
          600: "#c49214",
          700: "#9c6b12",
          800: "#805416",
          900: "#6d4417",
        },
      },
    },
  },
  plugins: [],
};
