import { CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScoreCardProps {
  correct: boolean
  explanation?: string | null
  score?: number
  maxScore?: number
  aiFeedback?: string | null
  strengths?: string[]
  improvements?: string[]
}

export function ScoreCard({ correct, explanation, score, maxScore, aiFeedback, strengths, improvements }: ScoreCardProps) {
  const isOpenAnswer = typeof score === 'number' && typeof maxScore === 'number' && !!aiFeedback

  return (
    <div
      className={cn(
        'animate-scale-in mt-4 rounded-2xl border-2 p-5',
        correct ? 'border-green-200 bg-green-50/60' : 'border-red-200 bg-red-50/60'
      )}
    >
      <div className="flex items-center gap-2">
        {correct ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-danger" />}
        <span className={cn('font-bold', correct ? 'text-success' : 'text-danger')}>
          {isOpenAnswer ? `Nota: ${score?.toFixed(1)}/${maxScore}` : correct ? 'Correto' : 'Incorreto'}
        </span>
      </div>

      {explanation && !isOpenAnswer && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Por quê?</p>
          <p className="mt-1 text-sm">{explanation}</p>
        </div>
      )}

      {isOpenAnswer && (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Feedback da IA</p>
              <p className="mt-1 text-sm">{aiFeedback}</p>
            </div>
          </div>
          {!!strengths?.length && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-success">Pontos fortes</p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {strengths.map((s, i) => (
                  <li key={i} className="text-sm">• {s}</li>
                ))}
              </ul>
            </div>
          )}
          {!!improvements?.length && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Para melhorar</p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {improvements.map((s, i) => (
                  <li key={i} className="text-sm">• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
