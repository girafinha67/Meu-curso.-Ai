import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { RequireAdmin } from '@/components/auth-guard'
import { AdminShell } from '@/components/admin/admin-shell'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/states'
import type { Lesson, LessonBlock } from '@/types/database'

export const Route = createFileRoute('/admin/aulas_/$lessonId')({
  component: () => (
    <RequireAdmin>
      <EditLessonPage />
    </RequireAdmin>
  ),
})

function EditLessonPage() {
  const { lessonId } = Route.useParams()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin_lesson_detail', lessonId],
    queryFn: async () => {
      const [{ data: lesson, error: e1 }, { data: blocks, error: e2 }] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', lessonId).single(),
        supabase.from('lesson_blocks').select('*').eq('lesson_id', lessonId).order('position'),
      ])
      if (e1) throw e1
      if (e2) throw e2
      return { lesson: lesson as Lesson, blocks: (blocks ?? []) as LessonBlock[] }
    },
  })

  const [form, setForm] = useState<Partial<Lesson>>({})
  const [blocksJson, setBlocksJson] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)

  useEffect(() => {
    if (data) {
      setForm(data.lesson)
      setBlocksJson(JSON.stringify(data.blocks.map((b) => ({ type: b.type, content: b.content })), null, 2))
    }
  }, [data])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setJsonError(null)

    await supabase
      .from('lessons')
      .update({
        title: form.title,
        description: form.description,
        duration_minutes: form.duration_minutes,
        conclusion: form.conclusion,
        min_score_percent: form.min_score_percent,
      })
      .eq('id', lessonId)

    try {
      const parsedBlocks = JSON.parse(blocksJson) as { type: string; content: unknown }[]
      await supabase.from('lesson_blocks').delete().eq('lesson_id', lessonId)
      if (parsedBlocks.length > 0) {
        await supabase.from('lesson_blocks').insert(
          parsedBlocks.map((b, i) => ({ lesson_id: lessonId, position: i + 1, type: b.type, content: b.content }))
        )
      }
      setSaved(true)
      queryClient.invalidateQueries({ queryKey: ['admin_lesson_detail', lessonId] })
      queryClient.invalidateQueries({ queryKey: ['lesson_detail', lessonId] })
    } catch {
      setJsonError('O JSON dos blocos de conteúdo é inválido. Verifique a sintaxe antes de salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !data) return <AdminShell><LoadingState /></AdminShell>

  return (
    <AdminShell>
      <Link to="/admin/aulas" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para aulas
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">Editar aula</h1>

      <div className="mt-6 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações gerais</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Título</label>
              <Input value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Descrição</label>
              <Textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Duração (min)</label>
                <Input
                  type="number"
                  value={form.duration_minutes ?? 0}
                  onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nota mínima (%)</label>
                <Input
                  type="number"
                  placeholder="Usa regra global se vazio"
                  value={form.min_score_percent ?? ''}
                  onChange={(e) => setForm({ ...form, min_score_percent: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Conclusão</label>
              <Textarea value={form.conclusion ?? ''} onChange={(e) => setForm({ ...form, conclusion: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blocos de conteúdo</CardTitle>
            <CardDescription>
              Array JSON de blocos (heading, paragraph, callout, cards, list, steps, diagram, code, image, comparison, checklist,
              example, ai_tools, dex_cta). Cada item precisa de <code>type</code> e <code>content</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[400px] font-mono text-xs"
              value={blocksJson}
              onChange={(e) => setBlocksJson(e.target.value)}
            />
            {jsonError && <p className="mt-2 text-sm text-danger">{jsonError}</p>}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={saving}>
            Salvar alterações
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> Salvo com sucesso
            </span>
          )}
          <Link to="/admin/questoes" className="ml-auto text-sm font-medium text-primary-600 hover:underline">
            Gerenciar questões desta aula →
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}
