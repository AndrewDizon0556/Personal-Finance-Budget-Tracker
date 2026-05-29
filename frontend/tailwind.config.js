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
        // NU Laguna royal blue
        'nu-blue': {
          50: '#f0f2fa',
          100: '#dde2f4',
          200: '#c0c9ea',
          300: '#97a4da',
          400: '#6b7cc6',
          500: '#4d5db4',
          600: '#3d4a9c',
          700: '#35408e', // brand primary
          800: '#2b3470',
          900: '#232a57',
          950: '#161a38',
        },
        // NU Laguna gold
        'nu-gold': {
          50: '#fffbeb',
          100: '#fff4c6',
          200: '#ffe888',
          300: '#ffd633',
          400: '#ffc91a',
          500: '#f5b300', // brand gold
          600: '#d99000',
          700: '#b36b00',
          800: '#925406',
          900: '#7c4509',
        },
        // Themeable surface tokens (driven by CSS vars for dark/light)
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-soft': 'rgb(var(--surface-soft) / <alpha-value>)',
        'surface-border': 'rgb(var(--surface-border) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--ink-soft) / <alpha-value>)',
        'ink-faint': 'rgb(var(--ink-faint) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-soft': 'rgb(var(--accent-soft) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgb(53 64 142 / 0.08), 0 4px 24px -8px rgb(53 64 142 / 0.12)',
        glow: '0 0 0 1px rgb(255 201 26 / 0.3), 0 8px 32px -8px rgb(245 179 0 / 0.4)',
        'glow-blue': '0 8px 32px -8px rgb(53 64 142 / 0.45)',
        card: '0 1px 2px rgb(16 24 40 / 0.04), 0 12px 32px -12px rgb(53 64 142 / 0.18)',
        float: '0 18px 50px -12px rgb(53 64 142 / 0.35)',
      },
      backgroundImage: {
        'nu-gradient': 'linear-gradient(135deg, #35408e 0%, #4d5db4 50%, #232a57 100%)',
        'nu-gradient-gold': 'linear-gradient(135deg, #ffc91a 0%, #f5b300 100%)',
        'nu-mesh':
          'radial-gradient(at 0% 0%, rgb(53 64 142 / 0.18) 0px, transparent 50%), radial-gradient(at 98% 10%, rgb(255 201 26 / 0.15) 0px, transparent 50%), radial-gradient(at 50% 100%, rgb(77 93 180 / 0.12) 0px, transparent 50%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-16px) rotate(-1.5deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.1)', opacity: '0' },
          '100%': { transform: 'scale(1.1)', opacity: '0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'pulse-ring': 'pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
