/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium dark navy — primary surface
        navy: {
          50:  '#f3f5fa',
          100: '#e6eaf4',
          200: '#c3cce0',
          300: '#8b9bbf',
          400: '#5b6fa3',
          500: '#3a4f87',
          600: '#283a6b',
          700: '#1d2c52',
          800: '#142142',
          900: '#0d1733',
          950: '#070d1f',
        },
        // Gold/orange accents — warmth, India edtech feeling
        gold: {
          50:  '#fffaeb',
          100: '#fff1c5',
          200: '#ffe089',
          300: '#ffc94d',
          400: '#ffb020',
          500: '#f59008',
          600: '#d96d03',
          700: '#b34c07',
          800: '#923d0d',
          900: '#78320e',
        },
        // Legacy "brand" alias points to gold so old classnames still work
        brand: {
          50:  '#fffaeb',
          100: '#fff1c5',
          200: '#ffe089',
          300: '#ffc94d',
          400: '#ffb020',
          500: '#f59008',
          600: '#d96d03',
          700: '#b34c07',
          800: '#923d0d',
          900: '#78320e',
        },
      },
      fontFamily: {
        // Clean professional pairing — Sora display + Inter body
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Inconsolata', 'monospace'],
        devanagari: ['Noto Sans Devanagari', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 30px -8px rgba(255,176,32,0.45)',
        'glow-navy': '0 0 30px -8px rgba(40,58,107,0.55)',
        'card': '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px -4px rgba(20,33,66,0.08)',
        'card-dark': '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -4px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-sm':  'bounceSm 0.5s ease',
        'shimmer':    'shimmer 2.2s linear infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceSm:  { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
        shimmer:   { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    }
  },
  plugins: []
}
