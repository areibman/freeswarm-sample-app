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
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-appear': 'gridAppear 0.5s ease-out',
        'mark-appear': 'markAppear 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'mechanical-bounce': 'mechanicalBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'depth-shift': 'depthShift 0.4s cubic-bezier(0.4, 0, 0.6, 1)',
        'industrial-spin': 'industrialSpin 0.8s cubic-bezier(0.4, 0, 0.6, 1)',
      },
      keyframes: {
        gridAppear: {
          '0%': { opacity: '0', transform: 'scale(0.9) rotateX(10deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotateX(0deg)' },
        },
        markAppear: {
          '0%': { transform: 'scale(0) rotate(-180deg) translateZ(-20px)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(10deg) translateZ(10px)' },
          '100%': { transform: 'scale(1) rotate(0deg) translateZ(0px)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateZ(0px)' },
          '50%': { transform: 'translateY(-10px) translateZ(5px)' },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 107, 0, 0.3), 0 0 40px rgba(255, 107, 0, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(255, 107, 0, 0.5), 0 0 60px rgba(255, 107, 0, 0.2)' 
          },
        },
        mechanicalBounce: {
          '0%': { transform: 'translateY(0px) translateZ(0px)' },
          '50%': { transform: 'translateY(-8px) translateZ(10px)' },
          '100%': { transform: 'translateY(0px) translateZ(0px)' },
        },
        depthShift: {
          '0%': { transform: 'translateZ(0px)' },
          '100%': { transform: 'translateZ(20px)' },
        },
        industrialSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
      backfaceVisibility: {
        'hidden': 'hidden',
      },
    },
  },
  plugins: [],
}
