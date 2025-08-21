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
        'te-gray-dark': '#CCCCCC',
        'te-gray-light': '#F5F5F5',
        'te-shadow': 'rgba(26, 26, 26, 0.15)',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'SF Mono', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'te-raised': '0 2px 4px rgba(26, 26, 26, 0.1), 0 1px 2px rgba(26, 26, 26, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'te-pressed': 'inset 0 2px 4px rgba(26, 26, 26, 0.15), inset 0 1px 2px rgba(26, 26, 26, 0.1)',
        'te-panel': '0 4px 8px rgba(26, 26, 26, 0.1), 0 2px 4px rgba(26, 26, 26, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'te-deep': '0 8px 16px rgba(26, 26, 26, 0.15), 0 4px 8px rgba(26, 26, 26, 0.1)',
        'te-inset': 'inset 0 2px 4px rgba(26, 26, 26, 0.1), inset 0 1px 2px rgba(26, 26, 26, 0.06)',
        'te-button-orange': '0 2px 4px rgba(255, 107, 0, 0.2), 0 1px 2px rgba(255, 107, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'te-button-black': '0 2px 4px rgba(26, 26, 26, 0.3), 0 1px 2px rgba(26, 26, 26, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'te-gradient': 'linear-gradient(135deg, #FAFAFA 0%, #E5E5E5 100%)',
        'te-gradient-button': 'linear-gradient(135deg, #F5F5F5 0%, #E5E5E5 50%, #CCCCCC 100%)',
        'te-gradient-orange': 'linear-gradient(135deg, #FF8533 0%, #FF6B00 50%, #E55A00 100%)',
        'te-gradient-black': 'linear-gradient(135deg, #333333 0%, #1A1A1A 50%, #000000 100%)',
        'te-gradient-panel': 'linear-gradient(135deg, #F8F8F8 0%, #E8E8E8 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-appear': 'gridAppear 0.5s ease-out',
        'mark-appear': 'markAppear 0.3s ease-out',
        'button-press': 'buttonPress 0.1s ease-out',
      },
      keyframes: {
        gridAppear: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateZ(0)' },
          '100%': { opacity: '1', transform: 'scale(1) translateZ(0)' },
        },
        markAppear: {
          '0%': { transform: 'scale(0) rotate(-180deg) translateZ(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(10deg) translateZ(0)' },
          '100%': { transform: 'scale(1) rotate(0deg) translateZ(0)', opacity: '1' },
        },
        buttonPress: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(1px) scale(0.98)' },
        },
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
    },
  },
  plugins: [],
}
