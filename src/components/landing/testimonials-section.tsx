import { Star, Quote } from 'lucide-react'
import { useSiteSetting } from '@/hooks/use-site-settings'

/**
 * Seção de depoimentos. Só aparece quando existirem depoimentos reais
 * cadastrados em site_settings → landing.testimonials — nunca mostra
 * avaliações de exemplo/fictícias.
 */
export function TestimonialsSection() {
  const { data: landing } = useSiteSetting('landing')
  const testimonials = landing?.testimonials ?? []

  if (!testimonials.length) return null

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Quem já estudou aqui</h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure key={i} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
              <Quote className="h-5 w-5 text-primary-300" />
              <blockquote className="mt-3 flex-1 text-sm text-foreground">{t.text}</blockquote>
              {t.rating && (
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star
                      key={star}
                      className={star < t.rating! ? 'h-4 w-4 fill-accent-500 text-accent-500' : 'h-4 w-4 text-border'}
                    />
                  ))}
                </div>
              )}
              <figcaption className="mt-4 flex items-center gap-3">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                    {t.name[0]?.toUpperCase()}
                  </span>
                )}
                <div>
                  <p className="text-sm font-medium leading-none">{t.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
