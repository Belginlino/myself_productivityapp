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
          DEFAULT: '#050505',
          secondary: '#0D0D0D',
          tertiary: '#141414',
        },
        card: {
          DEFAULT: 'rgba(20, 20, 20, 0.55)',
          hover: 'rgba(35, 35, 35, 0.65)',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.12)',
        },
        border: {
          DEFAULT: '#262626',
          light: '#3D3D3D',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#CFCFCF',
          muted: '#9A9A9A',
          disabled: '#666666',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(255, 255, 255, 0.04)',
        'md': '0 8px 30px rgba(255, 255, 255, 0.05)',
        'lg': '0 15px 60px rgba(255, 255, 255, 0.08)',
        'glow': '0 0 25px rgba(255, 255, 255, 0.15)',
        'glow-lg': '0 0 40px rgba(255, 255, 255, 0.25)',
      },
      backdropBlur: {
        'glass': '18px',
        'heavy': '30px',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
