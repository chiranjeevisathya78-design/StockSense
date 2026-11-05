/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        kindred: {
          bg: '#f7f7f5',
          ink: '#111111',
          mute: '#9a9a9a',
          sub: '#7b7b7b',
          border: '#e8e8e6',
          card: '#ffffff',
        },
        // Fallback mapping for any lingering slash classes so they render pure Kindred light
        slash: {
          obsidian: '#f7f7f5',
          onyx: '#ffffff',
          carbon: '#fafaf8',
          graphite: '#e8e8e6',
          slate: '#e8e8e6',
          smoke: '#9a9a9a',
          ash: '#7b7b7b',
          steel: '#4b5563',
          fog: '#7b7b7b',
          mist: '#4b5563',
          silver: '#f0f0ee',
          bone: '#111111',
          white: '#111111',
          copper: '#111111',
          copperGlow: 'rgba(17, 17, 17, 0.04)',
          gilded: '#10b981',
          sage: '#059669',
          sageBg: 'rgba(16, 185, 129, 0.08)',
          rose: '#e11d48',
          roseBg: 'rgba(225, 29, 72, 0.08)',
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
