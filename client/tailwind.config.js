/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        dark: {
          900: '#0a0e1a',
          800: '#0f1629',
          700: '#151d33',
          600: '#1e2642',
          500: '#252f4a',
          400: '#374151',
          300: '#4b5563',
        },
      },
      fontSize: {
        'hero': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'heading': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'subheading': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}
