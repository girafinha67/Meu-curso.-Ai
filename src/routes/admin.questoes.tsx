import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, Plus } from 'lucide-react'
import { RequireAdmin } from '@/components/auth-guard'
import { AdminShell } from '@/components/admin/admin-shell'
import { supabase } from '@/lib/supabase'
import { useCourse, useLessons } from '@/hooks/use-course'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LoadingState } from '@/components/ui/states'
import type { QuestionType } from '@/types/database'

export const Route = createFileRoute('/admin/questoes')({
  component: () => (
    <RequireAdmin>
      <AdminQuestionsPage />
    </RequireAdmin>
  ),
})

function AdminQuestionsPage() {
  const { data: course } = useCourse()
  const { data: lessons } = useLessons(course?.id)
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')
  const queryClient = useQueryClient()

  const lessonId = selectedLessonId || lessons?.[0]?.id || ''

  const { data: questions, isLoading } = useQuery({
    queryKey: ['admin_questions', lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*, question_options(*)')
        .eq('lesson_id', lessonId)
        .order('position')
      if (error) throw error
      return data ?? []
    },
  })

  async function updateQuestion(id: string, fields: Record<string, unknown>) {
    await supabase.from('questions').update(fields).eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['admin_questions', lessonId] })
  }

  async function updateOption(id: string, fields: Record<string, unknown>) {
    await supabase.from('question_options').update(fields).eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['admin_questions', lessonId] })
  }

  async function deleteQuestion(id: string) {
    await supabase.from('questions').delete().eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['admin_questions', lessonId] })
  }

  async function addQuestion() {
    const maxPos = questions?.length ?? 0
    await supabase.from('questions').insert({
      lesson_id: lessonId,
      position: maxPos + 1,
      type: 'multiple_choice' as QuestionType,
      prompt: 'Nova questão',
      points: 10,
    })
    queryClient.invalidateQueries({ queryKey: ['admin_questions', lessonId] })
  }

  return (
    <AdminShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Questões</h1>
          <p className="mt-1 text-muted-foreground">Edite perguntas, alternativas, pontuação e critérios de IA.</p>
        </div>
        <select
          className="focus-ring h-11 rounded-xl border border-border bg-background px-4 text-sm"
          value={lessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
        >
          {lessons?.map((l) => (
            <option key={l.id} value={l.id}>
              Aula {l.position} — {l.title}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="mt-8">
          <LoadingState />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {questions?.map((q: any) => (
            <Card key={q.id}>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <select
                    className="focus-ring h-9 rounded-lg border border-border bg-background px-2 text-xs"
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, { type: e.target.value })}
                  >
                    <option value="multiple_choice">Múltipla escolha</option>
                    <option value="true_false">Verdadeiro/Falso</option>
                    <option value="multi_select">Multisseleção</option>
                    <option value="open">Resposta aberta</option>
                  </select>
                  <button onClick={() => deleteQuestion(q.id)} className="text-danger hover:opacity-70" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Textarea
                  defaultValue={q.prompt}
                  onBlur={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                  placeholder="Enunciado da questão"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Pontos</label>
                    <Input type="number" defaultValue={q.points} onBlur={(e) => updateQuestion(q.id, { points: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Explicação (feedback)</label>
                    <Input
                      defaultValue={q.explanation ?? ''}
                      onBlur={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                    />
                  </div>
                </div>

                {q.type !== 'open' && (
                  <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">Alternativas (marque as corretas)</p>
                    {q.question_options?.map((opt: any) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={opt.is_correct}
                          onChange={(e) => updateOption(opt.id, { is_correct: e.target.checked })}
                          className="h-4 w-4 rounded border-border"
                        />
                        <Input
                          className="h-9"
                          defaultValue={opt.text}
                          onBlur={(e) => updateOption(opt.id, { text: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'open' && (
                  <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Resposta modelo</label>
                      <Textarea
                        defaultValue={q.model_answer ?? ''}
                        onBlur={(e) => updateQuestion(q.id, { model_answer: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Critérios de avaliação (IA)</label>
                      <Textarea
                        defaultValue={q.ai_criteria ?? ''}
                        onBlur={(e) => updateQuestion(q.id, { ai_criteria: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addQuestion} className="self-start">
            <Plus className="h-4 w-4" /> Nova questão
          </Button>
        </div>
      )}
    </AdminShell>
  )
}
