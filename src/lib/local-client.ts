/**
 * Cliente "Supabase local": implementa só o subconjunto da API usado pelo app,
 * guardando tudo no localStorage. É usado automaticamente quando
 * VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY não estão definidas.
 * Não é seguro para produção real (senhas ficam no navegador) — é um modo demo.
 */
import { buildSeed, type LocalDB } from './local-seed'

type Row = Record<string, any>
type Result = { data: any; error: any; count?: number | null }

const DB_KEY = 'sitesia_local_db_v1'
const SESSION_KEY = 'sitesia_local_session_v1'

// ---------- armazenamento ----------
let memoryDB: LocalDB | null = null
let memorySession: string | null = null

function loadDB(): LocalDB {
  if (memoryDB) return memoryDB
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      memoryDB = JSON.parse(raw)
      return memoryDB!
    }
  } catch {
    /* ignora */
  }
  memoryDB = buildSeed()
  saveDB()
  return memoryDB
}

function saveDB() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(memoryDB))
  } catch {
    /* sem localStorage: continua só em memória */
  }
}

function getSessionUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return memorySession
  }
}

function setSessionUserId(id: string | null) {
  memorySession = id
  try {
    if (id) localStorage.setItem(SESSION_KEY, id)
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignora */
  }
}

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const nowIso = () => new Date().toISOString()

const DEFAULTS: Record<string, () => Row> = {
  lessons: () => ({ is_published: true, objectives: [], key_concepts: [] }),
  questions: () => ({ is_active: true, points: 10 }),
  answers: () => ({ attempts: 1, selected_option_ids: [] }),
  lesson_progress: () => ({ content_viewed: false, questions_answered: 0, questions_total: 0, score: 0, max_score: 0, percent: 0, completed: false, xp_earned: 0 }),
  course_progress: () => ({ lessons_completed: 0, total_lessons: 0, percent: 0, average_score: 0, questions_answered: 0, questions_correct: 0, xp: 0, level: 1, completed: false }),
}

// ---------- relações embutidas (select 'a, b(c,d)') ----------
const RELATIONS: Record<string, Record<string, { kind: 'many' | 'one'; table: string; fk: string; ownKey?: string }>> = {
  questions: { question_options: { kind: 'many', table: 'question_options', fk: 'question_id' } },
  profiles: { course_progress: { kind: 'many', table: 'course_progress', fk: 'user_id' } },
  orders: { profiles: { kind: 'one', table: 'profiles', fk: 'id', ownKey: 'user_id' } },
}

function splitTop(str: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of str) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

function project(db: LocalDB, table: string, rows: Row[], selectStr: string): Row[] {
  const tokens = splitTop(selectStr || '*')
  const all = tokens.includes('*')
  const plain = tokens.filter((t) => t !== '*' && !t.includes('('))
  const embeds = tokens.filter((t) => t.includes('(')).map((t) => {
    const i = t.indexOf('(')
    return { name: t.slice(0, i).trim(), sub: t.slice(i + 1, t.lastIndexOf(')')) }
  })

  return rows.map((row) => {
    const out: Row = all ? { ...row } : {}
    if (!all) for (const c of plain) out[c] = row[c]
    for (const e of embeds) {
      const rel = RELATIONS[table]?.[e.name]
      if (!rel) continue
      if (rel.kind === 'many') {
        let kids = (db[rel.table] ?? []).filter((k) => k[rel.fk] === row.id)
        kids = [...kids].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        out[e.name] = project(db, rel.table, kids, e.sub)
      } else {
        const parent = (db[rel.table] ?? []).find((p) => p[rel.fk] === row[rel.ownKey ?? 'id'])
        out[e.name] = parent ? project(db, rel.table, [parent], e.sub)[0] : null
      }
    }
    return out
  })
}

// ---------- query builder ----------
type Filter = (r: Row) => boolean

class Query implements PromiseLike<Result> {
  private op: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select'
  private filters: Filter[] = []
  private orders: { col: string; asc: boolean }[] = []
  private limitN: number | null = null
  private selectStr = '*'
  private head = false
  private wantCount = false
  private mode: 'many' | 'single' | 'maybe' = 'many'
  private payload: any = null
  private onConflict: string[] = []
  private returning = false

