import { createFileRoute } from '@tanstack/react-router'
import { RequireAdmin } from '@/components/auth-guard'
import { AdminShell } from '@/components/admin/admin-shell'
import { useAdminCertificates } from '@/hooks/use-admin'
import { LoadingState, EmptyState } from '@/components/ui/states'

export const Route = createFileRoute('/admin/certificados')({
  component: () => (
    <RequireAdmin>
      <AdminCertificatesPage />
    </RequireAdmin>
  ),
})

function AdminCertificatesPage() {
  const { data: certificates, isLoading } = useAdminCertificates()

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Certificados</h1>
      <p className="mt-1 text-muted-foreground">Certificados emitidos automaticamente ao concluir o curso.</p>

      {isLoading ? (
        <div className="mt-8">
          <LoadingState />
        </div>
      ) : !certificates?.length ? (
        <div className="mt-8">
          <EmptyState title="Nenhum certificado emitido ainda" />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Aluno</th>
                <th className="p-4">Código</th>
                <th className="p-4">Emitido em</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((c: any) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-4 font-medium">{c.student_name}</td>
                  <td className="p-4 font-mono">{c.code}</td>
                  <td className="p-4 text-muted-foreground">{new Date(c.issued_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}
