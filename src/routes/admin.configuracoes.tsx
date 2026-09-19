import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { RequireAdmin } from '@/components/auth-guard'
import { AdminShell } from '@/components/admin/admin-shell'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/states'

export const Route = createFileRoute('/admin/configuracoes')({
  component: () => (
    <RequireAdmin>
      <AdminSettingsPage />
    </RequireAdmin>
  ),
})

function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('key, value')
      if (error) throw error
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, any>
    },
  })

  const [general, setGeneral] = useState<any>({})
  const [dex, setDex] = useState<any>({})
  const [savedKey, setSavedKey] = useState<string | null>(null)

  useEffect(() => {
    if (settings) {
      setGeneral(settings.general ?? {})
      setDex(settings.dex ?? {})
    }
  }, [settings])

  async function saveSetting(key: string, value: any) {
    await supabase.from('site_settings').update({ value }).eq('key', key)
    setSavedKey(key)
    queryClient.invalidateQueries({ queryKey: ['site_settings', key] })
    setTimeout(() => setSavedKey(null), 2500)
  }

  if (isLoading) return <AdminShell><LoadingState /></AdminShell>

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      <p className="mt-1 text-muted-foreground">Ajustes editáveis sem mexer em código.</p>

      <div className="mt-6 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Geral</CardTitle>
            <CardDescription>Identidade da plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nome da plataforma</label>
              <Input value={general.platform_name ?? ''} onChange={(e) => setGeneral({ ...general, platform_name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Logo (URL)</label>
              <Input value={general.logo_url ?? ''} onChange={(e) => setGeneral({ ...general, logo_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">E-mail de suporte</label>
              <Input value={general.support_email ?? ''} onChange={(e) => setGeneral({ ...general, support_email: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => saveSetting('general', general)}>Salvar</Button>
              {savedKey === 'general' && (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> Salvo
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary-200">
          <CardHeader>
            <CardTitle>Dex.ai</CardTitle>
            <CardDescription>Divulgação da Dex.ai dentro do curso (Aula 5). Deixe a URL vazia para ocultar o botão.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!dex.enabled}
                onChange={(e) => setDex({ ...dex, enabled: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <label className="text-sm font-medium">Seção ativada</label>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Título</label>
              <Input value={dex.title ?? ''} onChange={(e) => setDex({ ...dex, title: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Descrição</label>
              <Textarea value={dex.description ?? ''} onChange={(e) => setDex({ ...dex, description: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">URL (deixe vazio para não mostrar o botão)</label>
              <Input value={dex.url ?? ''} onChange={(e) => setDex({ ...dex, url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Texto do botão</label>
              <Input value={dex.cta_text ?? ''} onChange={(e) => setDex({ ...dex, cta_text: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Logo (URL)</label>
              <Input value={dex.logo_url ?? ''} onChange={(e) => setDex({ ...dex, logo_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => saveSetting('dex', dex)}>Salvar</Button>
              {savedKey === 'dex' && (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> Salvo
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
