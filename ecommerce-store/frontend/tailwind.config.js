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
        display: ['Oxanium', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 30px rgba(40, 167, 225, 0.25)',
        panel: '0 12px 40px rgba(5, 10, 20, 0.45)'
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
