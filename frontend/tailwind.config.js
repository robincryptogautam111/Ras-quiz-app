/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff4ee',
          100: '#ffe6d5',
          200: '#ffc9a8',
          300: '#ffa070',
          400: '#ff6a37',
          500: '#ff4d00',
          600: '#e63d00',
          700: '#c43000',
          800: '#9c2700',
          900: '#7a2000',
        }
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['Inconsolata', 'monospace'],
        devanagari: ['Noto Sans Devanagari', 'DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-sm': 'bounceSm 0.5s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceSm: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
      }
    }
  },
  plugins: []
}
