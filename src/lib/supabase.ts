import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  // Nunca quebra a build, mas avisa alto no console em dev.
  console.error(
    '[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY não configurados. Copie .env.example para .env e preencha.'
  )
}

/**
 * Cliente Supabase do lado do navegador.
 * Usa apenas a chave PÚBLICA (publishable/anon). Nunca importe a
 * SUPABASE_SERVICE_ROLE_KEY aqui — ela só existe nas Edge Functions.
 */
export const supabase = createClient<Database>(url ?? '', key ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
