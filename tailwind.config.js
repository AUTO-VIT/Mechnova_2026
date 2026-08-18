/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#030303',
        deep: '#0a0a0c',
        console: {
          bg: '#030303',
          card: '#0a0a0c',
          surface: '#121215',
          border: 'rgba(255, 255, 255, 0.08)',
          red: '#dc2626',
          'red-bright': '#ef4444',
          amber: '#f59e0b',
          emerald: '#10b981',
          cyan: '#06b6d4'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Outfit"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Syne"', '"Outfit"', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-scan': 'radarScan 4s linear infinite',
      },
      keyframes: {
        radarScan: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
}
