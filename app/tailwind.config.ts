import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Light theme tokens
        'bg-primary': 'var(--bg-primary)',
        'bg-card': 'var(--bg-card)',
        'bg-secondary': 'var(--bg-secondary)',
        'border-default': 'var(--border-default)',
        'border-hover': 'var(--border-hover)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        // Accent colors (use CSS variables for theme support)
        'accent-blue': 'var(--accent-blue)',
        'accent-green': 'var(--accent-green)',
        'accent-purple': 'var(--accent-purple)',
        'accent-orange': 'var(--accent-orange)',
        'accent-red': 'var(--accent-red)',
        'accent-indigo': 'var(--accent-indigo)',
        'accent-current': 'var(--accent-current)',
        // Status colors
        'positive-green': 'var(--positive-green)',
        'negative-red': 'var(--negative-red)',
        'warning-orange': 'var(--warning-orange)',
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '13px',
        'md': '14px',
        'lg': '18px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        // Touch target sizes
        'touch': '48px',
        'touch-sm': '44px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '10px',
        'lg': '14px',
      },
      // Mobile-first breakpoints (Tailwind defaults, explicitly defined)
      screens: {
        'xs': '375px',   // iPhone SE
        'sm': '640px',   // Mobile landscape / small tablet
        'md': '768px',   // Tablet
        'lg': '1024px',  // Desktop
        'xl': '1280px',  // Large desktop
        '2xl': '1536px', // Extra large
      },
      // Animation for mobile interactions
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-in',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      // Safe area insets for notched devices
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      margin: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      transitionDuration: {
        'theme': '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
