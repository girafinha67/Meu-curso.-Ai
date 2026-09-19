import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'focus-ring flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:border-primary-200 disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
