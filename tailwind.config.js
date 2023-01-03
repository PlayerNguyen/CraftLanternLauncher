const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dist/render/**/*.{html,js,ts,jsx,tsx}",
    "./render/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        floating: {
          "0%, 100%": { transform: "translateY(0)" },
          "25%": { transform: "translateY(2vh)" },
          "75%": { transform: "translateY(-2vh)" },
        },
      },
      animation: {
        floating: "floating 1s ease-in-out infinite",
      },
      colors: {
        base: {
          100: colors.neutral[100],
          200: colors.neutral[200],
          300: colors.neutral[300],
          400: colors.neutral[400],
          content: colors.zinc[600],
        },
        neutral: colors.neutral[600],
        "neutral-focus": colors.neutral[700],
        "neutral-content": colors.neutral[100],
        primary: colors.sky[600],
        "primary-focus": colors.sky[700],
        "primary-content": colors.neutral[50],
      },
      fontFamily: {
        "base-mono": "Pixeloid Mono",
        "base-sans": "Pixeloid Sans",
        "base-sans-bold": "Pixeloid Sans Bold",
      },
    },
  },
  plugins: [],
};
