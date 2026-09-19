import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SiteSettingsMap } from '@/types/database'

/**
 * Lê uma chave de site_settings (tabela editável pelo admin).
 * Todas as chaves usadas no site público têm is_public = true.
 */
export function useSiteSetting<K extends keyof SiteSettingsMap>(key: K) {
  return useQuery({
    queryKey: ['site_settings', key],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('value').eq('key', key).maybeSingle()
      if (error) throw error
      return (data?.value ?? null) as SiteSettingsMap[K] | null
    },
    staleTime: 60_000,
  })
}
