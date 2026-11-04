/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slash: {
          obsidian: '#08080a',
          onyx: '#040406',
          carbon: '#121317',
          graphite: '#1c1d22',
          slate: '#2e3038',
          smoke: '#464853',
          ash: '#5e616e',
          steel: '#777a88',
          fog: '#9194a1',
          mist: '#acafb9',
          silver: '#c7c9d1',
          bone: '#e2e3e9',
          white: '#ffffff',
          copper: '#cc9166',
          copperGlow: 'rgba(204, 145, 102, 0.15)',
          gilded: '#ae9357',
          sage: '#4ade80',
          sageBg: 'rgba(74, 222, 128, 0.08)',
          rose: '#f87171',
          roseBg: 'rgba(248, 113, 113, 0.08)',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"DM Serif Display"', '"Ivy Presto"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        'card': '10px',
        'pill': '9999px',
        'nav': '2px',
      },
      backgroundImage: {
        'gilded-gradient': 'linear-gradient(103deg, rgb(174, 147, 87), rgb(255, 240, 204) 40%, rgb(174, 147, 87) 70%, rgba(189, 157, 79, 0))',
      }
    },
  },
  plugins: [],
}
