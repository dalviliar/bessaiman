import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        steel: {
          darkest: '#0F172A',
          dark: '#F0F4F8',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#CBD5E1',
          blue: '#1565C0',
          'blue-light': '#1E88E5',
          silver: '#64748B',
          'silver-light': '#94A3B8',
          accent: '#0284C7',
          gold: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'steel-gradient': 'linear-gradient(135deg, #0A0F1C 0%, #111827 50%, #0A0F1C 100%)',
        'steel-card': 'linear-gradient(145deg, #1A2235 0%, #141C2E 100%)',
        'steel-sheen': 'linear-gradient(90deg, transparent 0%, rgba(0,176,255,0.05) 50%, transparent 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 20% 50%, rgba(21,101,192,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,176,255,0.1) 0%, transparent 50%)',
      },
      animation: {
        'sheen': 'sheen 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        sheen: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        scan: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'steel': '0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        'steel-hover': '0 8px 30px rgba(0,176,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
        'accent-glow': '0 0 20px rgba(0,176,255,0.3)',
      },
    },
  },
  plugins: [],
}

export default config
