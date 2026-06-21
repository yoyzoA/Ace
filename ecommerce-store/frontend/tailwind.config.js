/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        lg: '2rem',
        xl: '3rem'
      }
    },
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        panel: 'var(--color-panel)',
        panelStrong: 'var(--color-panel-strong)',
        line: 'var(--color-line)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
        accentWarm: 'var(--color-accent-warm)'
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 8px 20px rgba(79, 142, 247, 0.25)',
        panel: '0 12px 30px rgba(2, 6, 16, 0.35)'
      }
    }
  },
  plugins: []
};
