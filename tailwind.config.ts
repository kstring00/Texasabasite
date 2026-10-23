import type { Config } from 'tailwindcss';

/**
 * Design tokens live in src/app/globals.css as CSS variables (light + dark).
 * Tailwind reads them here so both the site and Common Ground share one system.
 * The `brand-*` scales are kept for the Common Ground components mounted at /families.
 */
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        paper: 'rgb(var(--paper) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        sun: 'rgb(var(--sun) / <alpha-value>)',
        cobalt: 'rgb(var(--cobalt) / <alpha-value>)',
        persimmon: 'rgb(var(--persimmon) / <alpha-value>)',
        butter: 'rgb(var(--butter) / <alpha-value>)',
        lavender: 'rgb(var(--lavender) / <alpha-value>)',
        sage: 'rgb(var(--sage) / <alpha-value>)',
        rose: { DEFAULT: 'rgb(var(--rose) / <alpha-value>)' },
        plum: { DEFAULT: 'rgb(var(--plum) / <alpha-value>)' },
        body: 'rgb(var(--body) / <alpha-value>)',
        soft: 'rgb(var(--soft) / <alpha-value>)',
        brand: {
          navy: { 50: '#eef1f8', 100: '#d4dbeb', 200: '#a9b6d2', 300: '#7d8fb8', 400: '#52699f', 500: '#1a2e52', 600: '#152646', 700: '#111d39', 800: '#0c152b', 900: '#070c1a' },
          red: { 50: '#fef0f1', 100: '#fcd4d7', 200: '#f9a8af', 300: '#f57c87', 400: '#f14f5f', 500: '#e2283a', 600: '#c41f32', 700: '#a31929', 800: '#821320', 900: '#5c0e17' },
          burgundy: { 50: '#f8eef1', 100: '#ecd3da', 200: '#d9a8b7', 300: '#c67d94', 400: '#b35271', 500: '#8b2442', 600: '#7a1f3a', 700: '#641931', 800: '#4f1327', 900: '#390e1c' },
          plum: { 50: '#f7f0f6', 100: '#e9d9e6', 200: '#d4b3cd', 300: '#bf8db4', 400: '#aa679b', 500: '#703068', 600: '#63295d', 700: '#51214c', 800: '#3f193b', 900: '#2d112a' },
          purple: { 50: '#f2eff6', 100: '#ddd5e8', 200: '#c2b0d4', 300: '#a78bc0', 400: '#8c66ac', 500: '#32175a', 600: '#2b144d', 700: '#241040', 800: '#1c0d32', 900: '#140925' },
          warm: { 50: '#faf9fc', 100: '#f3f2f7', 200: '#e8e6ef', 300: '#dcd9e6', 400: '#d0cddc', 500: '#c5c2cf' },
          muted: { 50: '#f5f5f6', 100: '#ebebed', 200: '#d7d8db', 300: '#b3b5ba', 400: '#5f636c', 500: '#585d66', 600: '#5a5d64', 700: '#474950', 800: '#34363b', 900: '#212226' },
          teal: '#0F6E56',
        },
        primary: { DEFAULT: '#1a2e52', light: '#52699f', dark: '#111d39', foreground: '#ffffff' },
        accent: { DEFAULT: '#e2283a', light: '#f14f5f', dark: '#a31929', foreground: '#ffffff' },
        surface: { DEFAULT: '#ffffff', muted: '#eaecf2', subtle: '#e2e5ed', border: '#d4d8e3' },
        page: { DEFAULT: '#f2f4f8' },
      },
      fontFamily: {
        serif: ['var(--font-editorial)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Helvetica Neue', 'sans-serif'],
        editorial: ['var(--font-editorial)', 'Georgia', 'serif'],
        body: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['1.125rem', { lineHeight: '1.65' }],
      },
      maxWidth: { wrap: '80rem' },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
      boxShadow: {
        soft: '0 2px 20px rgba(26, 46, 82, 0.07)',
        card: '0 4px 24px rgba(26, 46, 82, 0.06)',
        'card-hover': '0 14px 40px rgba(26, 46, 82, 0.14)',
        glow: '0 0 40px rgba(26, 46, 82, 0.14)',
        lift: '0 18px 50px -20px rgba(26, 46, 82, 0.35)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(16px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
