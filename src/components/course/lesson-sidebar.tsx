import { useState } from 'react'
import { ChevronDown, ChevronUp, List } from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  { id: 'introducao', label: 'Introdução' },
  { id: 'conteudo', label: 'Conteúdo' },
  { id: 'exercicios', label: 'Exercícios' },
  { id: 'conclusao', label: 'Conclusão' },
]

export function LessonSidebar({ activeSection }: { activeSection: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile: menu expansível */}
      <div className="mb-4 rounded-xl border border-border bg-card md:hidden">
        <button
          className="focus-ring flex w-full items-center justify-between p-4 text-sm font-medium"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <List className="h-4 w-4" /> Índice da aula
          </span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {open && (
          <div className="flex flex-col border-t border-border p-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm',
                  activeSection === s.id ? 'bg-primary-50 font-medium text-primary-700' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: sidebar fixa */}
      <aside className="sticky top-24 hidden h-fit w-56 shrink-0 md:block">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nesta aula</p>
        <nav className="flex flex-col gap-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                'rounded-lg px-3 py-2 text-sm transition-colors',
                activeSection === s.id ? 'bg-primary-50 font-medium text-primary-700' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  )
}
