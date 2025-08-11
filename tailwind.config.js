/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'te-orange': '#FF6B00',
        'te-orange-dark': '#E55A00',
        'te-black': '#1A1A1A',
        'te-black-dark': '#0A0A0A',
        'te-gray': '#2A2A2A',
        'te-gray-light': '#3A3A3A',
        'te-gray-dark': '#1A1A1A',
        'te-white': '#FAFAFA',
        'te-slate': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'SF Mono', 'Roboto Mono', 'monospace'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-appear': 'gridAppear 0.5s ease-out',
        'mark-appear': 'markAppear 0.3s ease-out',
        'mechanical-appear': 'mechanicalAppear 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'mechanical-mark': 'mechanicalMark 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'breath': 'breath 4s ease-in-out infinite',
      },
      keyframes: {
        gridAppear: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        markAppear: {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        mechanicalAppear: {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.8) rotateX(-15deg)' 
          },
          '50%': { 
            opacity: '0.8', 
            transform: 'scale(1.05) rotateX(-5deg)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1) rotateX(0deg)' 
          },
        },
        mechanicalMark: {
          '0%': { 
            transform: 'scale(0) rotate(-180deg)', 
            opacity: '0' 
          },
          '30%': { 
            transform: 'scale(1.2) rotate(-90deg)', 
            opacity: '0.8' 
          },
          '60%': { 
            transform: 'scale(0.9) rotate(10deg)', 
            opacity: '1' 
          },
          '100%': { 
            transform: 'scale(1) rotate(0deg)', 
            opacity: '1' 
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotateX(0deg)' },
          '50%': { transform: 'translateY(-10px) rotateX(2deg)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(255, 107, 0, 0.3), 0 0 40px rgba(255, 107, 0, 0.1)' 
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(255, 107, 0, 0.5), 0 0 60px rgba(255, 107, 0, 0.2)' 
          },
        },
        breath: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
      boxShadow: {
        'hardware': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
        'hardware-button': '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
        'hardware-button-hover': '0 6px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.4)',
        'glow-orange': '0 0 20px rgba(255, 107, 0, 0.3), 0 0 40px rgba(255, 107, 0, 0.1)',
        'glow-orange-strong': '0 0 30px rgba(255, 107, 0, 0.5), 0 0 60px rgba(255, 107, 0, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      perspective: {
        '1000': '1000px',
      },
    },
  },
  plugins: [],
}
