import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fbfaf7',
          100: '#f7f5f0',
          200: '#f0ece2',
          300: '#e6e0d1',
          400: '#d8d1bd',
          500: '#c2b9a0',
          600: '#a89d81',
          700: '#8a7f66',
          800: '#6f6551',
          900: '#5c543f',
        },
        ink: {
          50: '#f4f7f6',
          100: '#e6ecea',
          200: '#cdd8d4',
          300: '#a9bdb7',
          400: '#7f9b94',
          500: '#5f7f78',
          600: '#4a6660',
          700: '#3d544f',
          800: '#354542',
          900: '#20302d',
          950: '#101a19',
        },
        primary: {
          50: '#edf7f4',
          100: '#d2ece5',
          200: '#a5d8cb',
          300: '#6fbeab',
          400: '#3f9e89',
          500: '#21816d',
          600: '#146957',
          700: '#0f5446',
          800: '#0d4238',
          900: '#0a342c',
        },
        accent: {
          50: '#fdf9ef',
          100: '#faf0d6',
          200: '#f4dfab',
          300: '#eccb79',
          400: '#e4b64f',
          500: '#d9a441',
          600: '#b9832e',
          700: '#946527',
          800: '#7a5224',
          900: '#684522',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,26,25,0.04), 0 4px 16px rgba(16,26,25,0.06)',
        card: '0 1px 2px rgba(16,26,25,0.05), 0 8px 28px rgba(16,26,25,0.08)',
        lift: '0 2px 4px rgba(16,26,25,0.06), 0 16px 40px rgba(16,26,25,0.12)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
    },
  },
  plugins: [],
}

export default config
