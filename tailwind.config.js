/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon green (main accent like betonbits)
        neon: {
          400: '#00ff88',
          500: '#00cc66',
          600: '#00aa55',
        },
        // Gold (secondary accent)
        gold: {
          400: '#FFD700',
          500: '#FFC700',
          600: '#FFBF00',
        },
        // Dark backgrounds
        dark: {
          bg: '#0a0e14',
          card: '#0f141e',
          hover: '#14191f',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 0, 0, 0.8)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFC700 50%, #FFBF00 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00ff88 0%, #00cc66 50%, #00aa55 100%)',
        'dark-gradient': 'linear-gradient(135deg, rgba(15, 20, 30, 0.95), rgba(20, 25, 35, 0.95))',
      },
    },
  },
  plugins: [],
}
