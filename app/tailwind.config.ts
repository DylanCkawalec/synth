import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        sfxStageReveal: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'sfx-stage-reveal': 'sfxStageReveal 0.35s ease',
      },
      boxShadow: {
        'sfx-glow': '0 2px 16px rgba(0, 212, 170, 0.22)',
        'sfx-panel': '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
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
