import type { Lesson, LessonProgress } from '@/types/database'

export type LessonStatus = 'completed' | 'current' | 'available' | 'locked'

/**
 * Calcula o status de cada aula a partir de dados reais de progresso —
 * usado tanto no mapa do curso (/trilha) quanto na sidebar da página da
 * aula, pra manter os dois lugares sempre consistentes entre si.
 */
export function getLessonStatus(
  lessons: Lesson[],
  index: number,
  progress: LessonProgress | undefined,
  completedIds: Set<string>
): LessonStatus {
  if (progress?.completed) return 'completed'
  const locked = index > 0 && !completedIds.has(lessons[index - 1].id)
  if (locked) return 'locked'
  if (progress?.content_viewed) return 'current'
  return 'available'
}
