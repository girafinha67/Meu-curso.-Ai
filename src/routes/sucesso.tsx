import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/sucesso')({
  component: SuccessPage,
})

function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex flex-1 items-center justify-center py-16">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">Pagamento confirmado!</h1>
          <p className="mt-2 text-muted-foreground">
            Seu acesso é liberado automaticamente assim que a confirmação chega do provedor de pagamento — geralmente em
            poucos segundos.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="mt-6">
              Ir para o meu dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
