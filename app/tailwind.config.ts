import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Design system tokens from prototype
        'bg-primary': '#020617',
        'bg-card': '#020617',
        'border-default': '#1f2937',
        'border-hover': '#374151',
        'text-primary': '#e5e7eb',
        'text-muted': '#9ca3af',
        'accent-blue': '#2563eb',
        'positive-green': '#22c55e',
        'negative-red': '#ef4444',
        'warning-orange': '#f97316',
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
    },
  },
  plugins: [],
};

export default config;
