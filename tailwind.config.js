/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 500: "#34d399", 600: "#10b981" }
      },
      boxShadow: {
        glass: "0 8px 30px rgba(0, 0, 0, 0.25)"
      }
    }
  },
  plugins: []
};
