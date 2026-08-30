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
        stone: {
          750: '#23201d',
          850: '#1c1917',
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
        'brand': '0 24px 70px rgba(47, 28, 10, 0.13)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pageFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scrollMarquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.2)' },
        },
        sweep: {
          '0%': { left: '-100%' },
          '30%': { left: '100%' },
          '100%': { left: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        floatDelayed: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(8px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        scaleUp: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pageFadeIn: 'pageFadeIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        marquee: 'scrollMarquee 28s linear infinite',
        pulseDot: 'pulseDot 2s infinite',
        sweep: 'sweep 4s infinite',
        float: 'float 5s ease-in-out infinite',
        'float-delayed': 'floatDelayed 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}