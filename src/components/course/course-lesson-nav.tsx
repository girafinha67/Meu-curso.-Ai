import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Lock, Circle, PlayCircle, ChevronDown, ChevronUp, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getLessonStatus, type LessonStatus } from '@/lib/lesson-status'
import type { Lesson, LessonProgress } from '@/types/database'

const STATUS_ICON: Record<LessonStatus, typeof CheckCircle2> = {
  completed: CheckCircle2,
  current: PlayCircle,
  available: Circle,
  locked: Lock,
}

const STATUS_CLASS: Record<LessonStatus, string> = {
  completed: 'text-primary-600',
  current: 'text-primary-600',
  available: 'text-muted-foreground',
  locked: 'text-muted-foreground/50',
}

interface CourseLessonNavProps {
  lessons: Lesson[]
  progressList: LessonProgress[]
  currentLessonId: string
}

function LessonRow({ lesson, status, active, onNavigate }: { lesson: Lesson; status: LessonStatus; active: boolean; onNavigate?: () => void }) {
  const Icon = STATUS_ICON[status]
  const row = (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors',
        active ? 'bg-primary-50 font-semibold text-primary-800' : 'text-foreground hover:bg-muted',
        status === 'locked' && 'cursor-not-allowed text-muted-foreground/60 hover:bg-transparent'
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary-600' : STATUS_CLASS[status])} />
      <span className="truncate">
        {String(lesson.position).padStart(2, '0')} — {lesson.title}
      </span>
    </div>
  )

  if (status === 'locked') return row

  return (
    <Link to="/aula/$lessonId" params={{ lessonId: lesson.id }} onClick={onNavigate}>
      {row}
    </Link>
  )
}

/** Sidebar com todas as aulas do curso e status real de cada uma. */
export function CourseLessonNav({ lessons, progressList, currentLessonId }: CourseLessonNavProps) {
  const [open, setOpen] = useState(false)
  const progressMap = new Map(progressList.map((p) => [p.lesson_id, p]))
  const completedIds = new Set(progressList.filter((p) => p.completed).map((p) => p.lesson_id))

  const rows = lessons.map((lesson, index) => ({
    lesson,
    status: getLessonStatus(lessons, index, progressMap.get(lesson.id), completedIds),
  }))

  return (
    <>
      {/* Mobile: menu expansível */}
      <div className="mb-4 rounded-xl border border-border bg-card md:hidden">
        <button
          className="focus-ring flex w-full items-center justify-between p-4 text-sm font-medium"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" /> Aulas do curso
          </span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {open && (
          <div className="flex flex-col gap-0.5 border-t border-border p-2">
            {rows.map(({ lesson, status }) => (
              <LessonRow key={lesson.id} lesson={lesson} status={status} active={lesson.id === currentLessonId} onNavigate={() => setOpen(false)} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: sidebar fixa */}
      <aside className="sticky top-24 hidden h-fit w-64 shrink-0 md:block">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aulas do curso</p>
        <nav className="flex flex-col gap-0.5">
          {rows.map(({ lesson, status }) => (
            <LessonRow key={lesson.id} lesson={lesson} status={status} active={lesson.id === currentLessonId} />
          ))}
        </nav>
      </aside>
    </>
  )
}
