import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCourse } from '@/hooks/use-course'
import { useSiteSetting } from '@/hooks/use-site-settings'
import { formatBRL } from '@/lib/utils'

export function PricingCtaSection() {
  const { data: course } = useCourse()
  const { data: landing } = useSiteSetting('landing')

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl rounded-3xl border border-primary-100 bg-gradient-to-b from-primary-50 to-background p-8 text-center shadow-elevated md:p-12">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Comece a criar e vender sites com IA
          </h2>
          <p className="mt-4 text-muted-foreground">
            Aprenda uma habilidade que pode virar um serviço de verdade, no seu ritmo.
          </p>

          {course && (
            <div className="mt-8 flex flex-wrap items-end justify-center gap-3">
              {course.compare_price_cents && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatBRL(course.compare_price_cents)}
                </span>
              )}
              <span className="font-display text-4xl font-bold">{formatBRL(course.price_cents)}</span>
              <span className="pb-1 text-sm text-muted-foreground">à vista ou parcelado</span>
            </div>
          )}

          <Link to="/checkout">
            <Button size="lg" className="mt-8 w-full sm:w-auto">
              {landing?.cta_primary ?? 'Quero aprender agora'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
