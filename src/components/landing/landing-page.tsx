import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { CapabilitiesSection } from '@/components/landing/capabilities-section'
import { JourneySection } from '@/components/landing/journey-section'
import { LearnSection } from '@/components/landing/learn-section'
import { AudienceSection } from '@/components/landing/audience-section'
import { CurriculumSection } from '@/components/landing/curriculum-section'
import { BenefitsSection } from '@/components/landing/benefits-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FaqSection } from '@/components/landing/faq-section'
import { SecuritySection } from '@/components/landing/security-section'
import { PricingCtaSection } from '@/components/landing/pricing-cta-section'

/**
 * Composição completa da landing page. Usada tanto pela rota "/" quanto
 * pela rota "/curso" (as duas já apontavam para o mesmo conteúdo antes
 * desta mudança — só deixamos de duplicar a montagem das seções).
 */
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CapabilitiesSection />
        <JourneySection />
        <LearnSection />
        <AudienceSection />
        <CurriculumSection />
        <BenefitsSection />
        <TestimonialsSection />
        <FaqSection />
        <SecuritySection />
        <PricingCtaSection />
      </main>
      <Footer />
    </div>
  )
}
