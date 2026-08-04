/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#09090b',
          secondary: '#121215',
          tertiary: '#18181c',
        },
        card: {
          DEFAULT: 'rgba(24, 24, 28, 0.65)',
          hover: 'rgba(32, 32, 38, 0.75)',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.04)',
          border: 'rgba(255, 255, 255, 0.10)',
        },
        streak: {
          from: '#f59e0b',
          to: '#ea580c',
        },
        completion: {
          from: '#10b981',
          to: '#14b8a6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'md': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'lg': '0 15px 50px rgba(0, 0, 0, 0.22)',
        'glow-amber': '0 0 30px rgba(245, 158, 11, 0.25)',
        'glow-emerald': '0 0 30px rgba(16, 185, 129, 0.25)',
        'glow-slate': '0 0 30px rgba(255, 255, 255, 0.12)',
      },
      backdropBlur: {
        'glass': '20px',
        'heavy': '32px',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
