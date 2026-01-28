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
        
        // Cores Semânticas
        warning: '#F59E0B', // Amber 500
        success: '#10B981', // Emerald 500
        danger: '#EF4444',  // Red 500
        'surface-dark': '#0F172A', // Slate 900
      },
      fontFamily: {
        logo: ['var(--font-outfit)', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;