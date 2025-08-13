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
        'te-black': '#1A1A1A',
        'te-gray': '#E5E5E5',
        'te-white': '#FAFAFA',
        'te-dark-gray': '#2A2A2A',
        'te-light-gray': '#F5F5F5',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'SF Mono', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'te-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        'te-raised': '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
        'te-deep': '0 8px 16px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)',
        'te-hardware': '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'te-button': '0 4px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'te-button-pressed': 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-appear': 'gridAppear 0.8s ease-out',
        'mark-appear': 'markAppear 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'float': 'float 6s ease-in-out infinite',
        'tilt': 'tilt 0.3s ease-out',
        'press': 'press 0.15s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gridAppear: {
          '0%': { 
            opacity: '0', 
            transform: 'perspective(1000px) rotateX(30deg) rotateY(-10deg) scale(0.8)',
            filter: 'blur(4px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
            filter: 'blur(0px)'
          },
        },
        markAppear: {
          '0%': { 
            transform: 'scale(0) rotate(-180deg)', 
            opacity: '0',
            filter: 'blur(2px)'
          },
          '50%': { 
            transform: 'scale(1.2) rotate(10deg)',
            filter: 'blur(1px)'
          },
          '100%': { 
            transform: 'scale(1) rotate(0deg)', 
            opacity: '1',
            filter: 'blur(0px)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        tilt: {
          '0%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' },
          '50%': { transform: 'perspective(1000px) rotateX(-5deg) rotateY(5deg)' },
          '100%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' },
        },
        press: {
          '0%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(2px) scale(0.98)' },
          '100%': { transform: 'translateY(0px) scale(1)' },
        },
        glow: {
          '0%': { box-shadow: '0 0 20px rgba(255, 107, 0, 0.3)' },
          '100%': { box-shadow: '0 0 30px rgba(255, 107, 0, 0.6)' },
        },
      },
      perspective: {
        '1000': '1000px',
        '1500': '1500px',
      },
    },
  },
  plugins: [],
}
