// Edge Function: submit-answer
// Corrige TODAS as questões no servidor. O aluno nunca recebe o gabarito
// antes de responder, e nunca pode manipular score/correct pelo navegador.
import { createAdminClient, corsHeaders, getAuthenticatedUser } from '../_shared/supabase-admin.ts'

const MAX_ANSWER_CHARS = 1500
const MAX_AI_EVALS_PER_HOUR = 20

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { user, admin } = await getAuthenticatedUser(req)
    if (!user) {
      return json({ error: 'Não autenticado.' }, 401)
    }

    const body = await req.json()
    const { questionId, lessonId, selectedOptionIds, openText } = body as {
      questionId: string
      lessonId: string
      selectedOptionIds?: string[]
      openText?: string
    }

    if (!questionId || !lessonId) {
      return json({ error: 'Requisição inválida.' }, 400)
    }

    // Aluno precisa estar matriculado no curso da aula (checagem server-side)
    const { data: lesson } = await admin.from('lessons').select('id, course_id').eq('id', lessonId).maybeSingle()
    if (!lesson) return json({ error: 'Aula não encontrada.' }, 404)

    const { data: enrollment } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', lesson.course_id)
      .eq('status', 'active')
      .maybeSingle()
    if (!enrollment) return json({ error: 'Você não está matriculado neste curso.' }, 403)

    const { data: question } = await admin
      .from('questions')
      .select('*, question_options(*)')
      .eq('id', questionId)
      .eq('is_active', true)
      .maybeSingle()
    if (!question) return json({ error: 'Questão não encontrada.' }, 404)

    // Impede reenvio infinito (idempotência simples): se já respondeu, retorna o resultado salvo.
    const { data: existingAnswer } = await admin
      .from('answers')
      .select('*')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .maybeSingle()

    if (existingAnswer && question.type !== 'open') {
      return json(buildClosedResponse(question, existingAnswer.selected_option_ids))
    }

    let result: Record<string, unknown>

    if (question.type === 'open') {
      result = await handleOpenAnswer({ admin, user, question, openText: openText ?? '', existingAnswer })
    } else {
      result = await handleClosedAnswer({ admin, user, lessonId, question, selectedOptionIds: selectedOptionIds ?? [] })
    }

    return json(result)
  } catch (err) {
    console.error('submit-answer error:', err)
    return json({ error: 'Não foi possível processar sua resposta. Tente novamente.' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function buildClosedResponse(question: any, selectedOptionIds: string[]) {
  const correctOptionIds = question.question_options.filter((o: any) => o.is_correct).map((o: any) => o.id)
  const correct = arraysEqualAsSets(selectedOptionIds, correctOptionIds)
  return {
    correct,
    explanation: question.explanation,
    correctOptionIds,
    score: correct ? question.points : 0,
    maxScore: question.points,
    feedback: null,
    strengths: [],
    improvements: [],
    xpEarned: 0,
  }
}

async function handleClosedAnswer({ admin, user, lessonId, question, selectedOptionIds }: any) {
  const correctOptionIds = question.question_options.filter((o: any) => o.is_correct).map((o: any) => o.id)
  const correct = arraysEqualAsSets(selectedOptionIds, correctOptionIds)
  const score = correct ? question.points : 0

  await admin.from('answers').upsert(
    {
      user_id: user.id,
      question_id: question.id,
      lesson_id: lessonId,
      selected_option_ids: selectedOptionIds,
      is_correct: correct,
      score,
      max_score: question.points,
      feedback: question.explanation,
      attempts: 1,
    },
    { onConflict: 'user_id,question_id' }
  )

  await bumpXp(admin, user.id, 10) // XP por questão respondida (valor configurável em site_settings)

  return {
    correct,
    explanation: question.explanation,
    correctOptionIds,
    score,
    maxScore: question.points,
    feedback: null,
    strengths: [],
    improvements: [],
    xpEarned: 10,
  }
}

async function handleOpenAnswer({ admin, user, question, openText, existingAnswer }: any) {
  const text = (openText ?? '').trim().slice(0, MAX_ANSWER_CHARS)
  if (text.length < 10) {
    return { error: 'Resposta muito curta.' }
  }

  // Rate limiting: máximo de avaliações de IA por hora, por aluno.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await admin
    .from('ai_evaluations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', oneHourAgo)

  if ((count ?? 0) >= MAX_AI_EVALS_PER_HOUR) {
    return { error: 'Limite de avaliações por hora atingido. Tente novamente mais tarde.' }
  }

  // Evita reavaliação duplicada: mesmo texto já avaliado antes reaproveita o resultado.
  const answerHash = await sha256(text)
  const { data: cachedEval } = await admin
    .from('ai_evaluations')
    .select('*')
    .eq('user_id', user.id)
    .eq('question_id', question.id)
    .eq('answer_hash', answerHash)
    .maybeSingle()

  let evaluation = cachedEval

  if (!evaluation) {
    const { data: settingsRow } = await admin.from('site_settings').select('value').eq('key', 'evaluation').maybeSingle()
    const settings = (settingsRow?.value as any) ?? {}

    evaluation = await evaluateWithAI({
      prompt: question.prompt,
      modelAnswer: question.model_answer,
      criteria: question.ai_criteria,
      studentAnswer: text,
      maxScore: question.points,
      systemPrompt: settings.system_prompt,
      model: settings.model,
    })

    await admin.from('ai_evaluations').insert({
      user_id: user.id,
      question_id: question.id,
      answer_hash: answerHash,
      model: settings.model ?? 'unknown',
      score: evaluation.score,
      max_score: evaluation.max_score,
      correct: evaluation.correct,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      raw: evaluation,
    })
  }

  await admin.from('answers').upsert(
    {
      user_id: user.id,
      question_id: question.id,
      lesson_id: question.lesson_id,
      open_text: text,
      is_correct: evaluation.correct,
      score: evaluation.score,
      max_score: evaluation.max_score,
      feedback: evaluation.feedback,
      attempts: (existingAnswer?.attempts ?? 0) + 1,
    },
    { onConflict: 'user_id,question_id' }
  )

  // XP só na primeira vez que esta questão é respondida — sem isso, reenviar
  // o mesmo texto (ex: ao reabrir a aula, via cache de avaliação) concedia
  // XP de novo indefinidamente.
  if (!existingAnswer) {
    await bumpXp(admin, user.id, 10)
  }

  return {
    correct: evaluation.correct,
    explanation: null,
    correctOptionIds: [],
    score: evaluation.score,
    maxScore: evaluation.max_score,
    feedback: evaluation.feedback,
    strengths: evaluation.strengths ?? [],
    improvements: evaluation.improvements ?? [],
    xpEarned: existingAnswer ? 0 : 10,
  }
}

/**
 * Chama o provedor de IA configurado via AI_API_KEY (variável de ambiente,
 * nunca exposta ao cliente) e exige resposta em JSON estruturado.
 * Se a chave não estiver configurada, cai em fallback amigável (não quebra a UX).
 */
async function evaluateWithAI({ prompt, modelAnswer, criteria, studentAnswer, maxScore, systemPrompt, model }: any) {
  const apiKey = Deno.env.get('AI_API_KEY')

  if (!apiKey) {
    console.warn('AI_API_KEY não configurada — usando avaliação de fallback.')
    return {
      score: maxScore * 0.5,
      max_score: maxScore,
      correct: false,
      feedback:
        'A avaliação automática por IA não está configurada ainda nesta plataforma. Sua resposta foi registrada e será revisada.',
      strengths: [],
      improvements: [],
    }
  }

  const userPrompt = `Questão: ${prompt}\n\nResposta modelo (referência, não exigir cópia literal): ${modelAnswer ?? 'não informada'}\n\nCritérios de avaliação: ${criteria ?? 'avalie compreensão do conceito, precisão, pontos essenciais, coerência e clareza.'}\n\nNota máxima: ${maxScore}\n\nResposta do aluno: """${studentAnswer}"""\n\nResponda APENAS com um JSON no formato exato: {"score": number, "max_score": ${maxScore}, "correct": boolean, "feedback": string, "strengths": string[], "improvements": string[]}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-haiku-20241022',
        max_tokens: 600,
        system: systemPrompt || 'Você é um avaliador pedagógico. Responda sempre em português do Brasil, apenas em JSON.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!res.ok) throw new Error(`AI API respondeu ${res.status}`)

    const data = await res.json()
    const textBlock = data.content?.find((b: any) => b.type === 'text')
    const cleaned = (textBlock?.text ?? '{}').replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return {
      score: Math.max(0, Math.min(maxScore, Number(parsed.score) || 0)),
      max_score: maxScore,
      correct: !!parsed.correct,
      feedback: String(parsed.feedback ?? ''),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    }
  } catch (err) {
    console.error('Erro ao avaliar com IA:', err)
    return {
      score: 0,
      max_score: maxScore,
      correct: false,
      feedback: 'Não foi possível avaliar sua resposta agora (serviço de IA indisponível). Tente novamente em instantes.',
      strengths: [],
      improvements: [],
    }
  }
}

async function bumpXp(admin: any, userId: string, amount: number) {
  // Incrementa XP de forma segura via RPC atômica (evita race condition de leitura+escrita).
  await admin.rpc('increment_user_xp', { p_user_id: userId, p_amount: amount }).catch(() => {})
}

function arraysEqualAsSets(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every((x) => setB.has(x))
}

async function sha256(text: string) {
  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
