import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

export async function GET() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  // Récupère tous les profils avec leurs emails depuis auth.users via admin API
  const [profilesRes, usersRes] = await Promise.all([
    admin.from('profiles').select('id, first_name, last_name, role, created_at, is_onboarded').order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const profiles = profilesRes.data ?? []
  const authUsers = usersRes.data?.users ?? []

  // Fusion profil + email
  const emailMap = new Map(authUsers.map(u => [u.id, u.email]))
  const members = profiles.map(p => ({
    ...p,
    email: emailMap.get(p.id) ?? null,
  }))

  return NextResponse.json({ members })
}