  constructor(private table: string) {}

  select(cols = '*', opts?: { count?: 'exact'; head?: boolean }) {
    if (this.op === 'select') {
      this.selectStr = cols
    } else {
      this.returning = true
      this.selectStr = cols
    }
    if (opts?.count) this.wantCount = true
    if (opts?.head) this.head = true
    return this
  }
  insert(values: Row | Row[]) { this.op = 'insert'; this.payload = values; return this }
  update(values: Row) { this.op = 'update'; this.payload = values; return this }
  upsert(values: Row | Row[], opts?: { onConflict?: string }) {
    this.op = 'upsert'
    this.payload = values
    this.onConflict = (opts?.onConflict ?? 'id').split(',').map((s) => s.trim())
    return this
  }
  delete() { this.op = 'delete'; return this }

  eq(col: string, val: any) { this.filters.push((r) => r[col] === val); return this }
  neq(col: string, val: any) { this.filters.push((r) => r[col] !== val); return this }
  gt(col: string, val: any) { this.filters.push((r) => r[col] != null && r[col] > val); return this }
  gte(col: string, val: any) { this.filters.push((r) => r[col] != null && r[col] >= val); return this }
  lt(col: string, val: any) { this.filters.push((r) => r[col] != null && r[col] < val); return this }
  lte(col: string, val: any) { this.filters.push((r) => r[col] != null && r[col] <= val); return this }
  in(col: string, vals: any[]) { this.filters.push((r) => vals.includes(r[col])); return this }
  is(col: string, val: any) { this.filters.push((r) => (val === null ? r[col] == null : r[col] === val)); return this }
  not(col: string, op: string, val: any) {
    if (op === 'is') this.filters.push((r) => (val === null ? r[col] != null : r[col] !== val))
    else if (op === 'eq') this.filters.push((r) => r[col] !== val)
    return this
  }
  order(col: string, opts?: { ascending?: boolean }) { this.orders.push({ col, asc: opts?.ascending !== false }); return this }
  limit(n: number) { this.limitN = n; return this }
  single() { this.mode = 'single'; return this }
  maybeSingle() { this.mode = 'maybe'; return this }

  then<A = Result, B = never>(
    onfulfilled?: ((value: Result) => A | PromiseLike<A>) | null,
    onrejected?: ((reason: any) => B | PromiseLike<B>) | null
  ): Promise<A | B> {
    let result: Result
    try {
      result = this.run()
    } catch (e: any) {
      result = { data: null, error: { message: e?.message ?? 'Erro local' } }
    }
    return Promise.resolve(result).then(onfulfilled, onrejected)
  }

  private matches(r: Row) { return this.filters.every((f) => f(r)) }

  private finish(rows: Row[], count: number | null): Result {
    const db = loadDB()
    let out = project(db, this.table, rows, this.selectStr)
    if (this.mode === 'many') return { data: this.head ? null : out, error: null, count: this.wantCount ? count : null }
    if (out.length === 0) {
      if (this.mode === 'maybe') return { data: null, error: null }
      return { data: null, error: { code: 'PGRST116', message: 'Nenhum registro encontrado' } }
    }
    if (this.mode === 'single' && out.length > 1) return { data: null, error: { code: 'PGRST116', message: 'Mais de um registro' } }
    return { data: out[0], error: null }
  }

