import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Menu, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useSiteSetting } from '@/hooks/use-site-settings'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { data: general } = useSiteSetting('general')

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          {general?.logo_url ? (
            <img src={general.logo_url} alt={general.platform_name} className="h-7 w-7 rounded-lg" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
          )}
          <span>{general?.platform_name ?? 'SitesIA'}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link to="/curso" className="text-muted-foreground transition-colors hover:text-foreground">
            O curso
          </Link>
          {user ? (
            <Link to="/dashboard">
              <Button size="sm">Meu dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">
                Entrar
              </Link>
              <Link to="/curso">
                <Button size="sm">Quero aprender</Button>
              </Link>
            </>
          )}
        </nav>

        <button
          className="focus-ring rounded-lg p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            <Link to="/curso" className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setOpen(false)}>
              O curso
            </Link>
            {user ? (
              <Link to="/dashboard" className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setOpen(false)}>
                Meu dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setOpen(false)}>
                  Entrar
                </Link>
                <Link to="/curso" className="mt-1" onClick={() => setOpen(false)}>
                  <Button className="w-full">Quero aprender</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
