import { GraduationCap, Code2, Search, FileText, Handshake, PackageCheck } from 'lucide-react'

const steps = [
  { icon: GraduationCap, title: 'Aprenda', description: 'Fundamentos da web e como usar IA para criar sites.' },
  { icon: Code2, title: 'Crie', description: 'Monte seu primeiro site profissional na prática.' },
  { icon: Search, title: 'Encontre empresas', description: 'Identifique negócios locais que precisam de um site.' },
  { icon: FileText, title: 'Faça sua proposta', description: 'Estruture uma oferta clara e justifique o preço.' },
  { icon: Handshake, title: 'Feche o cliente', description: 'Conduza a conversa até o "sim" com confiança.' },
  { icon: PackageCheck, title: 'Entregue o site', description: 'Publique, ajuste e entregue um projeto profissional.' },
]

export function JourneySection() {
  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Do zero ao primeiro cliente
          </h2>
          <p className="mt-4 text-muted-foreground">Uma trilha direta, sem enrolação: você segue esses 6 passos.</p>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          {/* linha condutora — só no desktop, onde os passos ficam lado a lado */}
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block" aria-hidden="true" />

          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <li key={step.title} className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary-600 bg-card font-display text-sm font-bold text-primary-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    <step.icon className="h-4 w-4 text-primary-600" />
                    <h3 className="font-display font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
