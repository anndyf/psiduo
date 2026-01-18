/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: '#0B1E3B',    // Azul Profundo
        primary: '#1E40AF', // Azul Baleia
        mist: '#F0F4F8',    // Espuma/Neblina
        surface: '#FFFFFF', // Branco
        sand: '#E2E8F0',    // Areia suave
      },
    },
  },
  plugins: [],
};

export default config;