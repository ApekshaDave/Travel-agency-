/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark base (kept for contrast elements)
        void: '#0D1B2A',
        deep: '#162032',
        surface: '#1E2E42',
        border: 'rgba(56, 182, 240, 0.15)',
        muted: '#7A9BB5',

        // Vibrant travel palette
        coral: {
          300: '#FF9A8B',
          400: '#FF6B6B',
          500: '#EE5A5A',
          600: '#D94444',
        },
        ocean: {
          300: '#5EF3E3',
          400: '#00C9B1',
          500: '#00A896',
          600: '#008573',
        },
        sky: {
          300: '#93E8FF',
          400: '#45B7D1',
          500: '#2196B3',
          600: '#1A7A99',
        },
        sand: {
          300: '#FFE8A0',
          400: '#F7C948',
          500: '#E8A800',
          600: '#C98A00',
        },
        // Keep gold for backward compat
        gold: {
          400: '#F7C948',
          500: '#E8A800',
          600: '#C98A00',
        },
        // Tropical green
        forest: {
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
        },
        sage: {
          400: '#34D399',
        },
        // Sunset orange/pink
        sunset: {
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E8A800, #F7C948)',
        'coral-gradient': 'linear-gradient(135deg, #FF6B6B, #FF9A8B)',
        'ocean-gradient': 'linear-gradient(135deg, #00A896, #5EF3E3)',
        'sky-gradient': 'linear-gradient(135deg, #2196B3, #93E8FF)',
        'sunset-gradient': 'linear-gradient(135deg, #FF6B6B, #F7C948)',
        'travel-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #F7C948 50%, #00C9B1 100%)',
        'hero-glow': 'radial-gradient(circle at 50% 50%, rgba(0, 168, 150, 0.15), transparent 70%)',
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(232, 168, 0, 0.4)',
        'gold-sm': '0 2px 12px rgba(232, 168, 0, 0.25)',
        'coral': '0 4px 20px rgba(255, 107, 107, 0.4)',
        'coral-sm': '0 2px 12px rgba(255, 107, 107, 0.25)',
        'ocean': '0 4px 20px rgba(0, 168, 150, 0.4)',
        'ocean-sm': '0 2px 12px rgba(0, 168, 150, 0.25)',
        'sky': '0 4px 20px rgba(69, 183, 209, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'wave': 'wave 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 168, 150, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 168, 150, 0.6)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
      },
    },
  },
  plugins: [],
}