  private run(): Result {
    const db = loadDB()
    const table = (db[this.table] ??= [])

    if (this.op === 'select') {
      let rows = table.filter((r) => this.matches(r))
      const count = rows.length
      for (const o of [...this.orders].reverse()) {
        rows = [...rows].sort((a, b) => {
          const x = a[o.col]
          const y = b[o.col]
          if (x === y) return 0
          if (x == null) return 1
          if (y == null) return -1
          return (x > y ? 1 : -1) * (o.asc ? 1 : -1)
        })
      }
      if (this.limitN != null) rows = rows.slice(0, this.limitN)
      return this.finish(rows, count)
    }

    if (this.op === 'insert' || this.op === 'upsert') {
      const items: Row[] = Array.isArray(this.payload) ? this.payload : [this.payload]
      const saved: Row[] = []
      for (const item of items) {
        if (this.op === 'upsert') {
          const existing = table.find((r) => this.onConflict.every((c) => r[c] === item[c]))
          if (existing) {
            Object.assign(existing, item, { updated_at: nowIso() })
            saved.push(existing)
            continue
          }
        }
        const row: Row = { ...(DEFAULTS[this.table]?.() ?? {}), ...item }
        if (this.table !== 'site_settings' && row.id == null) row.id = uid()
        if (row.created_at == null) row.created_at = nowIso()
        table.push(row)
        saved.push(row)
      }
      saveDB()
      return this.returning ? this.finish(saved, saved.length) : { data: null, error: null }
    }

    if (this.op === 'update') {
      const rows = table.filter((r) => this.matches(r))
      for (const r of rows) Object.assign(r, this.payload, { updated_at: nowIso() })
      saveDB()
      return this.returning ? this.finish(rows, rows.length) : { data: null, error: null }
    }

    // delete
    const removed = table.filter((r) => this.matches(r))
    db[this.table] = table.filter((r) => !this.matches(r))
    if (this.table === 'questions') {
      const ids = new Set(removed.map((r) => r.id))
      db.question_options = (db.question_options ?? []).filter((o) => !ids.has(o.question_id))
    }
    saveDB()
    return { data: null, error: null }
  }
}

// ---------- helpers de domínio ----------
function setting(db: LocalDB, key: string): any {
  return db.site_settings.find((s) => s.key === key)?.value ?? null
}

function computeLevel(xp: number, db: LocalDB) {
  const levels: { min_xp: number }[] = setting(db, 'gamification')?.levels ?? [{ min_xp: 0 }]
  return Math.max(1, levels.filter((l) => xp >= l.min_xp).length)
}

function incrementXp(db: LocalDB, userId: string, amount: number) {
  const cp = db.course_progress.find((p) => p.user_id === userId)
  if (!cp) return
  cp.xp = (cp.xp ?? 0) + amount
  cp.level = computeLevel(cp.xp, db)
}

function arraysEqualAsSets(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const s = new Set(b)
  return a.every((x) => s.has(x))
}

function evaluateOpenLocally(text: string, modelAnswer: string | null, maxScore: number) {
  const words = (s: string) => (s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z0-9]{5,}/g) ?? [])
  const keys = Array.from(new Set(words(modelAnswer ?? '')))
  const given = new Set(words(text))
  const hits = keys.filter((k) => given.has(k)).length
  const ratio = keys.length ? hits / keys.length : 0.7
  const lengthOk = text.length >= 40
  const raw = Math.min(1, 0.35 + ratio * 0.9 + (lengthOk ? 0.1 : 0))
  const score = Math.round(maxScore * raw * 10) / 10
  const correct = raw >= 0.6
  return {
    score,
    max_score: maxScore,
    correct,
    feedback: correct
      ? 'Boa resposta! Você cobriu os pontos principais. (Avaliação automática local — modo demonstração.)'
      : 'Sua resposta ainda está incompleta. Revise o conteúdo da aula e tente detalhar mais. (Avaliação automática local — modo demonstração.)',
    strengths: correct ? ['Boa cobertura dos conceitos da aula'] : [],
    improvements: correct ? [] : ['Inclua mais detalhes e conceitos vistos na aula'],
  }
}

function certificateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let c = ''
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)]
  return c
}

// ---------- "Edge Functions" locais ----------
function currentUser(db: LocalDB) {
  const id = getSessionUserId()
  return id ? db.auth_users.find((u) => u.id === id) ?? null : null
}

