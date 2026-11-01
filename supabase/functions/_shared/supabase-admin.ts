// Cliente com SERVICE ROLE KEY — roda apenas no servidor (Edge Function).
// NUNCA importar este arquivo em código de frontend.
import { createClient } from 'jsr:@supabase/supabase-js@2'

export function createAdminClient() {
  const url = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Extrai e valida o usuário autenticado a partir do header Authorization,
 * usando o client admin (não confia em nada vindo do corpo da requisição).
 */
export async function getAuthenticatedUser(req: Request) {
  const admin = createAdminClient()
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return { user: null, admin }
  const { data, error } = await admin.auth.getUser(token)
  if (error) return { user: null, admin }
  return { user: data.user, admin }
}
