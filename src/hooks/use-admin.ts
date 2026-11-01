import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin_metrics'],
    queryFn: async () => {
      const [
        { count: totalStudents },
        { count: activeStudents },
        { data: completedLessonsAgg },
        { data: avgScoreAgg },
        { data: paidOrders },
        { count: certificatesCount },
      ] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('course_progress').select('id', { count: 'exact', head: true }).gt('lessons_completed', 0),
        supabase.from('lesson_progress').select('completed').eq('completed', true),
        supabase.from('course_progress').select('average_score').gt('lessons_completed', 0),
        supabase.from('orders').select('amount_cents').eq('status', 'paid'),
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
      ])

      const completedLessons = completedLessonsAgg?.length ?? 0
      const scores = (avgScoreAgg ?? []).map((r) => r.average_score).filter((s) => s != null)
      const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      const revenue = (paidOrders ?? []).reduce((sum, o) => sum + o.amount_cents, 0)

      return {
        totalStudents: totalStudents ?? 0,
        activeStudents: activeStudents ?? 0,
        completedLessons,
        avgScore,
        salesCount: paidOrders?.length ?? 0,
        revenueCents: revenue,
        certificatesCount: certificatesCount ?? 0,
      }
    },
    staleTime: 30_000,
  })
}

export function useAdminStudents() {
  return useQuery({
    queryKey: ['admin_students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, course_progress(percent, xp, level, completed)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAdminCertificates() {
  return useQuery({
    queryKey: ['admin_certificates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('certificates').select('*').order('issued_at', { ascending: false }).limit(100)
      if (error) throw error
      return data ?? []
    },
  })
}
