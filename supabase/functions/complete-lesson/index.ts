// Edge Function: complete-lesson
// Valida se o aluno pode concluir a aula (nota mínima, todas as questões
// respondidas), aplica XP, checa conquistas e, ao concluir o curso inteiro,
// emite o certificado. Toda a autoridade fica aqui — nunca no cliente.
import { createAdminClient, corsHeaders, getAuthenticatedUser } from '../_shared/supabase-admin.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { user, admin } = await getAuthenticatedUser(req)
    if (!user) return json({ error: 'Não autenticado.' }, 401)

    const { lessonId } = await req.json()
    if (!lessonId) return json({ error: 'Requisição inválida.' }, 400)

    const { data: lesson } = await admin.from('lessons').select('*').eq('id', lessonId).maybeSingle()
    if (!lesson) return json({ error: 'Aula não encontrada.' }, 404)

    const { data: enrollment } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', lesson.course_id)
      .eq('status', 'active')
      .maybeSingle()
    if (!enrollment) return json({ error: 'Você não está matriculado neste curso.' }, 403)

    const { data: rulesRow } = await admin.from('site_settings').select('value').eq('key', 'unlock_rules').maybeSingle()
    const rules = (rulesRow?.value as any) ?? { min_score_percent: 60, require_all_questions: true, require_content_viewed: true }

    const { data: questions } = await admin.from('questions').select('id, points').eq('lesson_id', lessonId).eq('is_active', true)
    const totalQuestions = questions?.length ?? 0
    const maxScore = (questions ?? []).reduce((sum, q) => sum + q.points, 0)

    const { data: answers } = await admin.from('answers').select('question_id, score').eq('user_id', user.id).eq('lesson_id', lessonId)
    const answeredCount = answers?.length ?? 0
    const totalScore = (answers ?? []).reduce((sum, a) => sum + Number(a.score), 0)
    const percent = maxScore > 0 ? (totalScore / maxScore) * 100 : 100

    if (rules.require_all_questions && answeredCount < totalQuestions) {
      return json({ completed: false, reason: 'questions_pending' })
    }
    if (percent < (rules.min_score_percent ?? 60)) {
      return json({ completed: false, reason: 'min_score_not_met' })
    }

    const { data: gamificationRow } = await admin.from('site_settings').select('value').eq('key', 'gamification').maybeSingle()
    const gamification = (gamificationRow?.value as any) ?? { xp_lesson_completed: 100, xp_perfect_quiz: 50, xp_course_completed: 200 }

    let xpEarned = gamification.xp_lesson_completed ?? 100
    const isPerfect = totalQuestions > 0 && totalScore >= maxScore
    if (isPerfect) xpEarned += gamification.xp_perfect_quiz ?? 50

    const alreadyCompleted = await isLessonAlreadyCompleted(admin, user.id, lessonId)

    await admin.from('lesson_progress').upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        content_viewed: true,
        questions_answered: answeredCount,
        questions_total: totalQuestions,
        score: totalScore,
        max_score: maxScore,
        percent,
        completed: true,
        completed_at: new Date().toISOString(),
        xp_earned: alreadyCompleted ? 0 : xpEarned,
      },
      { onConflict: 'user_id,lesson_id' }
    )

    if (!alreadyCompleted) {
      await admin.rpc('increment_user_xp', { p_user_id: user.id, p_amount: xpEarned })
    }

    // Recalcula progresso do curso inteiro
    const { data: allLessons } = await admin
      .from('lessons')
      .select('id, position')
      .eq('course_id', lesson.course_id)
      .eq('is_published', true)
      .order('position')
    const { data: allProgress } = await admin
      .from('lesson_progress')
      .select('lesson_id, completed, score, max_score')
      .eq('user_id', user.id)
      .in('lesson_id', (allLessons ?? []).map((l) => l.id))

    const completedLessons = (allProgress ?? []).filter((p) => p.completed)
    const lessonsCompletedCount = completedLessons.length
    const totalLessons = allLessons?.length ?? 0
    const avgScore =
      completedLessons.length > 0
        ? completedLessons.reduce((s, p) => s + (p.max_score > 0 ? (p.score / p.max_score) * 10 : 0), 0) / completedLessons.length
        : 0
    const courseCompleted = totalLessons > 0 && lessonsCompletedCount >= totalLessons

    const { data: answeredAll } = await admin.from('answers').select('question_id, is_correct').eq('user_id', user.id)
    const totalCorrect = (answeredAll ?? []).filter((a) => a.is_correct).length

    let courseCompletionBonus = 0
    if (courseCompleted) {
      const { data: existingProgress } = await admin
        .from('course_progress')
        .select('completed')
        .eq('user_id', user.id)
        .eq('course_id', lesson.course_id)
        .maybeSingle()
      if (!existingProgress?.completed) {
        courseCompletionBonus = gamification.xp_course_completed ?? 200
        await admin.rpc('increment_user_xp', { p_user_id: user.id, p_amount: courseCompletionBonus })
      }
    }

    const currentIndex = (allLessons ?? []).findIndex((l) => l.id === lessonId)
    const nextLessonId = currentIndex >= 0 && currentIndex < (allLessons?.length ?? 0) - 1 ? allLessons![currentIndex + 1].id : null

    await admin
      .from('course_progress')
      .update({
        lessons_completed: lessonsCompletedCount,
        total_lessons: totalLessons,
        percent: totalLessons > 0 ? (lessonsCompletedCount / totalLessons) * 100 : 0,
        average_score: avgScore,
        questions_answered: (answeredAll ?? []).length,
        questions_correct: totalCorrect,
        completed: courseCompleted,
        completed_at: courseCompleted ? new Date().toISOString() : null,
        last_lesson_id: lessonId,
      })
      .eq('user_id', user.id)
      .eq('course_id', lesson.course_id)

    const newAchievements = await checkAndGrantAchievements(admin, user.id, {
      lessonsCompletedCount,
      isPerfectQuiz: isPerfect,
      courseCompleted,
    })

    if (courseCompleted) {
      await issueCertificateIfNeeded(admin, user.id, lesson.course_id)
    }

    return json({
      completed: true,
      score: totalScore,
      maxScore,
      xpEarned: xpEarned + courseCompletionBonus,
      nextLessonId,
      courseCompleted,
      newAchievements,
    })
  } catch (err) {
    console.error('complete-lesson error:', err)
    return json({ error: 'Não foi possível concluir a aula agora. Tente novamente.' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

async function isLessonAlreadyCompleted(admin: any, userId: string, lessonId: string) {
  const { data } = await admin.from('lesson_progress').select('completed').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle()
  return !!data?.completed
}

async function checkAndGrantAchievements(
  admin: any,
  userId: string,
  ctx: { lessonsCompletedCount: number; isPerfectQuiz: boolean; courseCompleted: boolean }
) {
  const { data: achievements } = await admin.from('achievements').select('*').eq('is_active', true)
  if (!achievements) return []

  const { data: earned } = await admin.from('user_achievements').select('achievement_id').eq('user_id', userId)
  const earnedIds = new Set((earned ?? []).map((e: any) => e.achievement_id))

  const granted: { id: string; title: string; icon: string }[] = []

  for (const a of achievements) {
    if (earnedIds.has(a.id)) continue
    let qualifies = false
    if (a.condition_type === 'lessons_completed' && ctx.lessonsCompletedCount >= a.condition_value) qualifies = true
    if (a.condition_type === 'perfect_quizzes' && ctx.isPerfectQuiz) qualifies = true
    if (a.condition_type === 'course_completed' && ctx.courseCompleted) qualifies = true

    if (qualifies) {
      await admin.from('user_achievements').insert({ user_id: userId, achievement_id: a.id })
      if (a.xp_bonus) await admin.rpc('increment_user_xp', { p_user_id: userId, p_amount: a.xp_bonus })
      granted.push({ id: a.id, title: a.title, icon: a.icon })
    }
  }

  return granted
}

async function issueCertificateIfNeeded(admin: any, userId: string, courseId: string) {
  const { data: existing } = await admin.from('certificates').select('id').eq('user_id', userId).eq('course_id', courseId).maybeSingle()
  if (existing) return

  const { data: profile } = await admin.from('profiles').select('full_name').eq('id', userId).maybeSingle()
  const { data: course } = await admin.from('courses').select('title').eq('id', courseId).maybeSingle()
  const { data: certSettingsRow } = await admin.from('site_settings').select('value').eq('key', 'certificate').maybeSingle()
  const certSettings = (certSettingsRow?.value as any) ?? { hours_load: 20 }

  const code = generateCertificateCode()

  await admin.from('certificates').insert({
    user_id: userId,
    course_id: courseId,
    code,
    student_name: profile?.full_name || 'Aluno',
    course_title: certSettings.course_name || course?.title || 'Curso',
    hours_load: certSettings.hours_load ?? 20,
  })
}

function generateCertificateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}
