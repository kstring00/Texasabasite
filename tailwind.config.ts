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
        /* Common Ground's legacy palette, pointed at the site tokens so both share one language. */
        brand: {
          navy: { 50: 'rgb(var(--ink) / 0.04)', 100: 'rgb(var(--ink) / 0.08)', 200: 'rgb(var(--line) / <alpha-value>)', 300: 'rgb(var(--soft) / <alpha-value>)', 400: 'rgb(var(--body) / <alpha-value>)', 500: 'rgb(var(--ink) / <alpha-value>)', 600: 'rgb(var(--ink) / <alpha-value>)', 700: 'rgb(var(--ink) / <alpha-value>)', 800: 'rgb(var(--ink) / <alpha-value>)', 900: 'rgb(var(--ink) / <alpha-value>)' },
          red: { 50: '#fef0f1', 100: '#fcd4d7', 200: '#f9a8af', 300: '#f57c87', 400: '#f14f5f', 500: '#e2283a', 600: '#c41f32', 700: '#a31929', 800: '#821320', 900: '#5c0e17' },
          burgundy: { 50: '#f8eef1', 100: '#ecd3da', 200: '#d9a8b7', 300: '#c67d94', 400: '#b35271', 500: '#8b2442', 600: '#7a1f3a', 700: '#641931', 800: '#4f1327', 900: '#390e1c' },
          plum: { 50: 'rgb(var(--cobalt) / 0.06)', 100: 'rgb(var(--cobalt) / 0.12)', 200: 'rgb(var(--cobalt) / 0.25)', 300: 'rgb(var(--cobalt) / 0.45)', 400: 'rgb(var(--cobalt) / 0.7)', 500: 'rgb(var(--cobalt) / <alpha-value>)', 600: 'rgb(var(--cobalt) / <alpha-value>)', 700: 'rgb(var(--cobalt) / <alpha-value>)', 800: 'rgb(var(--ink) / <alpha-value>)', 900: 'rgb(var(--ink) / <alpha-value>)' },
          purple: { 50: 'rgb(var(--cobalt) / 0.06)', 100: 'rgb(var(--cobalt) / 0.12)', 200: 'rgb(var(--cobalt) / 0.25)', 300: 'rgb(var(--cobalt) / 0.45)', 400: 'rgb(var(--cobalt) / 0.7)', 500: 'rgb(var(--ink) / <alpha-value>)', 600: 'rgb(var(--ink) / <alpha-value>)', 700: 'rgb(var(--ink) / <alpha-value>)', 800: 'rgb(var(--ink) / <alpha-value>)', 900: 'rgb(var(--ink) / <alpha-value>)' },
          warm: { 50: 'rgb(var(--card) / <alpha-value>)', 100: 'rgb(var(--paper) / <alpha-value>)', 200: 'rgb(var(--line) / 0.5)', 300: 'rgb(var(--line) / <alpha-value>)', 400: 'rgb(var(--line) / <alpha-value>)', 500: 'rgb(var(--soft) / <alpha-value>)' },
          muted: { 50: 'rgb(var(--ink) / 0.03)', 100: 'rgb(var(--ink) / 0.06)', 200: 'rgb(var(--line) / <alpha-value>)', 300: 'rgb(var(--soft) / 0.6)', 400: 'rgb(var(--soft) / <alpha-value>)', 500: 'rgb(var(--soft) / <alpha-value>)', 600: 'rgb(var(--body) / <alpha-value>)', 700: 'rgb(var(--body) / <alpha-value>)', 800: 'rgb(var(--ink) / <alpha-value>)', 900: 'rgb(var(--ink) / <alpha-value>)' },
          teal: '#0F6E56',
        },
        primary: { DEFAULT: 'rgb(var(--cobalt) / <alpha-value>)', light: 'rgb(var(--cobalt) / 0.7)', dark: 'rgb(var(--ink) / <alpha-value>)', foreground: '#ffffff' },
        accent: { DEFAULT: 'rgb(var(--persimmon) / <alpha-value>)', light: 'rgb(var(--persimmon) / 0.7)', dark: 'rgb(var(--persimmon) / <alpha-value>)', foreground: 'rgb(var(--ink) / <alpha-value>)' },
        surface: { DEFAULT: 'rgb(var(--card) / <alpha-value>)', muted: 'rgb(var(--ink) / 0.04)', subtle: 'rgb(var(--ink) / 0.06)', border: 'rgb(var(--line) / <alpha-value>)' },
        page: { DEFAULT: 'rgb(var(--paper) / <alpha-value>)' },
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
