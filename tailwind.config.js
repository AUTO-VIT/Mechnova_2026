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
        void: '#09000f',
        nebula: '#22102f',
        orchid: '#d79df1',
        cosmic: '#69358f',
        amethyst: '#9454c6',
        space: {
          void: '#09000f',
          deep: '#11051a',
          surface: '#241132',
          border: 'rgba(217, 157, 241, 0.18)',
          orchid: '#d79df1',
          cosmic: '#69358f',
          amethyst: '#9454c6',
          glow: 'rgba(215, 157, 241, 0.28)'
        },
        console: {
          bg: '#09000f',
          card: '#22102f',
          surface: '#2d1640',
          border: 'rgba(217, 157, 241, 0.18)',
          orchid: '#d79df1',
          cosmic: '#69358f',
          amethyst: '#9454c6',
          amber: '#f59e0b',
          emerald: '#10b981'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Outfit"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Syne"', 'sans-serif']
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
