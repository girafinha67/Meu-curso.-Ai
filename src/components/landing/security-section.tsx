import { ShieldCheck, Lock, Zap, LifeBuoy } from 'lucide-react'
import { useSiteSetting } from '@/hooks/use-site-settings'

export function SecuritySection() {
  const { data: landing } = useSiteSetting('landing')
  const { data: general } = useSiteSetting('general')

  const points = [
    { icon: Lock, title: 'Pagamento seguro', description: 'Processado pelo Mercado Pago (Pix ou cartão).' },
    { icon: Zap, title: 'Acesso imediato', description: 'Liberado assim que o pagamento é confirmado.' },
    {
      icon: LifeBuoy,
      title: 'Suporte',
      description: general?.support_email ? `Dúvidas por ${general.support_email}.` : 'Suporte disponível por e-mail.',
    },
  ]

  return (
    <section className="py-16">
      <div className="container">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 rounded-3xl border border-border bg-card p-8 shadow-soft md:flex-row md:justify-between md:p-10">
          <div className="flex items-center gap-3 text-center md:text-left">
            <ShieldCheck className="h-8 w-8 shrink-0 text-primary-600" />
            <div>
              <p className="font-display font-semibold">Compra 100% segura</p>
              {landing?.guarantee_text && <p className="mt-1 text-sm text-muted-foreground">{landing.guarantee_text}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-8">
            {points.map((point) => (
              <div key={point.title} className="flex flex-col items-center gap-1.5 text-center md:items-start md:text-left">
                <point.icon className="h-4 w-4 text-primary-600" />
                <p className="text-xs font-semibold">{point.title}</p>
                <p className="text-xs text-muted-foreground">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
