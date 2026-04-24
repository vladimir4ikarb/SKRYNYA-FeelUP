import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--accent-primary)',
        secondary: 'var(--accent-secondary)',

        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',

        card: 'var(--bg-card)',
        background: 'var(--bg-main)',
        sidebar: 'var(--bg-sidebar)',

        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',

        border: 'var(--border-color)',
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        head: ['Outfit', 'sans-serif'],
      },

      boxShadow: {
        card: '0 10px 30px rgba(15,23,42,0.06)',
      },
    },
  },
} satisfies Config