function fnSubmitAnswer(db: LocalDB, user: Row, body: any) {
  const { questionId, lessonId, selectedOptionIds, openText } = body ?? {}
  const lesson = db.lessons.find((l) => l.id === lessonId)
  if (!lesson) return { error: 'Aula não encontrada.' }
  const enrolled = db.enrollments.some((e) => e.user_id === user.id && e.course_id === lesson.course_id && e.status === 'active')
  if (!enrolled) return { error: 'Você não está matriculado neste curso.' }
  const question = db.questions.find((q) => q.id === questionId && q.is_active)
  if (!question) return { error: 'Questão não encontrada.' }
  const options = db.question_options.filter((o) => o.question_id === question.id)
  const existing = db.answers.find((a) => a.user_id === user.id && a.question_id === questionId)

  if (question.type !== 'open') {
    const correctIds = options.filter((o) => o.is_correct).map((o) => o.id)
    const chosen: string[] = existing ? existing.selected_option_ids : selectedOptionIds ?? []
    const correct = arraysEqualAsSets(chosen, correctIds)
    const base = {
      correct,
      explanation: question.explanation,
      correctOptionIds: correctIds,
      score: correct ? question.points : 0,
      maxScore: question.points,
      feedback: null,
      strengths: [] as string[],
      improvements: [] as string[],
    }
    if (existing) return { ...base, xpEarned: 0 }
    db.answers.push({ id: uid(), user_id: user.id, question_id: questionId, lesson_id: lessonId, selected_option_ids: chosen, open_text: null, is_correct: correct, score: base.score, max_score: question.points, feedback: question.explanation, attempts: 1, created_at: nowIso() })
    incrementXp(db, user.id, 10)
    return { ...base, xpEarned: 10 }
  }

  const text = String(openText ?? '').trim().slice(0, 1500)
  if (text.length < 10) return { error: 'Resposta muito curta.' }
  const ev = evaluateOpenLocally(text, question.model_answer, question.points)
  if (existing) {
    Object.assign(existing, { open_text: text, is_correct: ev.correct, score: ev.score, max_score: ev.max_score, feedback: ev.feedback, attempts: (existing.attempts ?? 0) + 1 })
  } else {
    db.answers.push({ id: uid(), user_id: user.id, question_id: questionId, lesson_id: lessonId, selected_option_ids: [], open_text: text, is_correct: ev.correct, score: ev.score, max_score: ev.max_score, feedback: ev.feedback, attempts: 1, created_at: nowIso() })
    incrementXp(db, user.id, 10)
  }
  return { correct: ev.correct, explanation: null, correctOptionIds: [], score: ev.score, maxScore: ev.max_score, feedback: ev.feedback, strengths: ev.strengths, improvements: ev.improvements, xpEarned: existing ? 0 : 10 }
}

