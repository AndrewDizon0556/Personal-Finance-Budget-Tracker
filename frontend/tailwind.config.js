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
        // Primary brand scale — themeable via CSS vars (Ocean / Minimal / Pink).
        // Kept named "nu-blue" so every existing usage recolors with the theme.
        'nu-blue': {
          50: 'rgb(var(--c-blue-50) / <alpha-value>)',
          100: 'rgb(var(--c-blue-100) / <alpha-value>)',
          200: 'rgb(var(--c-blue-200) / <alpha-value>)',
          300: 'rgb(var(--c-blue-300) / <alpha-value>)',
          400: 'rgb(var(--c-blue-400) / <alpha-value>)',
          500: 'rgb(var(--c-blue-500) / <alpha-value>)',
          600: 'rgb(var(--c-blue-600) / <alpha-value>)',
          700: 'rgb(var(--c-blue-700) / <alpha-value>)',
          800: 'rgb(var(--c-blue-800) / <alpha-value>)',
          900: 'rgb(var(--c-blue-900) / <alpha-value>)',
          950: 'rgb(var(--c-blue-950) / <alpha-value>)',
        },
        // Accent / "gold" scale — themeable (warm gold, amber, or rose-gold).
        'nu-gold': {
          50: 'rgb(var(--c-gold-50) / <alpha-value>)',
          100: 'rgb(var(--c-gold-100) / <alpha-value>)',
          200: 'rgb(var(--c-gold-200) / <alpha-value>)',
          300: 'rgb(var(--c-gold-300) / <alpha-value>)',
          400: 'rgb(var(--c-gold-400) / <alpha-value>)',
          500: 'rgb(var(--c-gold-500) / <alpha-value>)',
          600: 'rgb(var(--c-gold-600) / <alpha-value>)',
          700: 'rgb(var(--c-gold-700) / <alpha-value>)',
          800: 'rgb(var(--c-gold-800) / <alpha-value>)',
          900: 'rgb(var(--c-gold-900) / <alpha-value>)',
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
        soft: '0 2px 8px -2px rgb(var(--sh) / 0.08), 0 4px 24px -8px rgb(var(--sh) / 0.12)',
        glow: '0 0 0 1px rgb(var(--c-gold-300) / 0.3), 0 8px 32px -8px rgb(var(--c-gold-500) / 0.4)',
        'glow-blue': '0 8px 32px -8px rgb(var(--sh) / 0.45)',
        card: '0 1px 2px rgb(16 24 40 / 0.04), 0 12px 32px -12px rgb(var(--sh) / 0.18)',
        float: '0 18px 50px -12px rgb(var(--sh) / 0.35)',
      },
      backgroundImage: {
        'nu-gradient': 'linear-gradient(135deg, rgb(var(--c-blue-700)) 0%, rgb(var(--c-blue-500)) 50%, rgb(var(--c-blue-900)) 100%)',
        'nu-gradient-gold': 'linear-gradient(135deg, rgb(var(--c-gold-400)) 0%, rgb(var(--c-gold-500)) 100%)',
        'nu-mesh':
          'radial-gradient(at 0% 0%, rgb(var(--c-blue-500) / 0.18) 0px, transparent 50%), radial-gradient(at 98% 10%, rgb(var(--c-gold-400) / 0.15) 0px, transparent 50%), radial-gradient(at 50% 100%, rgb(var(--c-blue-400) / 0.12) 0px, transparent 50%)',
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
