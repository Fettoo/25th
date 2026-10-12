/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F7EBE1',
          200: '#EADBCE',
          300: '#D6C3B2',
        },
        rose: {
          accent: '#D8A7B1',
          hover: '#C7939E',
          soft: '#F4E5E8',
        },
        bronze: {
          overlay: '#C8B29B',
          dark: '#A68D74',
        },
        charcoal: {
          DEFAULT: '#2D2926',
          muted: '#6B6560',
          subtle: '#9A928B',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Outfit"', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'inner': '18px',
      },
      boxShadow: {
        'soft': '0 8px 30px -4px rgba(45, 41, 38, 0.06)',
        'float': '0 12px 35px -6px rgba(45, 41, 38, 0.1)',
        'card': '0 4px 20px -2px rgba(45, 41, 38, 0.05)',
      },
    },
  },
  plugins: [],
}
