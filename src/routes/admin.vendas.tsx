import { createFileRoute } from '@tanstack/react-router'
import { RequireAdmin } from '@/components/auth-guard'
import { AdminShell } from '@/components/admin/admin-shell'
import { useAdminOrders } from '@/hooks/use-admin'
import { LoadingState, EmptyState } from '@/components/ui/states'
import { formatBRL, cn } from '@/lib/utils'

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-amber-50 text-amber-700' },
  paid: { label: 'Pago', className: 'bg-green-50 text-success' },
  failed: { label: 'Falhou', className: 'bg-red-50 text-danger' },
  refunded: { label: 'Reembolsado', className: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Cancelado', className: 'bg-slate-100 text-slate-600' },
}

export const Route = createFileRoute('/admin/vendas')({
  component: () => (
    <RequireAdmin>
      <AdminOrdersPage />
    </RequireAdmin>
  ),
})

function AdminOrdersPage() {
  const { data: orders, isLoading } = useAdminOrders()

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Vendas</h1>
      <p className="mt-1 text-muted-foreground">Pedidos e pagamentos processados via Pix e cartão.</p>

      {isLoading ? (
        <div className="mt-8">
          <LoadingState />
        </div>
      ) : !orders?.length ? (
        <div className="mt-8">
          <EmptyState title="Nenhuma venda ainda" description="Pedidos aparecerão aqui após o checkout." />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Método</th>
                <th className="p-4">Status</th>
                <th className="p-4">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => {
                const status = statusLabels[o.status] ?? statusLabels.pending
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="p-4">
                      <p className="font-medium">{o.profiles?.full_name ?? o.customer_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{o.profiles?.email ?? o.customer_email}</p>
                    </td>
                    <td className="p-4 font-medium">{formatBRL(o.amount_cents)}</td>
                    <td className="p-4 capitalize text-muted-foreground">{o.payment_method ?? '—'}</td>
                    <td className="p-4">
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', status.className)}>{status.label}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
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
