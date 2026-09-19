import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  className?: string
  size?: 'sm' | 'md'
  /** Cor do preenchimento — 'primary' (padrão, progresso do curso) ou 'accent' (XP/nível). */
  tone?: 'primary' | 'accent'
}

export function ProgressBar({ value, className, size = 'md', tone = 'primary' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('w-full overflow-hidden rounded-full bg-muted', size === 'sm' ? 'h-1.5' : 'h-2.5', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-out',
          tone === 'primary' ? 'progress-track-glow' : 'bg-accent-500'
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
