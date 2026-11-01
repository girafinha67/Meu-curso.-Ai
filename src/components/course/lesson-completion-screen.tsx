import { Link } from '@tanstack/react-router'
import { PartyPopper, ArrowRight, Award, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Confetti } from '@/components/course/confetti'

export function LessonCompletionScreen({
  score,
  maxScore,
  xpEarned,
  courseProgressPercent,
  nextLessonId,
  courseCompleted,
  newAchievements = [],
  certificateCode,
}: {
  score: number
  maxScore: number
  xpEarned: number
  courseProgressPercent: number
  nextLessonId: string | null
  courseCompleted: boolean
  newAchievements?: { id: string; title: string }[]
  certificateCode?: string | null
}) {
  return (
    <div className="relative mx-auto max-w-lg animate-scale-in overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-b from-primary-50 to-background p-8 text-center">
      {courseCompleted && <Confetti />}

      <span
        className={
          courseCompleted
            ? 'mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent-500 text-white shadow-glow-accent'
            : 'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white'
        }
      >
        {courseCompleted ? <Trophy className="h-9 w-9" /> : <PartyPopper className="h-8 w-8" />}
      </span>

      <h2 className="mt-5 font-display text-2xl font-bold">
        {courseCompleted ? 'Curso concluído! 🎉' : 'Parabéns! Você concluiu esta aula.'}
      </h2>
      {courseCompleted && (
        <p className="mt-1 text-sm text-muted-foreground">Você terminou todas as aulas e liberou seu certificado.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-background p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Nota</p>
          <p className="text-xl font-bold">
            {score.toFixed(1)}/{maxScore}
          </p>
        </div>
        <div className="rounded-2xl bg-background p-4 shadow-soft">
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Award className="h-3.5 w-3.5" /> XP ganho
          </p>
          <p className="text-xl font-bold text-accent-600">+{xpEarned}</p>
        </div>
      </div>

      {newAchievements.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-accent-200 bg-accent-50 p-4 text-left">
          <p className="text-xs font-semibold text-accent-700">🏆 Nova conquista desbloqueada</p>
          {newAchievements.map((a) => (
            <p key={a.id} className="text-sm font-medium">
              {a.title}
            </p>
          ))}
        </div>
      )}

      <div className="mt-6">
        <ProgressBar value={courseProgressPercent} />
        <p className="mt-1.5 text-xs text-muted-foreground">{Math.round(courseProgressPercent)}% do curso concluído</p>
      </div>

      <div className="mt-8">
        {courseCompleted ? (
          <Link to={certificateCode ? '/certificado/$code' : '/perfil'} params={certificateCode ? { code: certificateCode } : undefined}>
            <Button size="lg" variant="accent" className="w-full">
              Ver meu certificado
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : nextLessonId ? (
          <Link to="/aula/$lessonId" params={{ lessonId: nextLessonId }}>
            <Button size="lg" className="w-full">
              Continuar para a próxima aula
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link to="/dashboard">
            <Button size="lg" className="w-full">
              Voltar ao dashboard
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
