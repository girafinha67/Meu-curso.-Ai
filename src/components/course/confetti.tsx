const COLORS = ['bg-primary-500', 'bg-accent-500', 'bg-ai-600', 'bg-primary-300', 'bg-accent-300']

/**
 * Confete leve em CSS puro (sem lib externa). Só usado no momento de
 * concluir o curso — `prefers-reduced-motion` já reduz a animação
 * globalmente (ver global.css).
 */
export function Confetti() {
  const pieces = Array.from({ length: 18 })
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((_, i) => {
        const left = (i * 97) % 100
        const delay = (i % 6) * 0.15
        const duration = 2.2 + (i % 5) * 0.3
        return (
          <span
            key={i}
            className={`absolute top-0 h-2 w-2 rounded-sm ${COLORS[i % COLORS.length]} animate-confetti-fall`}
            style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
          />
        )
      })}
    </div>
  )
}
