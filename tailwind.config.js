/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#070B14',
          900: '#0B1020',
          800: '#0F1629',
          700: '#141D35',
          600: '#1A2540',
          500: '#22304F',
        },
        accent: {
          DEFAULT: '#00C2FF',
          hover: '#00A8DC',
          dim: 'rgba(0,194,255,0.12)',
          glow: 'rgba(0,194,255,0.25)',
        },
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#3B82F6',
      },
      boxShadow: {
        'accent-glow': '0 0 20px rgba(0,194,255,0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
