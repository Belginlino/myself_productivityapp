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
        background: '#1B2435',
        surface: {
          DEFAULT: '#23324A',
          hover: '#2C3E5B',
          light: '#2E405E',
        },
        card: {
          green: '#C9F48A',
          blue: '#37C7F4',
          purple: '#D9C8F2',
          dark: '#23324A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A8B3C7',
          muted: '#6B7A90',
        },
        accent: {
          DEFAULT: '#C9F48A',
          dark: '#b1e06d',
        },
        success: '#76E56A',
        danger: '#FF5D73',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.25)',
        'md': '0 8px 30px rgba(0, 0, 0, 0.35)',
        'lg': '0 15px 50px rgba(0, 0, 0, 0.5)',
        'glow-accent': '0 0 25px rgba(201, 244, 138, 0.25)',
        'glow-blue': '0 0 25px rgba(55, 199, 244, 0.25)',
        'glow-purple': '0 0 25px rgba(217, 200, 242, 0.25)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
    },
  },
  plugins: [],
};

