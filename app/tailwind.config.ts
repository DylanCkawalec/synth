import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'monospace'],
      },
      colors: {
        s: {
          bg: '#0a0c10',
          surface: '#12151c',
          panel: '#1a1e28',
          elevated: '#232836',
          border: '#2a2f3e',
          text: '#e2e4ea',
          muted: '#8b90a0',
          accent: '#00d4aa',
          green: '#22c55e',
          warn: '#f59e0b',
          danger: '#ef4444',
          blue: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
