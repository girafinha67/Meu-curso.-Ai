import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Clock, ArrowLeft, Sparkles } from 'lucide-react'
import { RequireAuth } from '@/components/auth-guard'
import { AppShell } from '@/components/app-shell'
import { useLessonDetail } from '@/hooks/use-lesson-detail'
import { useCourse, useLessons } from '@/hooks/use-course'
import { useCourseProgress, useLessonProgressList, useCertificate } from '@/hooks/use-progress'
import { useAuth } from '@/hooks/use-auth'
import { LessonBlockRenderer } from '@/components/course/lesson-block-renderer'
import { LessonSidebar } from '@/components/course/lesson-sidebar'
import { CourseLessonNav } from '@/components/course/course-lesson-nav'
import { Quiz } from '@/components/course/quiz'
import { LessonCompletionScreen } from '@/components/course/lesson-completion-screen'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { LoadingState, ErrorState, Skeleton } from '@/components/ui/states'
import { useLessonAnswers } from '@/hooks/use-answers'
import { completeLesson } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/aula/$lessonId')({
  component: () => (
    <RequireAuth>
      <LessonPage />
    </RequireAuth>
  ),
})

function LessonPage() {
  const { lessonId } = Route.useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useLessonDetail(lessonId)
  const { data: course } = useCourse()
  const { data: allLessons } = useLessons(course?.id)
  const { data: progressList } = useLessonProgressList(user?.id)
  const { data: courseProgress } = useCourseProgress(course?.id)
  const { data: hydratedAnswers, isLoading: loadingAnswers } = useLessonAnswers(lessonId, user?.id)
  const [xpToast, setXpToast] = useState<number | null>(null)

  function handleXpEarned(amount: number) {
    setXpToast(amount)
    setTimeout(() => setXpToast(null), 2200)
  }

  const [showComplete, setShowComplete] = useState(false)
  const [completionData, setCompletionData] = useState<Awaited<ReturnType<typeof completeLesson>> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completionError, setCompletionError] = useState<string | null>(null)

  // Marca conteúdo como visualizado (melhor esforço — backend valida via RLS)
  useState(() => {
    if (user) {
      supabase
        .from('lesson_progress')
        .upsert(
          { user_id: user.id, lesson_id: lessonId, content_viewed: true, content_viewed_at: new Date().toISOString() },
          { onConflict: 'user_id,lesson_id' }
        )
        .then(() => {})
    }
  })

  if (isLoading) {
    return (
      <AppShell>
        <LoadingState label="Carregando aula..." />
      </AppShell>
    )
  }

  if (error || !data) {
    return (
      <AppShell>
        <ErrorState onRetry={() => refetch()} />
      </AppShell>
    )
  }

  const { lesson, blocks, questions } = data
  const currentProgress = progressList?.find((p) => p.lesson_id === lessonId)
  const alreadyCompleted = currentProgress?.completed ?? false

  const index = allLessons?.findIndex((l) => l.id === lessonId) ?? -1
  const prevLesson = index > 0 ? allLessons?.[index - 1] : null
  const nextLessonInList = index >= 0 ? allLessons?.[index + 1] : null

  const { data: certificate } = useCertificate(user?.id, course?.id)

  async function handleFinishLesson() {
    setSubmitting(true)
    setCompletionError(null)
    try {
      const result = await completeLesson(lessonId)
      if (!result.completed) {
        setCompletionError(
          result.reason === 'min_score_not_met'
            ? 'Você ainda não atingiu a nota mínima. Revise as questões e tente novamente.'
            : 'Responda todas as questões antes de concluir a aula.'
        )
        return
      }
      setCompletionData(result)
      setShowComplete(true)
      queryClient.invalidateQueries({ queryKey: ['lesson_progress_list'] })
      queryClient.invalidateQueries({ queryKey: ['course_progress'] })
    } catch {
      setCompletionError('Não foi possível concluir a aula agora. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (showComplete && completionData) {
    return (
      <AppShell>
        <LessonCompletionScreen
          score={completionData.score}
          maxScore={completionData.maxScore}
          xpEarned={completionData.xpEarned}
          courseProgressPercent={allLessons?.length ? ((index + 1) / allLessons.length) * 100 : 0}
          nextLessonId={completionData.nextLessonId}
          courseCompleted={completionData.courseCompleted}
          newAchievements={completionData.newAchievements}
          certificateCode={certificate?.code}
        />
      </AppShell>
    )
  }

  return (
    <AppShell>
      {xpToast != null && (
        <div className="fixed right-4 top-20 z-50 flex animate-toast-in items-center gap-1.5 rounded-full bg-card px-4 py-2.5 shadow-elevated">
          <Sparkles className="h-4 w-4 text-accent-500" />
          <span className="text-sm font-semibold">+{xpToast} XP</span>
        </div>
      )}

      <div className="mb-6">
        <Link to="/trilha" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao curso
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
              {course?.title ? `${course.title} · ` : ''}Aula {lesson.position} de {allLessons?.length ?? 7}
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight">{lesson.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {lesson.duration_minutes} min
            </p>
          </div>

          {courseProgress && (
            <div className="w-full max-w-[180px] sm:w-auto">
              <p className="mb-1 text-right text-xs text-muted-foreground">{Math.round(courseProgress.percent)}% do curso</p>
              <ProgressBar value={courseProgress.percent} size="sm" />
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden">
        {allLessons && progressList && (
          <CourseLessonNav lessons={allLessons} progressList={progressList} currentLessonId={lessonId} />
        )}
        <LessonSidebar activeSection="conteudo" />
      </div>

      <div className="flex gap-8">
        <div className="hidden flex-col gap-6 md:flex">
          {allLessons && progressList && (
            <CourseLessonNav lessons={allLessons} progressList={progressList} currentLessonId={lessonId} />
          )}
          <LessonSidebar activeSection="conteudo" />
        </div>

        <div className="min-w-0 flex-1">
          <section id="introducao" className="mb-10">
            {lesson.objectives?.length > 0 && (
              <div className="rounded-2xl border border-border bg-muted/30 p-5">
                <p className="mb-2 text-sm font-semibold">Objetivos desta aula</p>
                <ul className="flex flex-col gap-1.5">
                  {lesson.objectives.map((obj, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section id="conteudo" className="flex flex-col gap-6">
            {blocks.map((block) => (
              <LessonBlockRenderer key={block.id} block={block} />
            ))}
          </section>

          {questions.length > 0 && (
            <section id="exercicios" className="mt-12">
              <h2 className="mb-1 text-xl font-bold">Exercícios</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Responda para consolidar o aprendizado e liberar a próxima aula.
              </p>
              {loadingAnswers ? (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
              ) : (
                <Quiz
                  questions={questions}
                  lessonId={lessonId}
                  initialAnswers={hydratedAnswers ?? {}}
                  onXpEarned={handleXpEarned}
                />
              )}
            </section>
          )}

          <section id="conclusao" className="mt-12">
            {lesson.conclusion && (
              <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-6">
                <p className="mb-2 text-sm font-semibold text-primary-700">Conclusão</p>
                <p className="text-sm">{lesson.conclusion}</p>
              </div>
            )}

            {completionError && <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-danger">{completionError}</div>}

            {!alreadyCompleted && (
              <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={handleFinishLesson} loading={submitting}>
                Concluir aula
              </Button>
            )}
          </section>

          <nav className="mt-12 flex items-center justify-between border-t border-border pt-6">
            {prevLesson ? (
              <Link
                to="/aula/$lessonId"
                params={{ lessonId: prevLesson.id }}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" /> Aula anterior
              </Link>
            ) : (
              <span />
            )}
            <ProgressBar
              value={allLessons?.length ? ((index + 1) / allLessons.length) * 100 : 0}
              className="mx-4 hidden max-w-[200px] sm:block"
              size="sm"
            />
            {nextLessonInList && alreadyCompleted ? (
              <Link
                to="/aula/$lessonId"
                params={{ lessonId: nextLessonInList.id }}
                className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
              >
                Próxima aula <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </div>
    </AppShell>
  )
}
