/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#080C14',
        deep: '#0D1421',
        muted: '#94A3B8',
        gold: {
          400: '#F5D98A',
          500: '#E8B429',
          600: '#D9A310',
        },
        sky: {
          400: '#38B6F0',
        },
        sage: {
          400: '#4ade80',
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to right, #E8B429, #F5D98A)',
        'hero-glow': 'radial-gradient(circle at 50% 50%, rgba(232, 180, 41, 0.1), transparent 70%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(232, 180, 41, 0.3)',
        'gold-sm': '0 0 10px rgba(232, 180, 41, 0.2)',
        'sky': '0 0 20px rgba(56, 182, 240, 0.3)',
      },
    },
  },
  plugins: [],
}

