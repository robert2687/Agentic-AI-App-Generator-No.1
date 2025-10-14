// This is a pseudo-config file for the Tailwind CDN.
// In a real build setup, you'd import tokens and export this module.
// For the CDN, this file's content will be used to construct the config object.

const colors = {
  // Using a flat structure for CDN compatibility as per the user's example.
  // Format: 'token-name-light/dark' to be used like `bg-surface-light dark:bg-surface-dark`.
  'background-dark': '#0f172a',
  'surface-dark': '#1e293b',
  'surface-lighter-dark': 'rgba(51, 65, 85, 0.5)',
  'surface-highlight-dark': '#334155',
  'border-dark': '#334155',
  'border-light-dark': 'rgba(51, 65, 85, 0.5)',
  'text-primary-dark': '#e2e8f0',
  'text-secondary-dark': '#94a3b8',
  'text-tertiary-dark': '#64748b',
  'accent-primary': '#38bdf8',
  'accent-primary-hover': '#0ea5e9',
  'accent-secondary': '#2dd4bf',
  'accent-indigo': '#818cf8',
  'accent-indigo-hover': '#6366f1',
  'status-success': '#4ade80',
  'status-error': '#f87171',
  'status-warning': '#facc15',
  'status-error-muted': 'rgba(244, 63, 94, 0.1)',
  'status-success-muted': 'rgba(16, 185, 129, 0.1)',
  // Add white/black for explicit overrides if needed
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
};

const fontSize = {
  'xs': '0.75rem',
  'sm': '0.875rem',
  'base': '1rem',
  'lg': '1.125rem',
  'xl': '1.25rem',
  '2xl': '1.5rem',
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
    },
  },
  plugins: [],
};
