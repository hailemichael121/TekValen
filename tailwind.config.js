/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel"', "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0,0,0,0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
      colors: {
        pearl: "#f5f5f5",
        ink: "#0d0d0d",
        valentine: "#c48b9a",
      },
    },
  },
  plugins: [],
};
