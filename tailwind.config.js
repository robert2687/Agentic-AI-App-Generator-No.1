// This is a pseudo-config file for the Tailwind CDN.
// In a real build setup, you'd import tokens and export this module.
// For the CDN, this file's content will be used to construct the config object.

const colors = {
  // Light Theme (Default)
  background: '#f8fafc', // slate-50
  surface: '#ffffff',
  'surface-lighter': '#f1f5f9', // slate-100
  'surface-highlight': '#e2e8f0', // slate-200
  border: '#cbd5e1', // slate-300
  'border-light': '#e2e8f0', // slate-200
  'text-primary': '#1e293b', // slate-800
  'text-secondary': '#475569', // slate-600
  'text-tertiary': '#94a3b8', // slate-400

  'accent-primary': '#0ea5e9', // sky-500
  'accent-primary-hover': '#0284c7', // sky-600
  'accent-secondary': '#0d9488', // teal-600
  'accent-indigo': '#6366f1', // indigo-500
  'accent-indigo-hover': '#4f46e5', // indigo-600

  'status-success': '#16a34a', // green-600
  'status-error': '#dc2626', // red-600
  'status-warning': '#facc15', // amber-400 (kept yellow for visibility in both themes)
  
  // Muted colors for backgrounds, can be shared between themes
  'status-error-muted': 'rgba(244, 63, 94, 0.1)',
  'status-success-muted': 'rgba(16, 185, 129, 0.1)',
  
  // Specific dark theme colors for use with dark: prefix
  'background-dark': '#0f172a',
  'surface-dark': '#1e293b',
  'surface-lighter-dark': 'rgba(51, 65, 85, 0.5)',
  'surface-highlight-dark': '#334155',
  'border-dark': '#334155',
  'border-light-dark': 'rgba(51, 65, 85, 0.5)',
  'text-primary-dark': '#e2e8f0',
  'text-secondary-dark': '#94a3b8',
  'text-tertiary-dark': '#64748b',
  
  'accent-primary-dark': '#38bdf8', // sky-400 (lighter for dark bg)
  'accent-primary-hover-dark': '#0ea5e9', // sky-500
  'accent-secondary-dark': '#2dd4bf', // teal-400
  'accent-indigo-dark': '#818cf8', // indigo-400
  'accent-indigo-hover-dark': '#6366f1', // indigo-500

  'status-success-dark': '#4ade80', // green-400
  'status-error-dark': '#f87171', // red-400

  // Standard colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

const spacing = {
  '2xs': '4px',
  'xs': '8px',
  'sm': '12px',
  'md': '16px',
  'lg': '24px',
  'xl': '32px',
};

const typography = {
  sans: ["'Inter'", 'system-ui', 'sans-serif'],
  mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
};

const fontSize = {
  'xs': '0.75rem',
  'sm': '0.875rem',
  'base': '1rem',
  'lg': '1.125rem',
  'xl': '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
};

const fontWeight = {
  'regular': 400,
  'medium': 500,
  'semibold': 600,
  'bold': 700,
};

const borderRadius = {
  'sm': '4px',
  'md': '6px',
  'lg': '8px',
  'full': '9999px',
};

const boxShadow = {
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};


/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: colors,
      spacing: spacing,
      fontFamily: typography,
      fontSize: fontSize,
      fontWeight: fontWeight,
      borderRadius: borderRadius,
      boxShadow: boxShadow,
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
};
