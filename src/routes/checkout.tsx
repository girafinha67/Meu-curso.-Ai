import { useState } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ShieldCheck, AlertCircle, CreditCard, QrCode, CheckCircle2, Zap } from 'lucide-react'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useCourse, useLessons } from '@/hooks/use-course'
import { useIsEnrolled } from '@/hooks/use-progress'
import { supabase } from '@/lib/supabase'
import { formatBRL } from '@/lib/utils'

const BASE_INCLUDED_ITEMS = ['Exercícios com feedback de IA', 'Certificado de conclusão', 'Acesso imediato após a confirmação']

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  const { user, loading } = useAuth()
  const { data: course } = useCourse()
  const { data: lessons } = useLessons(course?.id)
  const { data: isEnrolled } = useIsEnrolled(course?.id)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && !user) {
    return <Navigate to="/login" />
  }

  if (isEnrolled) {
    return <Navigate to="/dashboard" />
  }

  async function handleCheckout() {
    setSubmitting(true)
    setError(null)
    const { data, error } = await supabase.functions.invoke('create-checkout', { body: {} })
    setSubmitting(false)

    if (error || data?.error) {
      setError(data?.error ?? 'Não foi possível iniciar o pagamento. Tente novamente.')
      return
    }
    if (data?.checkoutUrl) {
      window.location.href = data.checkoutUrl
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="gradient-hero container flex-1 py-16">
        <div className="mx-auto max-w-lg">
          <h1 className="text-center font-display text-2xl font-bold tracking-tight">Finalizar compra</h1>
          <p className="mt-1.5 text-center text-sm text-muted-foreground">Você está a um passo de começar.</p>

          <Card className="mt-8 shadow-elevated">
            <CardContent className="pt-6">
              {course && (
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <div className="min-w-0">
                    <p className="truncate font-display font-semibold">{course.title}</p>
                    <p className="text-sm text-muted-foreground">Acesso completo às {lessons?.length ?? 7} aulas</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {course.compare_price_cents && (
                      <p className="text-xs text-muted-foreground line-through">{formatBRL(course.compare_price_cents)}</p>
                    )}
                    <p className="text-xl font-bold">{formatBRL(course.price_cents)}</p>
                  </div>
                </div>
              )}

              <ul className="mt-4 flex flex-col gap-2">
                {BASE_INCLUDED_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <QrCode className="h-4 w-4" /> Pix
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" /> Cartão
                </span>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-danger">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button size="lg" className="mt-6 w-full" onClick={handleCheckout} loading={submitting}>
                <Zap className="h-4 w-4" />
                Garantir meu acesso
              </Button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Pagamento processado com segurança pelo Mercado Pago
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
