import { type ReactNode, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Sparkles, LayoutDashboard, Map as MapIcon, Trophy, User, Award, Settings, LogOut, Menu, X, ShieldCheck, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useSiteSetting } from '@/hooks/use-site-settings'
import { useCourse } from '@/hooks/use-course'
import { useUserAchievements, useCertificate, useAchievements } from '@/hooks/use-progress'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, isAdmin, signOut, user } = useAuth()
  const { data: general } = useSiteSetting('general')
  const { data: course } = useCourse()
  const { data: achievements } = useAchievements()
  const { data: userAchievements } = useUserAchievements(user?.id)
  const { data: certificate } = useCertificate(user?.id, course?.id)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trilha', label: 'Mapa do curso', icon: MapIcon },
    { to: '/perfil', label: 'Conquistas', icon: Trophy, hash: 'conquistas' },
    ...(isAdmin ? [{ to: '/admin', label: 'Painel admin', icon: ShieldCheck }] : []),
  ] as const

  const achievementTitleById = new Map((achievements ?? []).map((a) => [a.id, a.title]))
  const notifications = [
    ...(userAchievements ?? [])
      .slice()
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, 3)
      .map((a) => ({
        key: `ach-${a.achievement_id}`,
        icon: Trophy,
        text: `Conquista desbloqueada: ${achievementTitleById.get(a.achievement_id) ?? 'nova conquista'}`,
        date: a.earned_at,
      })),
    ...(certificate ? [{ key: 'cert', icon: Award, text: 'Seu certificado de conclusão foi emitido 🎉', date: certificate.issued_at }] : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  async function handleSignOut() {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">{general?.platform_name ?? 'SitesIA'}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                hash={'hash' in link ? link.hash : undefined}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:bg-primary-50 [&.active]:text-primary-700"
                activeProps={{ className: 'active' }}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <button
                className="focus-ring relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-500" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-elevated">
                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Notificações</p>
                  {notifications.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.key} className="flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted">
                        <n.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                        <span>{n.text}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="relative hidden md:block">
              <button
                className="focus-ring flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                  {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
                </span>
                <span className="max-w-[120px] truncate text-sm font-medium">{profile?.full_name?.split(' ')[0] ?? 'Conta'}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-elevated">
                  <Link to="/perfil" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setMenuOpen(false)}>
                    <User className="h-4 w-4" /> Meu perfil
                  </Link>
                  <Link to="/perfil" hash="certificados" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setMenuOpen(false)}>
                    <Award className="h-4 w-4" /> Certificados
                  </Link>
                  <Link to="/perfil" hash="configuracoes" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setMenuOpen(false)}>
                    <Settings className="h-4 w-4" /> Configurações
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <button className="focus-ring rounded-lg p-2" onClick={() => setOpen((v) => !v)}>
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="border-t border-border md:hidden">
            <div className="container flex flex-col gap-1 py-3">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  hash={'hash' in link ? link.hash : undefined}
                  className={cn('flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted')}
                  onClick={() => setOpen(false)}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <Link to="/perfil" className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setOpen(false)}>
                <User className="h-4 w-4" /> Meu perfil
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-danger hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="container py-8">{children}</main>
    </div>
  )
}
