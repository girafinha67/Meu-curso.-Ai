import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Award, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { LoadingState } from '@/components/ui/states'

export const Route = createFileRoute('/certificado/$code')({
  component: CertificatePage,
})

function CertificatePage() {
  const { code } = Route.useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['certificate', code],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('verify_certificate', { _code: code })
      if (error) throw error
      return data?.[0] ?? null
    },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1 py-16">
        <div className="mx-auto max-w-lg">
          {isLoading ? (
            <LoadingState label="Verificando certificado..." />
          ) : data ? (
            <div className="rounded-3xl border-2 border-primary-200 bg-gradient-to-b from-primary-50 to-background p-8 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white">
                <Award className="h-8 w-8" />
              </span>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" /> Certificado válido
              </p>
              <h1 className="mt-3 text-2xl font-bold">{data.student_name}</h1>
              <p className="mt-1 text-muted-foreground">concluiu o curso</p>
              <p className="text-lg font-semibold text-primary-700">{data.course_title}</p>
              <div className="mt-6 flex justify-center gap-8 border-t border-border pt-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Carga horária</p>
                  <p className="font-semibold">{data.hours_load}h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emitido em</p>
                  <p className="font-semibold">{new Date(data.issued_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Código</p>
                  <p className="font-mono font-semibold">{data.code}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-red-200 bg-red-50/50 p-8 text-center">
              <XCircle className="mx-auto h-12 w-12 text-danger" />
              <p className="mt-4 font-semibold">Certificado não encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">Verifique se o código foi digitado corretamente.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
