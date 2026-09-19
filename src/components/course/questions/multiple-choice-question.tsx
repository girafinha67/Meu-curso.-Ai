import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScoreCard } from '@/components/course/score-card'
import type { Question } from '@/types/database'

interface SubmitResult {
  correct: boolean
  explanation: string | null
  correctOptionIds: string[]
}

interface Props {
  question: Question
  disabled: boolean
  initialSelectedOptionIds?: string[]
  initialResult?: SubmitResult
  onSubmit: (payload: { selectedOptionIds: string[] }) => Promise<SubmitResult>
}

export function MultipleChoiceQuestion({ question, disabled, initialSelectedOptionIds, initialResult, onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(initialSelectedOptionIds?.[0] ?? null)
  const [result, setResult] = useState<SubmitResult | null>(initialResult ?? null)
  const [loading, setLoading] = useState(false)

  const answered = disabled || !!result

  async function handleSubmit() {
    if (!selected) return
    setLoading(true)
    const res = await onSubmit({ selectedOptionIds: [selected] })
    setResult(res)
    setLoading(false)
  }

  return (
    <div>
      {question.context && <p className="mb-3 rounded-xl bg-muted/50 p-3 text-sm italic">{question.context}</p>}
      <p className="font-medium">{question.prompt}</p>

      <div className="mt-4 flex flex-col gap-2">
        {question.options?.map((opt) => {
          const isSelected = selected === opt.id
          const isCorrectOpt = result?.correctOptionIds.includes(opt.id)
          const showState = !!result

          return (
            <button
              key={opt.id}
              disabled={answered}
              onClick={() => setSelected(opt.id)}
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
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                  isSelected ? 'border-primary-600' : 'border-border'
                )}
              >
                {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
              </span>
              {opt.text}
            </button>
          )
        })}
      </div>

      {!answered && (
        <Button className="mt-4" onClick={handleSubmit} disabled={!selected} loading={loading}>
          Confirmar resposta
        </Button>
      )}

      {result && <ScoreCard correct={result.correct} explanation={result.explanation} />}
    </div>
  )
}
