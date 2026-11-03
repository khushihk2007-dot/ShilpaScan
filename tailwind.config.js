/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FDF8F1',
        'cream-dark': '#F5EDE0',
        terracotta: '#C2410C',
        'terracotta-light': '#EA580C',
        'terracotta-dark': '#9A3412',
        sand: '#E8DCCC',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scan-laser': {
          '0%, 100%': { transform: 'translateY(-105px)', opacity: '0.85' },
          '50%': { transform: 'translateY(105px)', opacity: '0.85' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(194,65,12,0.25)' },
          '50%': { boxShadow: '0 0 0 14px rgba(194,65,12,0)' },
        },
        'card-rise': {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'scan-laser': 'scan-laser 2.2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 60s linear infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'card-rise': 'card-rise 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
};
