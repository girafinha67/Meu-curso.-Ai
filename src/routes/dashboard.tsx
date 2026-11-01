import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Target, CheckCircle2, ListChecks, Clock, Award } from 'lucide-react'
import { RequireAuth } from '@/components/auth-guard'
import { AppShell } from '@/components/app-shell'
import { useAuth } from '@/hooks/use-auth'
import { useCourse, useLessons } from '@/hooks/use-course'
import {
  useCourseProgress,
  useLessonProgressList,
  useAchievements,
  useUserAchievements,
  useStudyStreak,
} from '@/hooks/use-progress'
import { useSiteSetting } from '@/hooks/use-site-settings'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { LevelCard } from '@/components/course/level-card'
import { StreakCard } from '@/components/course/streak-card'
import { LessonCard } from '@/components/course/lesson-card'
import { Button } from '@/components/ui/button'
import { LoadingState, EmptyState } from '@/components/ui/states'
import * as Icons from 'lucide-react'
import { iconNameToPascalCase } from '@/lib/icon-name'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
})

function StatTile({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  const { profile, user } = useAuth()
  const { data: course, isLoading: loadingCourse } = useCourse()
  const { data: lessons, isLoading: loadingLessons } = useLessons(course?.id)
  const { data: courseProgress } = useCourseProgress(course?.id)
  const { data: lessonProgressList } = useLessonProgressList(user?.id)
  const { data: gamification } = useSiteSetting('gamification')
  const { data: achievements } = useAchievements()
  const { data: userAchievements } = useUserAchievements(user?.id)
  const { data: streakData } = useStudyStreak(user?.id)

  if (loadingCourse || loadingLessons) {
    return (
      <AppShell>
        <LoadingState label="Carregando seu progresso..." />
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

  // Regra de desbloqueio no cliente é só visual — a autoridade real está no backend/RLS + Edge Function.
  let nextLesson = lessons[0]
  let allDone = true
  for (const lesson of lessons) {
    if (!completedIds.has(lesson.id)) {
      nextLesson = lesson
      allDone = false
      break
    }
    nextLesson = lesson
  }

  const percent = courseProgress?.percent ?? 0
  const xp = courseProgress?.xp ?? 0
  const lessonsCompleted = courseProgress?.lessons_completed ?? 0
  const lessonsRemaining = Math.max(0, lessons.length - lessonsCompleted)
  const earnedIds = new Set((userAchievements ?? []).map((a) => a.achievement_id))

  // Tempo estudado é estimado a partir da duração real das aulas concluídas
  // (não existe um relógio de estudo cronometrado na plataforma hoje).
  const minutesStudied = lessons
    .filter((l) => completedIds.has(l.id))
    .reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0)
  const hoursStudied = (minutesStudied / 60).toFixed(1)

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Olá, {profile?.full_name?.split(' ')[0] ?? 'aluno'}! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {allDone ? 'Você concluiu todas as aulas disponíveis. 🎉' : 'Continue de onde você parou.'}
          </p>
        </div>

        <Card className="overflow-hidden border-primary-100 bg-gradient-to-br from-primary-50/60 to-transparent">
          <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {allDone ? 'Revisar aula' : 'Continue de onde parou'}
              </p>
              <p className="mt-1 text-xl font-bold">{nextLesson.title}</p>
              <div className="mt-3 max-w-sm">
                <ProgressBar value={percent} />
                <p className="mt-1.5 text-xs text-muted-foreground">{Math.round(percent)}% do curso concluído</p>
              </div>
            </div>
            <Link to="/aula/$lessonId" params={{ lessonId: nextLesson.id }}>
              <Button size="lg">
                {allDone ? 'Revisar aula' : 'Continuar aula'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <StatTile icon={CheckCircle2} label="Aulas concluídas" value={`${lessonsCompleted}/${lessons.length}`} />
          <StatTile icon={ListChecks} label="Aulas restantes" value={String(lessonsRemaining)} />
          <StatTile icon={Target} label="Nota média" value={(courseProgress?.average_score ?? 0).toFixed(1)} />
          <StatTile icon={Clock} label="Tempo estudado (estimado)" value={`${hoursStudied}h`} />
          {gamification && <LevelCard xp={xp} levels={gamification.levels} />}
          {streakData && <StreakCard streak={streakData.streak} last7Days={streakData.last7Days} />}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Aulas do curso</h2>
            <Link to="/trilha" className="text-sm font-medium text-primary-700 hover:underline">
              Ver mapa completo
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {lessons.map((lesson, index) => {
              const locked = index > 0 && !completedIds.has(lessons[index - 1].id)
              return <LessonCard key={lesson.id} lesson={lesson} progress={progressMap.get(lesson.id)} locked={locked} />
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">Conquistas</h2>
          {achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {achievements.map((a) => {
                const earned = earnedIds.has(a.id)
                const IconComp = (Icons as any)[iconNameToPascalCase(a.icon)] ?? Award
                return (
                  <Card key={a.id} className={earned ? '' : 'opacity-60 grayscale'}>
                    <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
                      <span
                        className={cnAchievement(earned)}
                      >
                        <IconComp className="h-5 w-5" />
                      </span>
                      <p className="text-xs font-medium">{a.title}</p>
                      <Badge variant={earned ? 'accent' : 'locked'}>{earned ? 'Conquistada' : 'Bloqueada'}</Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState title="Nenhuma conquista disponível ainda" />
          )}
        </div>
      </div>
    </AppShell>
  )
}

function cnAchievement(earned: boolean) {
  return earned
    ? 'flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 text-accent-600'
    : 'flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground'
}
