import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, Lock, Circle, PlayCircle, Trophy, Clock } from 'lucide-react'
import { RequireAuth } from '@/components/auth-guard'
import { AppShell } from '@/components/app-shell'
import { useAuth } from '@/hooks/use-auth'
import { useCourse, useLessons } from '@/hooks/use-course'
import { useCourseProgress, useLessonProgressList } from '@/hooks/use-progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingState, EmptyState } from '@/components/ui/states'
import { cn } from '@/lib/utils'
import { getLessonStatus, type LessonStatus } from '@/lib/lesson-status'

export const Route = createFileRoute('/trilha')({
  component: () => (
    <RequireAuth>
      <TrilhaPage />
    </RequireAuth>
  ),
})

const STATUS_CONFIG: Record<LessonStatus, { icon: typeof CheckCircle2; label: string; nodeClass: string }> = {
  completed: { icon: CheckCircle2, label: 'Concluída', nodeClass: 'border-primary-600 bg-primary-600 text-white' },
  current: { icon: PlayCircle, label: 'Em andamento', nodeClass: 'border-primary-600 bg-card text-primary-600 ring-4 ring-primary-100' },
  available: { icon: Circle, label: 'Disponível', nodeClass: 'border-border bg-card text-muted-foreground' },
  locked: { icon: Lock, label: 'Bloqueada', nodeClass: 'border-border bg-muted text-muted-foreground/60' },
}

function TrilhaPage() {
  const { user } = useAuth()
  const { data: course, isLoading: loadingCourse } = useCourse()
  const { data: lessons, isLoading: loadingLessons } = useLessons(course?.id)
  const { data: courseProgress } = useCourseProgress(course?.id)
  const { data: lessonProgressList } = useLessonProgressList(user?.id)

  if (loadingCourse || loadingLessons) {
    return (
      <AppShell>
        <LoadingState label="Montando sua trilha..." />
      </AppShell>
    )
  }

  if (!course || !lessons?.length) {
    return (
      <AppShell>
        <EmptyState title="Curso ainda não disponível" description="Volte em breve — o conteúdo está sendo preparado." />
      </AppShell>
    )
  }

  const progressMap = new Map((lessonProgressList ?? []).map((p) => [p.lesson_id, p]))
  const completedIds = new Set((lessonProgressList ?? []).filter((p) => p.completed).map((p) => p.lesson_id))
  const courseCompleted = courseProgress?.completed ?? (completedIds.size >= lessons.length)

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Mapa do curso</h1>
          <p className="mt-1 text-muted-foreground">
            {completedIds.size} de {lessons.length} aulas concluídas — veja onde você está e o que vem a seguir.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="absolute bottom-6 left-6 top-6 w-px bg-border" aria-hidden="true" />

          <ol className="flex flex-col gap-3">
            {lessons.map((lesson, index) => {
              const progress = progressMap.get(lesson.id)
              const status = getLessonStatus(lessons, index, progress, completedIds)
              const config = STATUS_CONFIG[status]
              const Icon = config.icon

              return (
                <li key={lesson.id} className="relative flex items-start gap-4 pl-0">
                  <span
                    className={cn(
                      'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2',
                      config.nodeClass
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <div
                    className={cn(
                      'flex-1 rounded-2xl border border-border bg-card p-4 shadow-soft',
                      status === 'locked' && 'opacity-70'
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-semibold">
                        {String(lesson.position).padStart(2, '0')} — {lesson.title}
                      </p>
                      <Badge variant={status === 'completed' ? 'success' : status === 'current' ? 'progress' : status === 'locked' ? 'locked' : 'neutral'}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {lesson.duration_minutes} min
                    </p>

                    {status !== 'locked' && (
                      <Link to="/aula/$lessonId" params={{ lessonId: lesson.id }} className="mt-3 inline-block">
                        <Button size="sm" variant={status === 'completed' ? 'outline' : 'primary'}>
                          {status === 'completed' ? 'Revisar aula' : status === 'current' ? 'Continuar aula' : 'Começar aula'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </li>
              )
            })}

            <li className="relative flex items-start gap-4">
              <span
                className={cn(
                  'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2',
                  courseCompleted ? 'border-accent-500 bg-accent-500 text-white' : 'border-border bg-muted text-muted-foreground/60'
                )}
              >
                <Trophy className="h-5 w-5" />
              </span>
              <div className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <p className="font-display font-semibold">Certificado de conclusão</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {courseCompleted
                    ? 'Parabéns! Seu certificado já está disponível no seu perfil. 🎉'
                    : 'Liberado ao concluir 100% do curso.'}
                </p>
                {courseCompleted && (
                  <Link to="/perfil" className="mt-3 inline-block">
                    <Button size="sm" variant="accent">
                      Ver certificado
                    </Button>
                  </Link>
                )}
              </div>
            </li>
          </ol>
        </div>
      </div>
    </AppShell>
  )
}
