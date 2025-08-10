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
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'SF Mono', 'Roboto Mono', 'monospace'],
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-appear': 'gridAppear 0.5s ease-out',
        'mark-appear': 'markAppear 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'float-more-delayed': 'float 6s ease-in-out infinite 4s',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
        float: {
          '0%, 100%': { transform: 'translateZ(0) translateY(0px)' },
          '50%': { transform: 'translateZ(8px) translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(255, 107, 0, 0.4)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 0 8px rgba(255, 107, 0, 0)',
            transform: 'scale(1.02)',
          },
        },
        slideIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px) translateZ(0)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) translateZ(0)',
          },
        },
        scaleIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.8) translateZ(0)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1) translateZ(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
