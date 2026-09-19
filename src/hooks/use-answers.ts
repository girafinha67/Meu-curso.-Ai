import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { submitAnswer } from '@/lib/api'
import type { Answer } from '@/types/database'

/**
 * Busca as respostas que o aluno já deu nesta aula e recupera o resultado
 * completo de cada uma (corretas/erradas, explicação, feedback de IA) —
 * sem nunca consultar `is_correct` diretamente no banco pelo cliente.
 *
 * Em vez disso, reenvia o que o aluno já respondeu (`selected_option_ids`
 * ou `open_text`, ambos das próprias respostas do usuário) pro mesmo
 * `submit-answer` que já processa envios novos. A Edge Function já é
 * idempotente pra isso: pra questões fechadas ela devolve o resultado
 * salvo sem repontuar; pra abertas, o mesmo texto bate o hash em cache e
 * reaproveita a avaliação — em nenhum dos casos gera XP de novo.
 */
export function useLessonAnswers(lessonId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['lesson_answers', lessonId, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('answers').select('*').eq('lesson_id', lessonId).eq('user_id', userId as string)
      if (error) throw error

      const entries = await Promise.all(
        ((data ?? []) as Answer[]).map(async (answer) => {
          try {
            const result = answer.open_text
              ? await submitAnswer({ questionId: answer.question_id, lessonId, openText: answer.open_text })
              : await submitAnswer({ questionId: answer.question_id, lessonId, selectedOptionIds: answer.selected_option_ids })
            return [answer.question_id, { selectedOptionIds: answer.selected_option_ids, openText: answer.open_text, result }] as const
          } catch {
            return null
          }
        })
      )

      return Object.fromEntries(entries.filter((e): e is NonNullable<typeof e> => e !== null))
    },
  })
}