function fnCompleteLesson(db: LocalDB, user: Row, body: any) {
  const lessonId = body?.lessonId
  const lesson = db.lessons.find((l) => l.id === lessonId)
  if (!lesson) return { error: 'Aula não encontrada.' }
  const enrolled = db.enrollments.some((e) => e.user_id === user.id && e.course_id === lesson.course_id && e.status === 'active')
  if (!enrolled) return { error: 'Você não está matriculado neste curso.' }

  const rules = setting(db, 'unlock_rules') ?? { min_score_percent: 60, require_all_questions: true }
  const questions = db.questions.filter((q) => q.lesson_id === lessonId && q.is_active)
  const totalQuestions = questions.length
  const maxScore = questions.reduce((s, q) => s + q.points, 0)
  const answers = db.answers.filter((a) => a.user_id === user.id && a.lesson_id === lessonId)
  const totalScore = answers.reduce((s, a) => s + Number(a.score), 0)
  const percent = maxScore > 0 ? (totalScore / maxScore) * 100 : 100

  if (rules.require_all_questions && answers.length < totalQuestions) return { completed: false, reason: 'questions_pending' }
  if (percent < (rules.min_score_percent ?? 60)) return { completed: false, reason: 'min_score_not_met' }

  const gam = setting(db, 'gamification') ?? {}
  let xpEarned = gam.xp_lesson_completed ?? 100
  const perfect = totalQuestions > 0 && totalScore >= maxScore
  if (perfect) xpEarned += gam.xp_perfect_quiz ?? 50

  let lp = db.lesson_progress.find((p) => p.user_id === user.id && p.lesson_id === lessonId)
  const already = !!lp?.completed
  const patch = { content_viewed: true, questions_answered: answers.length, questions_total: totalQuestions, score: totalScore, max_score: maxScore, percent, completed: true, completed_at: nowIso(), xp_earned: already ? lp!.xp_earned : xpEarned }
  if (lp) Object.assign(lp, patch)
  else db.lesson_progress.push({ id: uid(), user_id: user.id, lesson_id: lessonId, ...patch })
  if (!already) incrementXp(db, user.id, xpEarned)

  const allLessons = db.lessons.filter((l) => l.course_id === lesson.course_id && l.is_published).sort((a, b) => a.position - b.position)
  const progresses = db.lesson_progress.filter((p) => p.user_id === user.id && allLessons.some((l) => l.id === p.lesson_id) && p.completed)
  const done = progresses.length
  const total = allLessons.length
  const avg = done ? progresses.reduce((s, p) => s + (p.max_score > 0 ? (p.score / p.max_score) * 10 : 0), 0) / done : 0
  const courseCompleted = total > 0 && done >= total
  const allAnswers = db.answers.filter((a) => a.user_id === user.id)

  const cp = db.course_progress.find((p) => p.user_id === user.id && p.course_id === lesson.course_id)
  let bonus = 0
  if (cp) {
    if (courseCompleted && !cp.completed) {
      bonus = gam.xp_course_completed ?? 200
      incrementXp(db, user.id, bonus)
    }
    Object.assign(cp, { lessons_completed: done, total_lessons: total, percent: total ? (done / total) * 100 : 0, average_score: avg, questions_answered: allAnswers.length, questions_correct: allAnswers.filter((a) => a.is_correct).length, completed: courseCompleted, completed_at: courseCompleted ? nowIso() : null, last_lesson_id: lessonId })
  }

  const idx = allLessons.findIndex((l) => l.id === lessonId)
  const nextLessonId = idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1].id : null

  const earned = new Set(db.user_achievements.filter((e) => e.user_id === user.id).map((e) => e.achievement_id))
  const newAchievements: { id: string; title: string; icon: string }[] = []
  for (const a of db.achievements.filter((x) => x.is_active)) {
    if (earned.has(a.id)) continue
    const ok = (a.condition_type === 'lessons_completed' && done >= a.condition_value) || (a.condition_type === 'perfect_quizzes' && perfect) || (a.condition_type === 'course_completed' && courseCompleted)
    if (ok) {
      db.user_achievements.push({ id: uid(), user_id: user.id, achievement_id: a.id, earned_at: nowIso() })
      if (a.xp_bonus) incrementXp(db, user.id, a.xp_bonus)
      newAchievements.push({ id: a.id, title: a.title, icon: a.icon })
    }
  }

  if (courseCompleted && !db.certificates.some((c) => c.user_id === user.id && c.course_id === lesson.course_id)) {
    const profile = db.profiles.find((p) => p.id === user.id)
    const course = db.courses.find((c) => c.id === lesson.course_id)
    const cert = setting(db, 'certificate') ?? {}
    db.certificates.push({ id: uid(), user_id: user.id, course_id: lesson.course_id, code: certificateCode(), student_name: profile?.full_name || 'Aluno', course_title: cert.course_name || course?.title || 'Curso', hours_load: cert.hours_load ?? 20, issued_at: nowIso() })
  }

  return { completed: true, score: totalScore, maxScore, xpEarned: xpEarned + bonus, nextLessonId, courseCompleted, newAchievements }
}

function enroll(db: LocalDB, user: Row, course: Row) {
  const total = db.lessons.filter((l) => l.course_id === course.id && l.is_published).length
  db.enrollments.push({ id: uid(), user_id: user.id, course_id: course.id, status: 'active', created_at: nowIso() })
  db.orders.push({ id: uid(), user_id: user.id, course_id: course.id, amount_cents: course.price_cents, status: 'paid', provider: 'local', customer_email: user.email, created_at: nowIso() })
  if (!db.course_progress.some((p) => p.user_id === user.id && p.course_id === course.id)) {
    db.course_progress.push({ id: uid(), user_id: user.id, course_id: course.id, ...DEFAULTS.course_progress(), total_lessons: total, created_at: nowIso() })
  }
}

