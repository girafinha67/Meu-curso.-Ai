import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        // Marca — azul original do projeto (voltamos atrás na cor verde da
        // primeira versão). Escala numerada (50-900) porque é assim que o
        // app inteiro consome a cor (bg-primary-600, text-primary-700...).
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Dourado de gamificação — XP, nível, streak, conquistas.
        // Deliberadamente distinto do "warning" (laranja de estado de erro/aviso).
        accent: {
          DEFAULT: '#F0A202',
          50: '#FEF7E6',
          100: '#FDEBC0',
          200: '#FBD983',
          300: '#F7C24C',
          400: '#F3B324',
          500: '#F0A202',
          600: '#C98600',
          700: '#9C6800',
        },
        // Roxo usado só para marcar o que é "gerado/avaliado por IA" (badges,
        // feedback de exercício aberto, seção de ferramentas de IA).
        ai: {
          DEFAULT: '#6D5EF5',
          50: '#F1EFFE',
          100: '#E1DCFD',
          200: '#C3B9FB',
          600: '#6D5EF5',
          700: '#5443E0',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: '#16a34a',
        danger: '#dc2626',
        warning: '#d97706',
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        // Sombras compostas (duas camadas) em vez do cinza plano padrão —
        // mais suaves e com mais profundidade percebida.
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.10)',
        elevated: '0 2px 4px rgba(15, 23, 42, 0.04), 0 16px 40px -16px rgba(15, 23, 42, 0.18)',
        glow: '0 8px 30px -8px rgba(37, 99, 235, 0.35)',
        'glow-accent': '0 8px 30px -8px rgba(240, 162, 2, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'pop-in': { '0%': { opacity: '0', transform: 'scale(0.85)' }, '60%': { opacity: '1', transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)' } },
        'toast-in': { '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.98)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        'progress-fill': { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(220px) rotate(240deg)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'toast-in': 'toast-in 0.25s ease-out',
        'confetti-fall': 'confetti-fall linear forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
