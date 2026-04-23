import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic colors
        primary: '#7C3AED',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        
        // UI tokens (from @theme in index.css)
        card: '#FFFFFF',
        background: '#F7F7FB',
        sidebar: '#1C1B2A',
        
        // Text colors
        'text-main': '#0F172A',
        'text-muted': '#64748B',
        
        // Borders
        border: 'rgba(15, 23, 42, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        head: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px rgba(15,23,42,0.06)',
      }
    }
  }
} satisfies Config
