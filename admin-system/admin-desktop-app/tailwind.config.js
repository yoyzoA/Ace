/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans Variable"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['"Outfit Variable"', '"Segoe UI"', 'system-ui', 'sans-serif']
      },
      colors: {
        canvas: token('canvas'),
        panel: token('panel'),
        sunken: token('sunken'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        brand: token('brand'),
        accent: token('accent'),
        accentSoft: token('accent-soft'),
        sidebar: token('sidebar'),
        warn: token('warn'),
        warnSoft: token('warn-soft'),
        danger: token('danger'),
        dangerSoft: token('danger-soft'),
        success: token('success'),
        successSoft: token('success-soft')
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.06), 0 1px 1px rgb(15 23 42 / 0.03)',
        pop: '0 24px 48px -16px rgb(15 23 42 / 0.35)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } }
      },
      animation: {
        'fade-up': 'fade-up 0.25s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out'
      }
    }
  },
  plugins: []
};
