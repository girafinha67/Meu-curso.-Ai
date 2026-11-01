import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSiteSetting } from '@/hooks/use-site-settings'
import { cn } from '@/lib/utils'

export function FaqSection() {
  const { data: landing } = useSiteSetting('landing')
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const faq = landing?.faq ?? []

  if (!faq.length) return null

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Perguntas frequentes</h2>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3">
          {faq.map((item, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-background">
              <button
                className="focus-ring flex w-full items-center justify-between gap-4 p-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-medium">{item.q}</span>
                <ChevronDown
                  className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', openIndex === i && 'rotate-180')}
                />
              </button>
              {openIndex === i && <p className="px-5 pb-5 text-sm text-muted-foreground">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
