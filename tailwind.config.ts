import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        'surface-sub': 'var(--surface-sub)',
        'surface-strong': 'var(--surface-strong)',
        'surface-muted': 'var(--surface-muted)',
        'text-base': 'var(--text-base)',
        'text-sub': 'var(--text-sub)',
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',
        'border-base': 'var(--border-base)',
        'border-sub': 'var(--border-sub)',
        'border-strong': 'var(--border-strong)',
        accent: 'var(--accent)',
        'accent-sub': 'var(--accent-sub)',
        'accent-soft': 'var(--accent-soft)',
        'accent-border': 'var(--accent-border)',
        'accent-border-sub': 'var(--accent-border-sub)',
        danger: 'var(--danger)',
        'danger-sub': 'var(--danger-sub)',
        'danger-soft': 'var(--danger-soft)',
        'danger-border': 'var(--danger-border)',
        success: 'var(--success)',
        'success-sub': 'var(--success-sub)',
        brand: 'var(--brand)',
        overlay: 'var(--overlay)',
        highlight: 'var(--highlight)',
        'highlight-soft': 'var(--highlight-soft)',
      },
    },
  },
  plugins: [],
} satisfies Config;
