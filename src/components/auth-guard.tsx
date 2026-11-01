import { type ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import { LoadingState } from '@/components/ui/states'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingState label="Verificando sua sessão..." />
  if (!user) return <Navigate to="/login" />

  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <LoadingState label="Verificando permissões..." />
  if (!user) return <Navigate to="/login" />
  if (!isAdmin) return <Navigate to="/dashboard" />

  return <>{children}</>
}
