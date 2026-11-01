import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Lesson, LessonBlock, Question, QuestionOption } from '@/types/database'

export function useLessonDetail(lessonId: string) {
  return useQuery({
    queryKey: ['lesson_detail', lessonId],
    queryFn: async () => {
      const { data: lesson, error: lessonError } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
      if (lessonError) throw lessonError

      const { data: blocks, error: blocksError } = await supabase
        .from('lesson_blocks')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('position')
      if (blocksError) throw blocksError

      // Nota de segurança: is_correct das opções NÃO deve vir para o cliente
      // antes de responder. Aqui assumimos uma view/RPC "questions_public"
      // no backend que omite is_correct — ver nota no README sobre RLS.
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*, question_options(id, position, text)')
        .eq('lesson_id', lessonId)
        .eq('is_active', true)
        .order('position')
      if (questionsError) throw questionsError

      return {
        lesson: lesson as Lesson,
        blocks: (blocks ?? []) as LessonBlock[],
        questions: ((questions ?? []) as any[]).map((q) => ({
          ...q,
          options: (q.question_options as QuestionOption[]) ?? [],
        })) as Question[],
      }
    },
  })
}
