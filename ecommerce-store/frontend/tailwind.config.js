/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem'
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1240px'
      }
    },
    extend: {
      colors: {
        // Surfaces
        canvas: '#ffffff',
        panel: '#ffffff',
        panelStrong: '#f3f7fa',
        mist: '#f3f7fa',
        line: '#e4e7eb',
        lineStrong: '#bcbdc0',
        // Text
        ink: '#231f20',
        muted: '#5e6166',
        // Logo palette
        brand: '#24aae1',
        brandSoft: '#e3f4fb',
        silver: '#bcbdc0',
        charcoal: '#231f20',
        // Interactive blue (logo blue, deepened for readable text/buttons)
        accent: '#0a76ab',
        accentHover: '#086a9b',
        // Warnings (out of stock, errors)
        accentWarm: '#b4461b',
        success: '#1f7a4d'
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(35, 31, 32, 0.04), 0 8px 24px -12px rgba(35, 31, 32, 0.12)',
        lift: '0 2px 4px rgba(35, 31, 32, 0.04), 0 18px 40px -16px rgba(10, 118, 171, 0.28)',
        panel: '0 1px 2px rgba(35, 31, 32, 0.04)'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
};
