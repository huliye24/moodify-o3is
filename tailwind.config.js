import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark-500': 'var(--theme-bg-base, #f0ede8)',
        'dark-400': 'var(--theme-bg-surface, #e5dfd8)',
        'dark-300': 'var(--theme-bg-elevated, #f7f4f0)',
        'dark-200': 'var(--theme-bg-surface, #e5dfd8)',
        'dark-100': 'var(--theme-bg-elevated, #f7f4f0)',
        'coil': 'var(--theme-coil-color, #a86050)',
        'lost': 'var(--theme-lost-color, #d4a574)',
        'awaken': 'var(--theme-awaken-color, #e8b86c)',
        'expand': 'var(--theme-expand-color, #d8c8b8)',
      },
      fontFamily: {
        display: ['"Noto Serif SC"', '"Cormorant Garamond"', 'serif'],
        english: ['"Cormorant Garamond"', 'serif'],
      },
      spacing: {
        'space-xs': '0.5rem',
        'space-sm': '1rem',
        'space-md': '2rem',
        'space-lg': '4rem',
        'space-xl': '8rem',
      },
      backdropBlur: {
        'glass': 'blur(20px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 10s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
