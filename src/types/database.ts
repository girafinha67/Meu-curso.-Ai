export type AppRole = 'admin' | 'student'
export type QuestionType = 'multiple_choice' | 'true_false' | 'multi_select' | 'open'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'

export interface Profile {
  id: string
  full_name: string
  email: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  hours_load: number
  price_cents: number
  compare_price_cents: number | null
  cover_url: string | null
  is_published: boolean
}

export interface Lesson {
  id: string
  course_id: string
  position: number
  title: string
  slug: string | null
  description: string | null
  duration_minutes: number
  cover_url: string | null
  objectives: string[]
  key_concepts: string[]
  conclusion: string | null
  min_score_percent: number | null
  is_published: boolean
}

export interface LessonBlock {
  id: string
  lesson_id: string
  position: number
  type: string
  content: Record<string, unknown>
}

export interface QuestionOption {
  id: string
  question_id: string
  position: number
  text: string
  is_correct?: boolean // nunca exposto ao aluno antes de responder (ver Edge Function)
  feedback?: string | null
}

export interface Question {
  id: string
  lesson_id: string
  position: number
  type: QuestionType
  prompt: string
  context: string | null
  explanation: string | null
  points: number
  options?: QuestionOption[]
}

export interface Answer {
  id: string
  user_id: string
  question_id: string
  lesson_id: string
  selected_option_ids: string[]
  open_text: string | null
  is_correct: boolean
  score: number
  max_score: number
  feedback: string | null
  attempts: number
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  content_viewed: boolean
  content_viewed_at: string | null
  questions_answered: number
  questions_total: number
  score: number
  max_score: number
  percent: number
  completed: boolean
  completed_at: string | null
  xp_earned: number
}

export interface CourseProgress {
  id: string
  user_id: string
  course_id: string
  lessons_completed: number
  total_lessons: number
  percent: number
  average_score: number
  questions_answered: number
  questions_correct: number
  xp: number
  level: number
  completed: boolean
  completed_at: string | null
  last_lesson_id: string | null
}

export interface Achievement {
  id: string
  key: string
  title: string
  description: string | null
  icon: string
  xp_bonus: number
  condition_type: string
  condition_value: number
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  code: string
  student_name: string
  course_title: string
  hours_load: number
  issued_at: string
}

export interface SiteSettingsMap {
  general: {
    platform_name: string
    tagline: string
    logo_url: string
    favicon_url: string
    seo_title: string
    seo_description: string
    support_email: string
    instagram_url: string
    youtube_url: string
    whatsapp_url: string
    primary_color: string
  }
  landing: {
    hero_title: string
    hero_subtitle: string
    cta_primary: string
    cta_secondary: string
    learn_items: string[]
    audience_items: string[]
    audience_note: string
    faq: { q: string; a: string }[]
    instructor_name: string
    instructor_title: string
    instructor_bio: string
    instructor_photo_url: string
    guarantee_text: string
    /** Opcional — some vazio até o admin cadastrar depoimentos reais (a seção some se estiver vazia). */
    testimonials?: { name: string; role: string; text: string; avatar_url?: string; rating?: number }[]
  }
  dex: {
    enabled: boolean
    name: string
    title: string
    description: string
    promo_text: string
    cta_text: string
    url: string
    logo_url: string
    image_url: string
  }
  gamification: {
    xp_lesson_completed: number
    xp_perfect_quiz: number
    xp_question_answered: number
    xp_course_completed: number
    levels: { name: string; min_xp: number }[]
  }
  unlock_rules: {
    min_score_percent: number
    require_content_viewed: boolean
    require_all_questions: boolean
    allow_retry_open_questions: boolean
    max_attempts_per_question: number
  }
  ai_tools: {
    categories: { name: string; tools: { name: string; note: string; url: string }[] }[]
    note: string
  }
  certificate: {
    course_name: string
    hours_load: number
    instructor_name: string
    instructor_title: string
    signature_text: string
    issuer_name: string
  }
  payment: {
    provider: string
    enabled: boolean
    pix_enabled: boolean
    card_enabled: boolean
    max_installments: number
  }
}

// Tipo mínimo compatível com supabase-js para inferência de tabelas.
// (Simplificado — não gerado automaticamente. Rode `supabase gen types`
// quando quiser tipagem 100% estrita a partir do schema real.)
export type Database = Record<string, unknown>
