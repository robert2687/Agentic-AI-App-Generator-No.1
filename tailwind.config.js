/** @type {import('tailwindcss').Config} */
const designTokens = require('./design-tokens.json');

const colors = {
  // Light Theme (Default)
  background: '#f8fafc', // slate-50
  surface: '#ffffff',
  'surface-highlight': '#f1f5f9', // slate-100
  border: '#e5e7eb', // gray-200
  'text-primary': '#111827', // gray-900
  'text-secondary': '#6b7280', // gray-500
  'text-tertiary': '#9ca3af', // gray-400

  primary: {
    50: designTokens.color['--color-primary-50'],
    100: designTokens.color['--color-primary-100'],
    200: designTokens.color['--color-primary-200'],
    300: designTokens.color['--color-primary-300'],
    400: designTokens.color['--color-primary-400'],
    500: designTokens.color['--color-primary-500'],
    600: designTokens.color['--color-primary-600'],
    700: designTokens.color['--color-primary-700'],
    800: designTokens.color['--color-primary-800'],
    900: designTokens.color['--color-primary-900'],
    950: designTokens.color['--color-primary-950'],
  },
  
  green: designTokens.color.green,
  red: designTokens.color.red,
  orange: designTokens.color.orange,

  'status-success': designTokens.color['--color-success'],
  'status-error': designTokens.color['--color-error'],
  'status-warning': designTokens.color['--color-warning'],

  // Dark Theme
  'background-dark': '#030712', // gray-950
  'surface-dark': '#1f2937', // gray-800
  'surface-highlight-dark': '#374151', // gray-700
  'border-dark': '#374151', // gray-700
  'text-primary-dark': '#f9fafb', // gray-50
  'text-secondary-dark': '#9ca3af', // gray-400
  'text-tertiary-dark': '#6b7280', // gray-500

  // Standard colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

const spacing = {
  '1': designTokens.spacing['--spacing-1'],
  '2': designTokens.spacing['--spacing-2'],
  '3': designTokens.spacing['--spacing-3'],
  '4': designTokens.spacing['--spacing-4'],
  '5': designTokens.spacing['--spacing-5'],
  '6': designTokens.spacing['--spacing-6'],
};

const typography = {
  sans: [designTokens.font.family.sans, 'system-ui', 'sans-serif'],
  mono: [designTokens.font.family.mono, 'ui-monospace', 'monospace'],
};

const fontSize = {
  'xs': designTokens.font.sizes['--font-size-xs'],
  'sm': designTokens.font.sizes['--font-size-sm'],
  'base': designTokens.font.sizes['--font-size-base'],
  'lg': designTokens.font.sizes['--font-size-lg'],
  'xl': designTokens.font.sizes['--font-size-xl'],
  '2xl': designTokens.font.sizes['--font-size-2xl'],
};

const fontWeight = {
  regular: designTokens.font.weights['--font-weight-regular'],
  medium: designTokens.font.weights['--font-weight-medium'],
  semibold: designTokens.font.weights['--font-weight-semibold'],
  bold: designTokens.font.weights['--font-weight-bold'],
};

const borderRadius = {
  'sm': '0.25rem',
  'md': '0.375rem',
  'lg': '0.5rem',
  'xl': '0.75rem',
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
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
};
