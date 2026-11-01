import { Code2, Search, Handshake, Rocket } from 'lucide-react'

const items = [
  {
    icon: Code2,
    title: 'Criar sites com IA',
    description: 'Monte sites profissionais do zero usando ferramentas de IA, sem precisar programar.',
  },
  {
    icon: Search,
    title: 'Encontrar clientes',
    description: 'Saiba onde e como prospectar empresas locais que precisam de um site.',
  },
  {
    icon: Handshake,
    title: 'Vender projetos',
    description: 'Estruture uma proposta e feche o projeto com confiança, mesmo sem experiência prévia.',
  },
  {
    icon: Rocket,
    title: 'Escalar seus serviços',
    description: 'Transforme o primeiro cliente em uma fonte de renda recorrente com IA como aliada.',
  },
]

export function CapabilitiesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            O que você vai conseguir fazer
          </h2>
          <p className="mt-4 text-muted-foreground">
            Da primeira linha de código feita por IA até o dinheiro caindo na conta.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
