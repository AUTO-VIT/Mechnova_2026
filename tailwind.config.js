/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#020205',
        deep: '#06060c',
        space: {
          void: '#020205',
          deep: '#06060e',
          surface: '#0b0c16',
          border: 'rgba(56, 189, 248, 0.12)',
          blue: '#3b82f6',
          cyan: '#38bdf8',
          nebula: '#6366f1',
          indigo: '#4f46e5',
          violet: '#8b5cf6'
        },
        console: {
          bg: '#020205',
          card: '#06060e',
          surface: '#0b0c16',
          border: 'rgba(56, 189, 248, 0.12)',
          blue: '#3b82f6',
          cyan: '#38bdf8',
          amber: '#f59e0b',
          emerald: '#10b981'
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
