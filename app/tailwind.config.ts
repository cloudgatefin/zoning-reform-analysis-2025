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
      },
      borderRadius: {
        'sm': '8px',
        'md': '10px',
        'lg': '14px',
      },
      transitionDuration: {
        'theme': '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
