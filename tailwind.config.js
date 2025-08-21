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
        'te-orange-light': '#FF8533',
        'te-black': '#1A1A1A',
        'te-gray': '#E5E5E5',
        'te-gray-dark': '#C4C4C4',
        'te-white': '#FAFAFA',
        'te-shadow': '#0A0A0A',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'SF Mono', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'te-3d': '4px 4px 0px 0px #1A1A1A',
        'te-3d-sm': '2px 2px 0px 0px #1A1A1A',
        'te-3d-lg': '6px 6px 0px 0px #1A1A1A',
        'te-3d-orange': '4px 4px 0px 0px #E55A00',
        'te-3d-pressed': '1px 1px 0px 0px #1A1A1A',
        'te-inner': 'inset 2px 2px 4px rgba(0,0,0,0.1)',
        'te-elevated': '0 8px 16px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-appear': 'gridAppear 0.5s ease-out',
        'mark-appear': 'markAppear 0.3s ease-out',
        'float-3d': 'float3d 3s ease-in-out infinite',
        'press-3d': 'press3d 0.15s ease-out',
      },
      keyframes: {
        gridAppear: {
          '0%': { opacity: '0', transform: 'scale(0.9) perspective(1000px) rotateX(15deg)' },
          '100%': { opacity: '1', transform: 'scale(1) perspective(1000px) rotateX(0deg)' },
        },
        markAppear: {
          '0%': { transform: 'scale(0) rotate(-180deg) translateZ(50px)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(10deg) translateZ(25px)' },
          '100%': { transform: 'scale(1) rotate(0deg) translateZ(0px)', opacity: '1' },
        },
        float3d: {
          '0%, 100%': { transform: 'translateY(0px) translateZ(0px)' },
          '50%': { transform: 'translateY(-5px) translateZ(10px)' },
        },
        press3d: {
          '0%': { transform: 'translateY(0px) translateX(0px)' },
          '100%': { transform: 'translateY(2px) translateX(2px)' },
        },
      },
      transformStyle: {
        '3d': 'preserve-3d',
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
    },
  },
  plugins: [],
}
