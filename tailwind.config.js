/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dist/render/**/*.{html,js,ts,jsx,tsx}",
    "./render/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      "base-mono": "Pixeloid Mono",
      "base-sans": "Pixeloid Sans",
      "base-sans-bold": "Pixeloid Sans Bold",
    },
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
    },
    colors: {
      primary: {
        white: "#fff",
        black: "#000",
        "dimmed-white": "#f5f5f5",
        focus: "",
      },
    },
  },
  plugins: [],
};
