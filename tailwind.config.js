/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        kopri: {
          blue: '#0066cc',
          'blue-dark': '#0052A3',
          lightblue: '#4da6ff',
          gray: '#6b7280',
        },
        'kopri-blue': '#0066CC',
        'kopri-blue-dark': '#0052A3',
      },
    },
  },
  plugins: [],
}