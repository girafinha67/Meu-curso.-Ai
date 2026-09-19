import { Link } from '@tanstack/react-router'
import { useSiteSetting } from '@/hooks/use-site-settings'

export function Footer() {
  const { data: general } = useSiteSetting('general')

  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
        <p>
          © {new Date().getFullYear()} {general?.platform_name ?? 'SitesIA'}. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-6">
          <Link to="/curso" className="hover:text-foreground">
            O curso
          </Link>
          <Link to="/login" className="hover:text-foreground">
            Entrar
          </Link>
          {general?.support_email && (
            <a href={`mailto:${general.support_email}`} className="hover:text-foreground">
              Suporte
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
