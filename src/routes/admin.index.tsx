import { createFileRoute } from '@tanstack/react-router'
import { Users, UserCheck, CheckCircle2, Target, ShoppingCart, DollarSign, Award } from 'lucide-react'
import { RequireAdmin } from '@/components/auth-guard'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatsCard } from '@/components/admin/stats-card'
import { useAdminMetrics } from '@/hooks/use-admin'
import { LoadingState } from '@/components/ui/states'
import { formatBRL } from '@/lib/utils'

export const Route = createFileRoute('/admin/')({
  component: () => (
    <RequireAdmin>
      <AdminDashboard />
    </RequireAdmin>
  ),
})

function AdminDashboard() {
  const { data: metrics, isLoading } = useAdminMetrics()

  if (isLoading || !metrics) return <AdminShell><LoadingState /></AdminShell>

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Visão geral da plataforma.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total de alunos" value={metrics.totalStudents} icon={Users} />
        <StatsCard label="Alunos ativos" value={metrics.activeStudents} icon={UserCheck} />
        <StatsCard label="Aulas concluídas" value={metrics.completedLessons} icon={CheckCircle2} />
        <StatsCard label="Nota média" value={metrics.avgScore.toFixed(1)} icon={Target} />
        <StatsCard label="Vendas" value={metrics.salesCount} icon={ShoppingCart} />
        <StatsCard label="Receita" value={formatBRL(metrics.revenueCents)} icon={DollarSign} />
        <StatsCard label="Certificados emitidos" value={metrics.certificatesCount} icon={Award} />
      </div>
    </AdminShell>
  )
}
