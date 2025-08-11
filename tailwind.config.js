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
        'te-blue': '#0066FF',
        'te-green': '#00CC66',
        'te-red': '#FF3366',
        'te-yellow': '#FFCC00',
        'device-body': '#EEEEEE',
        'device-shadow': '#CCCCCC',
        'button-raised': '#F8F8F8',
        'button-pressed': '#DDDDDD',
        'screen-dark': '#0A0A0A',
        'screen-glow': '#00FF88',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'SF Mono', 'Roboto Mono', 'monospace'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hardware': '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
        'hardware-lg': '0 8px 16px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)',
        'hardware-xl': '0 12px 24px rgba(0, 0, 0, 0.25), 0 6px 12px rgba(0, 0, 0, 0.2)',
        'inset-deep': 'inset 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        'inset-shallow': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        'button-raised': '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'button-pressed': 'inset 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.1)',
        'screen': 'inset 0 2px 6px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'device': '0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-appear': 'gridAppear 0.5s ease-out',
        'mark-appear': 'markAppear 0.3s ease-out',
        'button-press': 'buttonPress 0.1s ease-out',
        'device-startup': 'deviceStartup 1s ease-out',
        'screen-flicker': 'screenFlicker 2s ease-in-out infinite',
      },
      keyframes: {
        gridAppear: {
          '0%': { opacity: '0', transform: 'scale(0.9) rotateX(10deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotateX(0deg)' },
        },
        markAppear: {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        buttonPress: {
          '0%': { transform: 'translateY(0px)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
          '50%': { transform: 'translateY(1px)', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)' },
          '100%': { transform: 'translateY(0px)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
        },
        deviceStartup: {
          '0%': { opacity: '0', transform: 'perspective(1000px) rotateX(20deg) scale(0.8)' },
          '100%': { opacity: '1', transform: 'perspective(1000px) rotateX(0deg) scale(1)' },
        },
        screenFlicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.98' },
        },
      },
      perspective: {
        '1000': '1000px',
        '1500': '1500px',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
    },
  },
  plugins: [],
}
