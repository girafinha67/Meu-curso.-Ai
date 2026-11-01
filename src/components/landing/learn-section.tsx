import { CheckCircle2 } from 'lucide-react'
import { useSiteSetting } from '@/hooks/use-site-settings'

const fallback = [
  'Criar sites profissionais com IA',
  'Entender os fundamentos da web',
  'Publicar sites na internet',
  'Criar prompts melhores',
  'Encontrar potenciais clientes',
  'Abordar empresas',
  'Fechar projetos',
  'Entregar sites profissionalmente',
]

export function LearnSection() {
  const { data: landing } = useSiteSetting('landing')
  const items = landing?.learn_items ?? fallback

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">O que você vai aprender</h2>
          <p className="mt-4 text-muted-foreground">
            Uma jornada completa: da teoria da web até fechar e entregar projetos reais.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="card-interactive flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
              <p className="font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
