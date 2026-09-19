import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, Clock } from 'lucide-react'
import { RequireAdmin } from '@/components/auth-guard'
import { AdminShell } from '@/components/admin/admin-shell'
import { supabase } from '@/lib/supabase'
import { useCourse } from '@/hooks/use-course'
import { Card } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/states'
import type { Lesson } from '@/types/database'

export const Route = createFileRoute('/admin/aulas/')({
  component: () => (
    <RequireAdmin>
      <AdminLessonsPage />
    </RequireAdmin>
  ),
})

function AdminLessonsPage() {
  const { data: course } = useCourse()
  const queryClient = useQueryClient()

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['admin_lessons', course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('lessons').select('*').eq('course_id', course!.id).order('position')
      if (error) throw error
      return data as Lesson[]
    },
  })

  async function togglePublish(lesson: Lesson) {
    await supabase.from('lessons').update({ is_published: !lesson.is_published }).eq('id', lesson.id)
    queryClient.invalidateQueries({ queryKey: ['admin_lessons'] })
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aulas</h1>
          <p className="mt-1 text-muted-foreground">Gerencie o conteúdo, ordem e publicação das aulas.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8">
          <LoadingState />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {lessons?.map((lesson) => (
            <Card key={lesson.id} className="flex items-center gap-4 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 font-bold text-primary-700">
                {lesson.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{lesson.title}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {lesson.duration_minutes} min
                </p>
              </div>
              <button
                onClick={() => togglePublish(lesson)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                title={lesson.is_published ? 'Despublicar' : 'Publicar'}
              >
                {lesson.is_published ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4" />}
                {lesson.is_published ? 'Publicada' : 'Rascunho'}
              </button>
              <Link
                to="/admin/aulas/$lessonId"
                params={{ lessonId: lesson.id }}
                className="rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
              >
                Editar
              </Link>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
