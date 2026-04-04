import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'aegis-bg': 'var(--color-bg)',
        'aegis-surface': 'var(--color-surface)',
        'aegis-border': 'var(--color-border)',
        'aegis-accent': 'var(--color-accent)',
        'aegis-warning': 'var(--color-warning)',
        'aegis-danger': 'var(--color-danger)',
        'aegis-text': 'var(--color-text)',
        'aegis-muted': 'var(--color-text-muted)',
        'aegis-deep': 'var(--color-deep)',
        'aegis-terminal': 'var(--color-terminal)',
        'aegis-tooltip': 'var(--color-tooltip)',
        'aegis-grid': 'var(--color-grid)',
      },
      fontFamily: {
        headline: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
