import { supabase } from '@/lib/supabase'

interface SubmitClosedPayload {
  questionId: string
  lessonId: string
  selectedOptionIds: string[]
}

interface SubmitOpenPayload {
  questionId: string
  lessonId: string
  openText: string
}

/**
 * Toda correção acontece no backend (Edge Function `submit-answer`),
 * usando a service role key — nunca no navegador. Isso impede que o
 * aluno manipule nota, gabarito ou status de conclusão pelo DevTools.
 */
export async function submitAnswer(payload: SubmitClosedPayload | SubmitOpenPayload) {
  const { data, error } = await supabase.functions.invoke('submit-answer', { body: payload })
  if (error) throw error
  return data as {
    correct: boolean
    explanation: string | null
    correctOptionIds: string[]
    score: number
    maxScore: number
    feedback: string | null
    strengths: string[]
    improvements: string[]
    xpEarned: number
  }
}

export async function completeLesson(lessonId: string) {
  const { data, error } = await supabase.functions.invoke('complete-lesson', { body: { lessonId } })
  if (error) throw error
  return data as {
    completed: boolean
    score: number
    maxScore: number
    xpEarned: number
    nextLessonId: string | null
    courseCompleted: boolean
    newAchievements?: { id: string; title: string; icon: string }[]
    reason?: string
  }
}
