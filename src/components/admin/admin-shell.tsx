import { type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Users,
  ShoppingCart,
  Settings,
  Award,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/aulas', label: 'Aulas', icon: BookOpen },
  { to: '/admin/questoes', label: 'Questões', icon: HelpCircle },
  { to: '/admin/alunos', label: 'Alunos', icon: Users },
  { to: '/admin/vendas', label: 'Vendas', icon: ShoppingCart },
  { to: '/admin/certificados', label: 'Certificados', icon: Award },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
] as const

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          Admin
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.exact }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:bg-primary-50 [&.active]:text-primary-700"
              activeProps={{ className: 'active' }}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Link to="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="border-b border-border bg-background p-4 md:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn('shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted [&.active]:bg-primary-50 [&.active]:text-primary-700')}
                activeProps={{ className: 'active' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
