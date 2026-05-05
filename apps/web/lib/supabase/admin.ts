import { createClient as createServerClient } from '@supabase/supabase-js'

/**
 * Client Supabase Admin (service role) pour les opérations serveur
 * qui nécessitent de bypass les politiques RLS.
 * 
 * ⚠️ NE JAMAIS exposer ce client côté navigateur.
 * À utiliser uniquement dans les Route Handlers (app/api/*).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
