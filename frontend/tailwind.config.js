/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Adyapan Brand Colors
        'adya-navy': {
          DEFAULT: '#1a1a2e',
          dark: '#14162a',
          darker: '#0d0d1a',
        },
        'adya-orange': {
          DEFAULT: '#ffa800',
          light: '#ffb733',
          dark: '#e69500',
          darker: '#cc7700',
        },
        // Adyapan Warm Cream (light bg)
        'adya-cream': {
          DEFAULT: '#f5f0eb',
          light: '#fdfaf6',
          dark: '#f0e8df',
        },
        primary: {
          50: '#fff8e6',
          100: '#ffedb3',
          200: '#ffdf80',
          300: '#ffd04d',
          400: '#ffc229',
          500: '#ffa800',
          600: '#e69500',
          700: '#cc7700',
          800: '#a85e00',
          900: '#7a4400',
        },
        secondary: {
          50: '#f0f0f8',
          100: '#d4d4ec',
          200: '#a9a9d9',
          300: '#7e7ec6',
          400: '#5353b3',
          500: '#2b2b8c',
          600: '#1a1a6e',
          700: '#14162a',
          800: '#0f1020',
          900: '#0a0b15',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 4px rgba(26,26,46,0.06)',
        'card-hover': '0 4px 20px rgba(255,168,0,0.12)',
        'orange-glow': '0 4px 14px rgba(255,168,0,0.35)',
        'orange-glow-lg': '0 6px 24px rgba(255,168,0,0.45)',
      },
    },
  },
  plugins: [],
}