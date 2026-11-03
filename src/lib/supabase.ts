import { createClient } from '@supabase/supabase-js'
import { createLocalClient } from '@/lib/local-client'
import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** true quando as variáveis do Supabase existem; false = modo local (demonstração). */
export const supabaseConfigured = Boolean(url && key)

/**
 * Cliente de dados do app.
 * - Com VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY: usa o Supabase de verdade.
 * - Sem elas: usa um banco local no navegador (localStorage) com um curso de demonstração,
 *   então o site funciona em qualquer hospedagem sem configuração.
 *
 * Nunca importe a SUPABASE_SERVICE_ROLE_KEY aqui — ela só existe nas Edge Functions.
 */
export const supabase = (
  supabaseConfigured
    ? createClient<Database>(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
    : createLocalClient()
) as ReturnType<typeof createClient<Database>>
