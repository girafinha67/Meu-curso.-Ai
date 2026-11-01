import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, AlertCircle, Award, Share2, Clock, GraduationCap } from 'lucide-react'
import { RequireAuth } from '@/components/auth-guard'
import { AppShell } from '@/components/app-shell'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCourse, useLessons } from '@/hooks/use-course'
import { useCourseProgress, useLessonProgressList, useAchievements, useUserAchievements, useCertificate } from '@/hooks/use-progress'
import { LevelCard } from '@/components/course/level-card'
import { useSiteSetting } from '@/hooks/use-site-settings'
import * as Icons from 'lucide-react'
import { iconNameToPascalCase } from '@/lib/icon-name'

export const Route = createFileRoute('/perfil')({
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
})

function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth()
  const { data: course } = useCourse()
  const { data: courseProgress } = useCourseProgress(course?.id)
  const { data: lessons } = useLessons(course?.id)
  const { data: lessonProgressList } = useLessonProgressList(user?.id)
  const { data: gamification } = useSiteSetting('gamification')
  const { data: achievements } = useAchievements()
  const { data: userAchievements } = useUserAchievements(user?.id)
  const { data: certificate } = useCertificate(user?.id, course?.id)

  const earnedMap = new Map((userAchievements ?? []).map((a) => [a.achievement_id, a.earned_at]))
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null

  const completedLessons = (lessons ?? [])
    .filter((l) => lessonProgressList?.some((p) => p.lesson_id === l.id && p.completed))
    .map((l) => ({
      lesson: l,
      completedAt: lessonProgressList?.find((p) => p.lesson_id === l.id)?.completed_at ?? null,
    }))
    .filter((e) => e.completedAt)
    .sort((a, b) => new Date(b.completedAt as string).getTime() - new Date(a.completedAt as string).getTime())

  async function handleShareCertificate() {
    if (!certificate) return
    const url = `${window.location.origin}/certificado/${certificate.code}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meu certificado — SitesIA', url })
      } catch {
        /* usuário cancelou o compartilhamento — sem erro */
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id)
    setSavingProfile(false)
    if (!error) {
      setProfileMsg('Nome atualizado com sucesso.')
      refreshProfile()
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'A senha precisa ter pelo menos 8 caracteres.' })
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      setPasswordMsg({ type: 'error', text: 'Não foi possível alterar a senha. Tente novamente.' })
    } else {
      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso.' })
      setNewPassword('')
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Meu perfil</h1>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            {profile && profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700">
                {(profile?.full_name || 'A')[0].toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold">{profile?.full_name || 'Aluno'}</p>
              <p className="truncate text-sm text-muted-foreground">{profile?.email ?? user?.email}</p>
              {memberSince && <p className="mt-0.5 text-xs text-muted-foreground">Aluno desde {memberSince}</p>}
            </div>
          </CardContent>
        </Card>

        {gamification && <LevelCard xp={courseProgress?.xp ?? 0} levels={gamification.levels} />}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-lg font-bold">
                {courseProgress?.lessons_completed ?? 0}/{lessons?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">aulas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-lg font-bold">{(courseProgress?.average_score ?? 0).toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">nota média</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-lg font-bold">{(userAchievements ?? []).length}</p>
              <p className="text-xs text-muted-foreground">conquistas</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 font-display text-base font-semibold" id="certificados">
            Meus certificados
          </h2>
          {certificate ? (
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                    <Award className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{certificate.course_title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Emitido em {new Date(certificate.issued_at).toLocaleDateString('pt-BR')} · {certificate.code}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="ghost" onClick={handleShareCertificate} aria-label="Compartilhar certificado">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Link to="/certificado/$code" params={{ code: certificate.code }}>
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center gap-3 pt-6 text-sm text-muted-foreground">
                <GraduationCap className="h-5 w-5 shrink-0" />
                Conclua 100% do curso para liberar seu certificado.
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-display text-base font-semibold" id="conquistas">
            Minhas conquistas
          </h2>
          {achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {achievements.map((a) => {
                const earnedAt = earnedMap.get(a.id)
                const IconComp = (Icons as any)[iconNameToPascalCase(a.icon)] ?? Award
                return (
                  <Card key={a.id} className={earnedAt ? '' : 'opacity-60 grayscale'}>
                    <CardContent className="flex flex-col items-center gap-1.5 pt-6 text-center">
                      <span className={earnedAt ? 'flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 text-accent-600' : 'flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground'}>
                        <IconComp className="h-5 w-5" />
                      </span>
                      <p className="text-xs font-medium leading-tight">{a.title}</p>
                      {earnedAt && <p className="text-[10px] text-muted-foreground">{new Date(earnedAt).toLocaleDateString('pt-BR')}</p>}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma conquista disponível ainda.</p>
          )}
        </div>

        {completedLessons.length > 0 && (
          <div>
            <h2 className="mb-3 font-display text-base font-semibold">Histórico</h2>
            <Card>
              <CardContent className="flex flex-col divide-y divide-border pt-2">
                {completedLessons.slice(0, 5).map(({ lesson, completedAt }) => (
                  <div key={lesson.id} className="flex items-center gap-3 py-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" />
                    <p className="min-w-0 flex-1 truncate text-sm">{lesson.title}</p>
                    <p className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(completedAt as string).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        <h2 className="-mb-2 font-display text-base font-semibold" id="configuracoes">
          Configurações da conta
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
            <CardDescription>Seu e-mail não pode ser alterado por aqui.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nome completo</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">E-mail</label>
                <Input value={profile?.email ?? user?.email ?? ''} disabled />
              </div>
              {profileMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> {profileMsg}
                </div>
              )}
              <Button type="submit" loading={savingProfile} className="self-start">
                Salvar alterações
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar senha</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nova senha</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              {passwordMsg && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
                    passwordMsg.type === 'success' ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
                  }`}
                >
                  {passwordMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {passwordMsg.text}
                </div>
              )}
              <Button type="submit" loading={savingPassword} variant="outline" className="self-start">
                Alterar senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
