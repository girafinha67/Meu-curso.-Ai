import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, Lesson } from '@/types/database'

export function useCourse() {
  return useQuery({
    queryKey: ['course'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as Course | null
    },
    staleTime: 60_000,
  })
}

export function useLessons(courseId: string | undefined) {
  return useQuery({
    queryKey: ['lessons', courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId as string)
        .eq('is_published', true)
        .order('position', { ascending: true })
      if (error) throw error
      return (data ?? []) as Lesson[]
    },
    staleTime: 60_000,
  })
}

/**
 * Quantidade real de exercícios por aula, para exibir no currículo público.
 * É "best effort": se a política de acesso da tabela `questions` não
 * permitir leitura pública, a consulta falha em silêncio e a interface
 * simplesmente não mostra o número — nunca inventa uma contagem.
 */
export function useLessonQuestionCounts(lessonIds: string[] | undefined) {
  return useQuery({
    queryKey: ['lesson_question_counts', lessonIds],
    enabled: !!lessonIds && lessonIds.length > 0,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('questions').select('lesson_id').in('lesson_id', lessonIds as string[])
        if (error) throw error
        const counts: Record<string, number> = {}
        for (const row of data ?? []) {
          counts[row.lesson_id] = (counts[row.lesson_id] ?? 0) + 1
        }
        return counts
      } catch {
        return {} as Record<string, number>
      }
    },
    staleTime: 60_000,
  })
}
