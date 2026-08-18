/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          black: '#000000',
          dark: '#09090b',
          surface: '#18181b',
          border: '#27272a',
          red: '#dc2626',
          'red-bright': '#ef4444',
          'red-dark': '#991b1b',
          'red-dim': '#450a0a',
          steel: '#3f3f46',
          muted: '#a1a1aa',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Space Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
