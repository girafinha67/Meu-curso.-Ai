import { Users } from 'lucide-react'
import { useSiteSetting } from '@/hooks/use-site-settings'

const fallbackItems = [
  'Iniciantes',
  'Pessoas que querem começar a trabalhar com criação de sites',
  'Freelancers',
  'Pessoas interessadas em IA',
  'Pessoas que querem criar uma nova fonte de renda',
  'Pessoas que querem vender sites para empresas locais',
]

export function AudienceSection() {
  const { data: landing } = useSiteSetting('landing')
  const items = landing?.audience_items ?? fallbackItems

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700">
              <Users className="h-3.5 w-3.5" />
              Para quem é o curso
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Feito para quem está começando
            </h2>
            <p className="mt-4 text-muted-foreground">
              {landing?.audience_note ??
                'Não é necessário ser programador experiente. O curso começa do zero e usa IA como ferramenta principal.'}
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-background p-4 shadow-soft">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
