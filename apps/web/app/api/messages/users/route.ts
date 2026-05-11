import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/messages/users?q=search
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  const admin = createAdminClient()

  // profiles uses first_name + last_name (no full_name column)
  let query = admin
    .from('profiles')
    .select('id, first_name, last_name, role, avatar_url')
    .neq('id', user.id)
    .limit(20)

  if (q.length >= 1) {
    // Search across both first_name and last_name
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
  }

  const { data: users, error } = await query.order('first_name')

  if (error) {
    console.error('[messages/users] DB error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = (users ?? []).map((u) => ({
    id: u.id,
    full_name: [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Utilisateur',
    role: u.role,
    avatar_url: u.avatar_url,
  }))

  return NextResponse.json({ users: result })
}
