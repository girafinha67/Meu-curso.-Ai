import { Clock, HelpCircle, Lock, CheckCircle2 } from 'lucide-react'
import { useCourse, useLessons, useLessonQuestionCounts } from '@/hooks/use-course'
import { Skeleton } from '@/components/ui/states'

export function CurriculumSection() {
  const { data: course } = useCourse()
  const { data: lessons, isLoading } = useLessons(course?.id)
  const { data: questionCounts } = useLessonQuestionCounts(lessons?.map((l) => l.id))

  return (
    <section className="py-20 md:py-28" id="curriculo">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Currículo do curso</h2>
          <p className="mt-4 text-muted-foreground">
            {lessons?.length ?? 7} aulas práticas, do zero até a entrega do primeiro projeto.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-3">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}

          {lessons?.map((lesson) => {
            const exerciseCount = questionCounts?.[lesson.id]
            return (
              <div
                key={lesson.id}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 font-display font-bold text-primary-700">
                  {String(lesson.position).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold">{lesson.title}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <Lock className="h-3 w-3" /> Após a matrícula
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>

                  {lesson.objectives?.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1">
                      {lesson.objectives.slice(0, 3).map((objective) => (
                        <li key={objective} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {lesson.duration_minutes} min
                    </span>
                    {exerciseCount != null && (
                      <span className="flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5" /> {exerciseCount} exercício{exerciseCount === 1 ? '' : 's'}
                      </span>
                    )}
                    <span>
                      Aula {lesson.position} de {lessons.length}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
