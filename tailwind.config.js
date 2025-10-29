/** @type {import('tailwindcss').Config} */
const designTokens = require('./design-tokens.json');

// Helper function to extract the raw value from the token
const tokenValue = (token) => token.replace(/var\((--[^)]+)\)/, '$1');

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

  'accent-primary': designTokens.color['--color-primary'],
  'accent-primary-hover': '#0044cc',
  'accent-secondary': '#0d9488', // teal-600
  'accent-indigo': '#6366f1', // indigo-500
  'accent-indigo-hover': '#4f46e5', // indigo-600

  'status-success': designTokens.color['--color-success'],
  'status-error': designTokens.color['--color-error'],
  'status-warning': '#facc15', // amber-400

  // Muted colors for backgrounds, can be shared between themes
  'status-error-muted': 'rgba(220, 53, 69, 0.1)',
  'status-success-muted': 'rgba(40, 167, 69, 0.1)',

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

  'accent-primary-dark': '#3388ff',
  'accent-primary-hover-dark': designTokens.color['--color-primary'],
  'accent-secondary-dark': '#2dd4bf', // teal-400
  'accent-indigo-dark': '#818cf8', // indigo-400
  'accent-indigo-hover-dark': '#6366f1', // indigo-500

  'status-success-dark': '#34c759',
  'status-error-dark': '#ff453a',

  // Standard colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

const spacing = {
  '2xs': designTokens.spacing['--spacing-4'],
  'xs': designTokens.spacing['--spacing-8'],
  'sm': '12px',
  'md': designTokens.spacing['--spacing-16'],
  'lg': '24px',
  'xl': '32px',
  '2xl': '40px',
  '3xl': '48px',
};

const typography = {
  sans: [designTokens.font.family, 'system-ui', 'sans-serif'],
  mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
};

const fontSize = {
  'xs': '0.75rem',
  'sm': designTokens.font.sizes['--font-size-sm'],
  'base': designTokens.font.sizes['--font-size-md'],
  'lg': '1.125rem',
  'xl': designTokens.font.sizes['--font-size-lg'],
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
};

const fontWeight = {
  regular: designTokens.font.weights['--font-weight-regular'],
  medium: 500,
  semibold: 600,
  bold: designTokens.font.weights['--font-weight-bold'],
};

const borderRadius = {
  'sm': '4px',
  'md': '6px',
  'lg': '8px',
  'xl': '12px',
  'full': '9999px',
};

const boxShadow = {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

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
        'slide-in-up': 'slideInUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
