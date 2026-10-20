import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        foreground: '#f4f4f5',
        card: {
          DEFAULT: '#121216',
          foreground: '#f4f4f5',
        },
        popover: {
          DEFAULT: '#121216',
          foreground: '#f4f4f5',
        },
        primary: {
          DEFAULT: '#e11d48',
          foreground: '#ffffff',
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        secondary: {
          DEFAULT: '#18181b',
          foreground: '#f4f4f5',
        },
        muted: {
          DEFAULT: '#27272a',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#e11d48',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#7f1d1d',
          foreground: '#fecaca',
        },
        border: '#27272a',
        input: '#27272a',
        ring: '#e11d48',
        midnight: {
          950: '#050507',
          900: '#09090b',
          800: '#121216',
          700: '#18181b',
          600: '#27272a',
        },
        crimson: {
          DEFAULT: '#e11d48',
          glow: 'rgba(225, 29, 72, 0.45)',
          muted: 'rgba(225, 29, 72, 0.15)',
        },
      },
      boxShadow: {
        'crimson-glow': '0 0 25px -5px rgba(225, 29, 72, 0.45)',
        'crimson-sm': '0 0 12px -2px rgba(225, 29, 72, 0.35)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.8)',
      },
      backgroundImage: {
        'crimson-radial': 'radial-gradient(circle at top, rgba(225, 29, 72, 0.15), transparent 70%)',
        'fantasy-hero': 'linear-gradient(180deg, #121216 0%, #09090b 100%)',
      },
    },
  },
  plugins: [],
}

export default config
