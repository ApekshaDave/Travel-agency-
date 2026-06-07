/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Surfaces (light theme) ────────────────────────────────────
        bg:       '#F0F4FA',
        surface:  '#FFFFFF',
        'surface-sub': '#EEF3FA',
        card:     '#FFFFFF',

        // ── Dark base (kept for dark sections / staff pages) ──────────
        void:   '#061022',
        deep:   '#0E1E38',
        // 'surface' redefined above for light, keep 'dark-surface' alias
        'dark-surface': '#1E2E42',
        border:   '#DDE4EF',
        muted:    '#64748B',

        // ── Brand blue ────────────────────────────────────────────────
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1A6EBD',
          700: '#1D4ED8',
          800: '#1558A0',
          900: '#1E3A8A',
        },

        // ── Accent orange ─────────────────────────────────────────────
        accent: {
          50:  '#FFF5F0',
          100: '#FFE8DC',
          200: '#FFC9AC',
          300: '#FF9E77',
          400: '#FF7A52',
          500: '#FF6B35',
          600: '#E8561F',
          700: '#C94610',
        },

        // ── Warm amber ────────────────────────────────────────────────
        warm: {
          300: '#FDE68A',
          400: '#FBD04A',
          500: '#F59E0B',
          600: '#D97706',
        },

        // ── Success green ─────────────────────────────────────────────
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },

        // ── Warning amber ─────────────────────────────────────────────
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },

        // ── Error red ─────────────────────────────────────────────────
        error: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
        },

        // ── Backward-compat aliases ───────────────────────────────────
        coral: {
          300: '#FF9E77',
          400: '#FF6B35',
          500: '#E8561F',
          600: '#C94610',
        },
        ocean: {
          300: '#93C5FD',
          400: '#2563EB',
          500: '#1A6EBD',
          600: '#1558A0',
        },
        sky: {
          300: '#BAE6FD',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        sand: {
          300: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        gold: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        forest: {
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
        },
        sage: { 400: '#34D399' },
        sunset: {
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
        },
      },

      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      backgroundImage: {
        // Primary CTAs
        'brand-gradient':  'linear-gradient(135deg, #1A6EBD, #2563EB)',
        'accent-gradient': 'linear-gradient(135deg, #FF6B35, #FF8C5A)',
        'warm-gradient':   'linear-gradient(135deg, #F59E0B, #FBD04A)',
        // Multi-color travel gradient
        'travel-gradient': 'linear-gradient(135deg, #1A6EBD 0%, #FF6B35 50%, #F59E0B 100%)',
        // Hero (dark)
        'hero-glow':       'radial-gradient(ellipse at 30% 40%, rgba(26,110,189,0.2) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(255,107,53,0.12) 0%, transparent 55%)',
        // Backward compat
        'gold-gradient':   'linear-gradient(135deg, #FF6B35, #FFB347)',
        'coral-gradient':  'linear-gradient(135deg, #FF6B35, #FF8C5A)',
        'ocean-gradient':  'linear-gradient(135deg, #1A6EBD, #2563EB)',
        'sky-gradient':    'linear-gradient(135deg, #0EA5E9, #BAE6FD)',
        'sunset-gradient': 'linear-gradient(135deg, #FF6B35, #F59E0B)',
      },

      boxShadow: {
        'brand':    '0 4px 20px rgba(26, 110, 189, 0.4)',
        'brand-sm': '0 2px 12px rgba(26, 110, 189, 0.25)',
        'accent':   '0 4px 20px rgba(255, 107, 53, 0.4)',
        'accent-sm':'0 2px 12px rgba(255, 107, 53, 0.25)',
        'card':     '0 1px 4px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)',
        'card-hover':'0 8px 32px rgba(26,110,189,0.12), 0 4px 12px rgba(15,23,42,0.06)',
        // Backward compat
        'gold':     '0 4px 20px rgba(255, 107, 53, 0.4)',
        'gold-sm':  '0 2px 12px rgba(255, 107, 53, 0.25)',
        'coral':    '0 4px 20px rgba(255, 107, 53, 0.4)',
        'ocean':    '0 4px 20px rgba(26, 110, 189, 0.4)',
        'ocean-sm': '0 2px 12px rgba(26, 110, 189, 0.25)',
        'sky':      '0 4px 20px rgba(56, 189, 248, 0.3)',
      },

      animation: {
        'float':       'float 6s ease-in-out infinite',
        'float-slow':  'float 9s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'slide-up':    'slideUp 0.5s ease-out',
        'wave':        'wave 2s ease-in-out infinite',
        'shimmer':     'shimmer 3s linear infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(26, 110, 189, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(26, 110, 189, 0.6)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        shimmer: {
          to: { backgroundPosition: '300% center' },
        },
      },
    },
  },
  plugins: [],
}
