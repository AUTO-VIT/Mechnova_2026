/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        void: '#110515',
        nebula: '#221545',
        orchid: '#B26FCB',
        cosmic: '#68388D',
        amethyst: '#855AB4',
        space: {
          void: '#110515',
          deep: '#221545',
          surface: '#180e2a',
          border: 'rgba(178, 111, 203, 0.18)',
          orchid: '#B26FCB',
          cosmic: '#68388D',
          amethyst: '#855AB4',
          glow: 'rgba(178, 111, 203, 0.35)'
        },
        console: {
          bg: '#110515',
          card: '#221545',
          surface: '#1a0f30',
          border: 'rgba(178, 111, 203, 0.2)',
          orchid: '#B26FCB',
          cosmic: '#68388D',
          amethyst: '#855AB4',
          amber: '#f59e0b',
          emerald: '#10b981'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Outfit"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-scan': 'radarScan 4s linear infinite',
        'nebula-spin': 'nebulaSpin 20s linear infinite'
      },
      keyframes: {
        radarScan: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        nebulaSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' }
        }
      }
    },
  },
  plugins: [],
}
