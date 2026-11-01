import { Link } from '@tanstack/react-router'
import { Lock, CheckCircle2, PlayCircle, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { cn } from '@/lib/utils'
import type { Lesson, LessonProgress } from '@/types/database'

interface LessonCardProps {
  lesson: Lesson
  progress?: LessonProgress
  locked: boolean
}

export function LessonCard({ lesson, progress, locked }: LessonCardProps) {
  const completed = progress?.completed ?? false
  const percent = progress?.percent ?? 0

  const content = (
    <Card
      className={cn(
        'flex items-center gap-4 p-5 transition-all',
        !locked && 'hover:-translate-y-0.5 hover:shadow-md',
        locked && 'opacity-60'
      )}
    >
      <span
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold',
          completed ? 'bg-success/10 text-success' : locked ? 'bg-muted text-muted-foreground' : 'bg-primary-50 text-primary-700'
        )}
      >
        {locked ? <Lock className="h-5 w-5" /> : completed ? <CheckCircle2 className="h-5 w-5" /> : lesson.position}
      </span>

      <div className="flex-1">
        <p className="font-semibold">{lesson.title}</p>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{lesson.description}</p>
        {!locked && percent > 0 && !completed && (
          <div className="mt-2 max-w-[200px]">
            <ProgressBar value={percent} size="sm" />
          </div>
        )}
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
        <Clock className="h-3.5 w-3.5" />
        {lesson.duration_minutes} min
      </div>

      {!locked && !completed && <PlayCircle className="h-6 w-6 shrink-0 text-primary-600" />}
    </Card>
  )

  if (locked) return <div aria-disabled className="cursor-not-allowed">{content}</div>

  return (
    <Link to="/aula/$lessonId" params={{ lessonId: lesson.id }}>
      {content}
    </Link>
  )
}
