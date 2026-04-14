/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          100: '#1e293b',
          200: '#1a2234',
          300: '#151c2c',
          400: '#111827',
          500: '#0f172a',
        },
        moodify: {
          'deep':   '#6B7A8F',
          'mid':    '#8B9EB7',
          'light':  '#A8B8C9',
          'pale':   '#C4D4E4',
          'bg':     '#0a0a0f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Microsoft YaHei', 'PingFang SC', 'sans-serif'],
        serif: ["'Cormorant Garamond'", "'Noto Serif SC'", 'Georgia', 'serif'],
      },
      animation: {
        'wave': 'waveMove 3s ease-in-out infinite',
        'float': 'floatParticle 8s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        waveMove: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(8px)' },
        },
        floatParticle: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0.3' },
          '50%': { transform: 'translateY(-30px) translateX(10px)', opacity: '0.6' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
