import { Link } from '@tanstack/react-router'
import { ArrowRight, Sparkles, Code2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSiteSetting } from '@/hooks/use-site-settings'
import { DashboardMockup } from '@/components/landing/dashboard-mockup'

export function HeroSection() {
  const { data: landing } = useSiteSetting('landing')

  return (
    <section className="gradient-hero relative overflow-hidden pb-16 pt-14 md:pb-24 md:pt-20">
      <div className="container relative">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-10">
          <div className="animate-fade-up text-center md:text-left">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700">
              <Sparkles className="h-3.5 w-3.5" />
              Curso 100% prático com Inteligência Artificial
            </span>

            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.4rem]">
              {landing?.hero_title ?? 'Aprenda a criar e vender sites profissionais usando Inteligência Artificial.'}
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground md:mx-0">
              {landing?.hero_subtitle ??
                'Do zero até o primeiro cliente pagante: use IA para criar sites profissionais e transforme isso em uma habilidade que você vende de verdade.'}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link to="/checkout">
                <Button size="lg" className="w-full sm:w-auto">
                  {landing?.cta_primary ?? 'Quero aprender agora'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#curriculo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {landing?.cta_secondary ?? 'Ver o currículo'}
                </Button>
              </a>
            </div>

            <div className="mx-auto mt-10 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border pt-6 text-xs text-muted-foreground md:mx-0 md:justify-start">
              <span className="flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-primary-600" /> Sites com IA
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary-600" /> Prospecção real
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary-600" /> 7 aulas práticas
              </span>
            </div>
          </div>

          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
