import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { MultipleChoiceQuestion } from '@/components/course/questions/multiple-choice-question'
import { TrueFalseQuestion } from '@/components/course/questions/true-false-question'
import { MultiSelectQuestion } from '@/components/course/questions/multi-select-question'
import { OpenAnswerQuestion } from '@/components/course/questions/open-answer-question'
import { Badge } from '@/components/ui/badge'
import { submitAnswer } from '@/lib/api'
import type { Question } from '@/types/database'
import type { useLessonAnswers } from '@/hooks/use-answers'

type HydratedAnswers = NonNullable<ReturnType<typeof useLessonAnswers>['data']>

export function Quiz({
  questions,
  lessonId,
  initialAnswers,
  onXpEarned,
}: {
  questions: Question[]
  lessonId: string
  initialAnswers: HydratedAnswers
  onXpEarned?: (amount: number) => void
}) {
  const [justAnswered, setJustAnswered] = useState<Set<string>>(new Set())

  function markAnswered(id: string, xpEarned: number) {
    setJustAnswered((prev) => new Set(prev).add(id))
    if (xpEarned > 0) onXpEarned?.(xpEarned)
  }

  return (
    <div className="flex flex-col gap-6">
      {questions.map((question, i) => {
        const previous = initialAnswers[question.id]
        const alreadyAnswered = !!previous || justAnswered.has(question.id)

        return (
          <div key={question.id} className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="neutral">
                Questão {i + 1} de {questions.length}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">{question.points} pts</span>
            </div>

            {question.type === 'multiple_choice' && (
              <MultipleChoiceQuestion
                question={question}
                disabled={alreadyAnswered}
                initialSelectedOptionIds={previous?.selectedOptionIds}
                initialResult={previous?.result}
                onSubmit={async ({ selectedOptionIds }) => {
                  const res = await submitAnswer({ questionId: question.id, lessonId, selectedOptionIds })
                  markAnswered(question.id, res.xpEarned)
                  return res
                }}
              />
            )}

            {question.type === 'true_false' && (
              <TrueFalseQuestion
                question={question}
                disabled={alreadyAnswered}
                initialSelectedOptionIds={previous?.selectedOptionIds}
                initialResult={previous?.result}
                onSubmit={async ({ selectedOptionIds }) => {
                  const res = await submitAnswer({ questionId: question.id, lessonId, selectedOptionIds })
                  markAnswered(question.id, res.xpEarned)
                  return res
                }}
              />
            )}

            {question.type === 'multi_select' && (
              <MultiSelectQuestion
                question={question}
                disabled={alreadyAnswered}
                initialSelectedOptionIds={previous?.selectedOptionIds}
                initialResult={previous?.result}
                onSubmit={async ({ selectedOptionIds }) => {
                  const res = await submitAnswer({ questionId: question.id, lessonId, selectedOptionIds })
                  markAnswered(question.id, res.xpEarned)
                  return res
                }}
              />
            )}

            {question.type === 'open' && (
              <OpenAnswerQuestion
                question={question}
                disabled={alreadyAnswered}
                initialText={previous?.openText ?? undefined}
                initialResult={previous?.result}
                onSubmit={async ({ openText }) => {
                  const res = await submitAnswer({ questionId: question.id, lessonId, openText })
                  markAnswered(question.id, res.xpEarned)
                  return res
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