function fnCreateCheckout(db: LocalDB, user: Row) {
  const course = db.courses.find((c) => c.is_published)
  if (!course) return { error: 'Curso não encontrado.' }
  if (db.enrollments.some((e) => e.user_id === user.id && e.course_id === course.id && e.status === 'active')) return { alreadyEnrolled: true }
  enroll(db, user, course)
  return { checkoutUrl: `${window.location.origin}/sucesso`, demo: true }
}

// ---------- auth ----------
type AuthListener = (event: string, session: any) => void
const listeners = new Set<AuthListener>()

function toSession(u: Row | null) {
  if (!u) return null
  const user = { id: u.id, email: u.email, user_metadata: { full_name: u.full_name }, app_metadata: {}, aud: 'authenticated', created_at: u.created_at }
  return { access_token: 'local', refresh_token: 'local', token_type: 'bearer', expires_in: 999999, user }
}

function notify(event: string) {
  const session = toSession(currentUser(loadDB()))
  listeners.forEach((l) => l(event, session))
}

const auth = {
  async getSession() {
    return { data: { session: toSession(currentUser(loadDB())) }, error: null }
  },
  onAuthStateChange(cb: AuthListener) {
    listeners.add(cb)
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } }
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const db = loadDB()
    const u = db.auth_users.find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase() && x.password === password)
    if (!u) return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } }
    setSessionUserId(u.id)
    notify('SIGNED_IN')
    const session = toSession(u)
    return { data: { user: session!.user, session }, error: null }
  },
  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) {
    const db = loadDB()
    const mail = String(email).trim().toLowerCase()
    if (db.auth_users.some((x) => x.email.toLowerCase() === mail)) return { data: { user: null, session: null }, error: { message: 'User already registered' } }
    const isFirst = db.auth_users.length === 0
    const id = uid()
    const fullName = options?.data?.full_name || mail.split('@')[0]
    const created_at = nowIso()
    db.auth_users.push({ id, email: mail, password, full_name: fullName, created_at })
    db.profiles.push({ id, full_name: fullName, email: mail, avatar_url: null, created_at, updated_at: created_at })
    db.user_roles.push({ id: uid(), user_id: id, role: isFirst ? 'admin' : 'student' })
    saveDB()
    setSessionUserId(id)
    notify('SIGNED_IN')
    const session = toSession(db.auth_users.find((x) => x.id === id)!)
    return { data: { user: session!.user, session }, error: null }
  },
  async signOut() {
    setSessionUserId(null)
    notify('SIGNED_OUT')
    return { error: null }
  },
  async resetPasswordForEmail() {
    return { data: {}, error: null }
  },
  async updateUser({ password }: { password?: string }) {
    const db = loadDB()
    const u = currentUser(db)
    if (!u) return { data: { user: null }, error: { message: 'Não autenticado' } }
    if (password) u.password = password
    saveDB()
    return { data: { user: toSession(u)!.user }, error: null }
  },
}

// ---------- cliente ----------
export function createLocalClient(): any {
  return {
    isLocal: true,
    auth,
    from: (table: string) => new Query(table),
    async rpc(name: string, args: any) {
      const db = loadDB()
      if (name === 'verify_certificate') {
        const code = String(args?._code ?? '').trim().toUpperCase()
        const c = db.certificates.find((x) => x.code === code)
        return { data: c ? [c] : [], error: null }
      }
      if (name === 'increment_user_xp') {
        incrementXp(db, args.p_user_id, args.p_amount)
        saveDB()
        return { data: null, error: null }
      }
      return { data: null, error: { message: `RPC ${name} indisponível no modo local` } }
    },
    functions: {
      async invoke(name: string, opts?: { body?: any }) {
        const db = loadDB()
        const user = currentUser(db)
        if (!user) return { data: null, error: { message: 'Não autenticado.' } }
        let data: any
        if (name === 'submit-answer') data = fnSubmitAnswer(db, user, opts?.body)
        else if (name === 'complete-lesson') data = fnCompleteLesson(db, user, opts?.body)
        else if (name === 'create-checkout') data = fnCreateCheckout(db, user)
        else return { data: null, error: { message: `Função ${name} indisponível no modo local` } }
        saveDB()
        if (data?.error && name !== 'submit-answer') return { data, error: { message: data.error } }
        return { data, error: null }
      },
    },
  }
}
