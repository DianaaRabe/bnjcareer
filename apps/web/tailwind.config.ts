// ─────────────────────────────────────────────────────────────────────────────
// Tailwind Config — Multi-Tenant CSS Variable System
//
// Brand colors use CSS custom properties (--brand-*) injected per-tenant in
// the root layout. The `rgb(var(--brand-x) / <alpha-value>)` syntax enables
// opacity modifiers (e.g. `bg-brand-primary/50`) to work correctly.
//
// FR tenant defaults are set in app/globals.css (:root).
// Other tenants override via a <style> tag injected in app/layout.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          dark:    'rgb(var(--brand-dark)    / <alpha-value>)',
          light:   'rgb(var(--brand-light)   / <alpha-value>)',
          accent:  'rgb(var(--brand-accent)  / <alpha-value>)',
          bg:      'rgb(var(--brand-bg)      / <alpha-value>)',
          // Numbered scale — mapped to semantic vars
          50:      'rgb(var(--brand-bg)      / <alpha-value>)',
          100:     'rgb(var(--brand-subtle)  / <alpha-value>)',
          200:     'rgb(var(--brand-light)   / 0.2)',   // fixed 20% opacity tint
          500:     'rgb(var(--brand-primary) / <alpha-value>)',
          600:     'rgb(var(--brand-dark)    / <alpha-value>)',
        },
      },
      animation: {
        'fade-in':       'fadeIn 0.5s ease-out',
        'slide-up':      'slideUp 0.5s ease-out forwards',
        'float':         'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out -3s infinite',
        'float-slow':    'float 8s ease-in-out infinite',
        'pulse-glow':    'pulseGlow 4s ease-in-out infinite',
        'sparkle':       'sparkle 3s ease-in-out infinite',
        'spin-slow':     'spin 12s linear infinite',
        'wobble':        'wobble 5s ease-in-out infinite',
        'rocket-boost':  'rocketBoost 4.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'translate(-50%, -50%) scale(1)' },
          '50%':      { opacity: '0.7', transform: 'translate(-50%, -50%) scale(1.08)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.5)' },
          '50%':      { opacity: '1', transform: 'scale(1)' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(3deg) translateY(0)' },
          '50%':      { transform: 'rotate(-2deg) translateY(-6px)' },
        },
        rocketBoost: {
          '0%, 60%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '15%':           { transform: 'translateY(-4px) rotate(-8deg)' },
          '30%':           { transform: 'translateY(-7px) rotate(-3deg)' },
          '45%':           { transform: 'translateY(-2px) rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
