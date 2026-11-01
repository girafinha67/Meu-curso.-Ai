import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'neutral' | 'success' | 'progress' | 'locked' | 'accent' | 'ai' | 'danger'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success',
  progress: 'bg-primary-50 text-primary-700',
  locked: 'bg-muted text-muted-foreground/70',
  accent: 'bg-accent-50 text-accent-700',
  ai: 'bg-ai-50 text-ai-700',
  danger: 'bg-red-50 text-danger',
}

/** Pílula de status curta — usada em aulas (concluída/em andamento/bloqueada),
 * conquistas, nível e marcações de conteúdo gerado/avaliado por IA. */
export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
