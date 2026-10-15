/** @type {import('tailwindcss').Config} */
const tokens = require('./tokens.json');

module.exports = {
  content: [
    '../../apps/web/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/mobile/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // or 'media' for system preference
  theme: {
    extend: {
      colors: {
        // Semantic color roles (components use these)
        bg: tokens.color.roles.bg.value,
        surface: tokens.color.roles.surface.value,
        'surface-elevated': tokens.color.roles['surface-elevated'].value,
        border: tokens.color.roles.border.value,
        'border-input': tokens.color.roles['border-input'].value,
        'border-focus': tokens.color.roles['border-focus'].value,
        text: tokens.color.roles.text.value,
        'text-muted': tokens.color.roles['text-muted'].value,
        'text-inverted': tokens.color.roles['text-inverted'].value,
        accent: {
          DEFAULT: tokens.color.roles.accent.value,
          hover: tokens.color.roles['accent-hover'].value,
          light: tokens.color.roles['accent-light'].value,
          text: tokens.color.roles['accent-text'].value,
          on: tokens.color.roles['on-accent'].value,
        },
        danger: {
          DEFAULT: tokens.color.roles.danger.value,
          hover: tokens.color.roles['danger-hover'].value,
          light: tokens.color.roles['danger-light'].value,
          text: tokens.color.roles['danger-text'].value,
        },
        success: {
          DEFAULT: tokens.color.roles.success.value,
          hover: tokens.color.roles['success-hover'].value,
          light: tokens.color.roles['success-light'].value,
          text: tokens.color.roles['success-text'].value,
        },
        warning: {
          DEFAULT: tokens.color.roles.warning.value,
          hover: tokens.color.roles['warning-hover'].value,
          light: tokens.color.roles['warning-light'].value,
          text: tokens.color.roles['warning-text'].value,
        },
        info: {
          DEFAULT: tokens.color.roles.info.value,
          light: tokens.color.roles['info-light'].value,
          text: tokens.color.roles['info-text'].value,
        },
        overlay: tokens.color.roles.overlay.value,
      },
      fontFamily: {
        sans: tokens.typography.fontFamilies.sans.split(',').map(f => f.trim()),
        mono: tokens.typography.fontFamilies.mono.split(',').map(f => f.trim()),
      },
      fontSize: Object.fromEntries(
        Object.entries(tokens.typography.scale).map(([key, val]) => [
          key,
          [val.size, { lineHeight: val.lineHeight, letterSpacing: val.letterSpacing, fontWeight: val.weight }],
        ])
      ),
      fontWeight: tokens.typography.weights,
      spacing: Object.fromEntries(
        Object.entries(tokens.spacing.scale).map(([key, val]) => [key, val])
      ),
      borderRadius: tokens.radius,
      boxShadow: tokens.shadows,
      transitionDuration: tokens.motion.durations,
      transitionTimingFunction: tokens.motion.easings,
      maxWidth: {
        'layout': tokens.layout.maxWidth,
      },
      height: {
        'header': tokens.layout.headerHeight,
        'sidebar': tokens.layout.sidebarWidth,
        'sidebar-collapsed': tokens.layout.sidebarCollapsedWidth,
      },
      width: {
        'sidebar': tokens.layout.sidebarWidth,
        'sidebar-collapsed': tokens.layout.sidebarCollapsedWidth,
      },
      zIndex: tokens.zIndex,
      screens: {
        'sm': tokens.layout.breakpoints.sm,
        'md': tokens.layout.breakpoints.md,
        'lg': tokens.layout.breakpoints.lg,
        'xl': tokens.layout.breakpoints.xl,
        '2xl': tokens.layout.breakpoints['2xl'],
      },
      animation: {
        'fade-in': 'fadeIn var(--duration-normal) var(--ease-out)',
        'fade-out': 'fadeOut var(--duration-fast) var(--ease-in)',
        'slide-in': 'slideIn var(--duration-normal) var(--ease-out)',
        'slide-out': 'slideOut var(--duration-fast) var(--ease-in)',
        'scale-in': 'scaleIn var(--duration-fast) var(--ease-spring)',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};