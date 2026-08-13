/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          900: "#3A544E",
          800: "#4F6F68",
          700: "#5F8079",
        },
        terracotta: {
          600: "#C53D0E",
          500: "#EA492E",
        },
        brown: {
          700: "#5A3521",
          600: "#6E412A",
          500: "#8B5A3C",
        },
        teal: {
          400: "#61C3B6",
        },
        cream: "#F7F0E4",
        tan: "#A5765D",
        ink: "#1A1A1A",
      },
      fontFamily: {
        display: ["var(--font-wix-display)", "sans-serif"],
        body: ["var(--font-wix-text)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
