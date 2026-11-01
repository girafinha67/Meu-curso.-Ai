import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScoreCard } from '@/components/course/score-card'
import type { Question } from '@/types/database'

interface SubmitResult {
  correct: boolean
  explanation: string | null
  correctOptionIds: string[]
}

export function MultiSelectQuestion({
  question,
  disabled,
  initialSelectedOptionIds,
  initialResult,
  onSubmit,
}: {
  question: Question
  disabled: boolean
  initialSelectedOptionIds?: string[]
  initialResult?: SubmitResult
  onSubmit: (payload: { selectedOptionIds: string[] }) => Promise<SubmitResult>
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelectedOptionIds ?? []))
  const [result, setResult] = useState<SubmitResult | null>(initialResult ?? null)
  const [loading, setLoading] = useState(false)
  const answered = disabled || !!result

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit() {
    if (selected.size === 0) return
    setLoading(true)
    const res = await onSubmit({ selectedOptionIds: Array.from(selected) })
    setResult(res)
    setLoading(false)
  }

  return (
    <div>
      <p className="font-medium">{question.prompt}</p>
      <p className="mt-1 text-xs text-muted-foreground">Selecione todas as alternativas corretas.</p>

      <div className="mt-4 flex flex-col gap-2">
        {question.options?.map((opt) => {
          const isSelected = selected.has(opt.id)
          const isCorrectOpt = result?.correctOptionIds.includes(opt.id)
          const showState = !!result

          return (
            <button
              key={opt.id}
              disabled={answered}
              onClick={() => toggle(opt.id)}
              className={cn(
                'focus-ring flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors',
                !showState && isSelected && 'border-primary-600 bg-primary-50',
                !showState && !isSelected && 'border-border hover:bg-muted/50',
                showState && isCorrectOpt && 'border-green-300 bg-green-50',
                showState && isSelected && !isCorrectOpt && 'border-red-300 bg-red-50',
                showState && !isSelected && !isCorrectOpt && 'border-border opacity-60'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2',
                  isSelected ? 'border-primary-600 bg-primary-600' : 'border-border'
                )}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
              </span>
              {opt.text}
            </button>
          )
        })}
      </div>

      {!answered && (
        <Button className="mt-4" onClick={handleSubmit} disabled={selected.size === 0} loading={loading}>
          Confirmar resposta
        </Button>
      )}

      {result && <ScoreCard correct={result.correct} explanation={result.explanation} />}
    </div>
  )
}
