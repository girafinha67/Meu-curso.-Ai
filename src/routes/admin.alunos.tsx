import { createFileRoute } from '@tanstack/react-router'
import { RequireAdmin } from '@/components/auth-guard'
import { AdminShell } from '@/components/admin/admin-shell'
import { useAdminStudents } from '@/hooks/use-admin'
import { LoadingState, EmptyState } from '@/components/ui/states'
import { ProgressBar } from '@/components/ui/progress-bar'

export const Route = createFileRoute('/admin/alunos')({
  component: () => (
    <RequireAdmin>
      <AdminStudentsPage />
    </RequireAdmin>
  ),
})

function AdminStudentsPage() {
  const { data: students, isLoading } = useAdminStudents()

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Alunos</h1>
      <p className="mt-1 text-muted-foreground">Progresso e desempenho de cada aluno.</p>

      {isLoading ? (
        <div className="mt-8">
          <LoadingState />
        </div>
      ) : !students?.length ? (
        <div className="mt-8">
          <EmptyState title="Nenhum aluno ainda" description="Assim que alguém se cadastrar, aparecerá aqui." />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Progresso</th>
                <th className="p-4">XP</th>
                <th className="p-4">Nível</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => {
                const progress = s.course_progress?.[0]
                return (
                  <tr key={s.id} className="border-t border-border">
                    <td className="p-4 font-medium">{s.full_name || '—'}</td>
                    <td className="p-4 text-muted-foreground">{s.email}</td>
                    <td className="p-4">
                      <div className="w-32">
                        <ProgressBar value={progress?.percent ?? 0} size="sm" />
                      </div>
                    </td>
                    <td className="p-4">{progress?.xp ?? 0}</td>
                    <td className="p-4">{progress?.level ?? 1}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}
