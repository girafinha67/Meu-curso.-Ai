import { Sparkles, Trophy, Award, Gauge } from 'lucide-react'

const benefits = [
  {
    icon: Sparkles,
    title: 'Feedback por IA',
    description: 'Nas questões abertas, a IA avalia sua resposta e explica o que melhorar — não é só certo ou errado.',
  },
  {
    icon: Gauge,
    title: 'Progresso que você acompanha',
    description: 'Veja exatamente quanto falta, aula por aula, com dados reais do seu andamento no curso.',
  },
  {
    icon: Trophy,
    title: 'Conquistas e XP',
    description: 'Ganhe XP e desbloqueie conquistas conforme avança — o curso te empurra a continuar.',
  },
  {
    icon: Award,
    title: 'Certificado de conclusão',
    description: 'Ao terminar 100% do curso, você recebe um certificado com código de verificação único.',
  },
]

export function BenefitsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Por que estudar aqui</h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                <benefit.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display font-semibold">{benefit.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
