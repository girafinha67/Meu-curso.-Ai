import { Play, Flame, Trophy, Sparkles } from 'lucide-react'
import { ProgressBar } from '@/components/ui/progress-bar'

/**
 * Mockup ilustrativo do dashboard do aluno, usado só na landing page para
 * mostrar visualmente progresso, aulas, XP e certificado. Os números aqui
 * são fixos de propósito (é uma prévia do produto, não uma tela real) —
 * o dashboard autenticado usa dados reais do próprio aluno.
 */
export function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm animate-scale-in">
      {/* chip flutuante — único acento decorativo, sem exagero */}
      <div className="absolute -right-4 -top-4 z-10 flex items-center gap-1.5 rounded-2xl bg-card px-3 py-2 shadow-elevated animate-toast-in [animation-delay:600ms] [animation-fill-mode:backwards]">
        <Sparkles className="h-4 w-4 text-accent-500" />
        <span className="text-xs font-semibold">+50 XP</span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              A
            </span>
            <div>
              <p className="text-sm font-semibold leading-none">Olá, Ana 👋</p>
              <p className="mt-1 text-xs text-muted-foreground">Nível 4 · 1.240 XP</p>
            </div>
          </div>
          <span className="rounded-full bg-accent-50 px-2.5 py-1 text-[11px] font-semibold text-accent-700">
            <Flame className="mr-1 inline h-3 w-3" />4 dias
          </span>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-muted-foreground">Continue de onde parou</p>
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Aula 04 · Criando seu site</p>
              <div className="mt-1.5">
                <ProgressBar value={72} size="sm" />
              </div>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">72%</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/60 py-2.5">
              <p className="text-sm font-bold">3/7</p>
              <p className="text-[11px] text-muted-foreground">aulas</p>
            </div>
            <div className="rounded-xl bg-muted/60 py-2.5">
              <p className="text-sm font-bold">1.240</p>
              <p className="text-[11px] text-muted-foreground">XP</p>
            </div>
            <div className="rounded-xl bg-muted/60 py-2.5">
              <p className="text-sm font-bold">9.2</p>
              <p className="text-[11px] text-muted-foreground">nota média</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-5 py-3">
          <Trophy className="h-4 w-4 text-accent-500" />
          <p className="text-xs text-muted-foreground">Certificado liberado ao concluir 100% do curso</p>
        </div>
      </div>
    </div>
  )
}
