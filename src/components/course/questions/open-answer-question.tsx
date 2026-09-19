import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ScoreCard } from '@/components/course/score-card'
import type { Question } from '@/types/database'

interface OpenResult {
  correct: boolean
  score: number
  maxScore: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

const MAX_CHARS = 1500

export function OpenAnswerQuestion({
  question,
  disabled,
  initialText,
  initialResult,
  onSubmit,
}: {
  question: Question
  disabled: boolean
  initialText?: string
  initialResult?: OpenResult
  onSubmit: (payload: { openText: string }) => Promise<OpenResult>
}) {
  const [text, setText] = useState(initialText ?? '')
  const [result, setResult] = useState<OpenResult | null>(initialResult ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const answered = disabled || !!result

  async function handleSubmit() {
    if (text.trim().length < 10) {
      setError('Escreva uma resposta um pouco mais completa (mínimo 10 caracteres).')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await onSubmit({ openText: text.trim() })
      setResult(res)
    } catch {
      setError('A avaliação por IA está temporariamente indisponível. Tente novamente em instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="font-medium">{question.prompt}</p>

      {!answered && (
        <>
          <Textarea
            className="mt-4"
            value={text}
            maxLength={MAX_CHARS}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva sua resposta com suas próprias palavras..."
          />
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Sua resposta é avaliada por IA — não precisa ser idêntica a nenhum texto modelo.</span>
            <span>
              {text.length}/{MAX_CHARS}
            </span>
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button className="mt-3" onClick={handleSubmit} loading={loading} disabled={text.trim().length < 10}>
            Enviar para avaliação
          </Button>
        </>
      )}

      {result && (
        <ScoreCard
          correct={result.correct}
          score={result.score}
          maxScore={result.maxScore}
          aiFeedback={result.feedback}
          strengths={result.strengths}
          improvements={result.improvements}
        />
      )}
    </div>
  )
}
