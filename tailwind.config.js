/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effefb",
          100: "#d9fbf4",
          500: "#0cb899",
          600: "#07977f",
          700: "#057968",
        },
        ink: {
          900: "#172033",
          700: "#344054",
          500: "#667085",
        },
      },
      boxShadow: {
        panel: "0 8px 24px rgba(16, 24, 40, 0.08)",
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "Segoe UI", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
