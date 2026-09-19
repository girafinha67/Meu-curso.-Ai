import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import type { CourseProgress, LessonProgress, Achievement, Certificate } from '@/types/database'

export function useCourseProgress(courseId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['course_progress', user?.id, courseId],
    enabled: !!user && !!courseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('course_id', courseId as string)
        .maybeSingle()
      if (error) throw error
      return data as CourseProgress | null
    },
  })
}

export function useLessonProgressList(userId: string | undefined) {
  return useQuery({
    queryKey: ['lesson_progress_list', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('lesson_progress').select('*').eq('user_id', userId as string)
      if (error) throw error
      return (data ?? []) as LessonProgress[]
    },
  })
}

export function useIsEnrolled(courseId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['enrollment', user?.id, courseId],
    enabled: !!user && !!courseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', user!.id)
        .eq('course_id', courseId as string)
        .eq('status', 'active')
        .maybeSingle()
      if (error) throw error
      return !!data
    },
  })
}

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('achievements').select('*').eq('is_active', true).order('position')
      if (error) throw error
      return (data ?? []) as Achievement[]
    },
    staleTime: 5 * 60_000,
  })
}

export function useCertificate(userId: string | undefined, courseId: string | undefined) {
  return useQuery({
    queryKey: ['certificate', userId, courseId],
    enabled: !!userId && !!courseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId as string)
        .eq('course_id', courseId as string)
        .maybeSingle()
      if (error) throw error
      return data as Certificate | null
    },
  })
}

export function useUserAchievements(userId: string | undefined) {
  return useQuery({
    queryKey: ['user_achievements', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('user_achievements').select('achievement_id, earned_at').eq('user_id', userId as string)
      if (error) throw error
      return (data ?? []) as { achievement_id: string; earned_at: string }[]
    },
  })
}

/**
 * Sequência de dias estudados (streak), calculada a partir de datas reais
 * de conclusão de aula (`lesson_progress.completed_at`) — a mesma coluna
 * que a Edge Function `complete-lesson` já grava. Sem tabela de log de
 * atividade separada: cada dia em que pelo menos uma aula foi concluída
 * conta como "dia estudado".
 */
export function useStudyStreak(userId: string | undefined) {
  return useQuery({
    queryKey: ['study_streak', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('completed_at')
        .eq('user_id', userId as string)
        .eq('completed', true)
        .not('completed_at', 'is', null)
      if (error) throw error

      const studiedDates = new Set((data ?? []).map((row) => toLocalDateKey(new Date(row.completed_at as string))))

      // últimos 7 dias (mais antigo → hoje), pra destacar no calendário da semana
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return { date: d, key: toLocalDateKey(d), studied: studiedDates.has(toLocalDateKey(d)) }
      })

      // sequência atual: conta dias consecutivos estudados terminando hoje ou ontem
      let streak = 0
      const cursor = new Date()
      if (!studiedDates.has(toLocalDateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
      while (studiedDates.has(toLocalDateKey(cursor))) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      }

      return { streak, last7Days }
    },
  })
}

function toLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}
