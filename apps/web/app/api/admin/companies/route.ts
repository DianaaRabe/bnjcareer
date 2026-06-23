import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    let q = supabase
      .from('companies')
      .select('id, name, logo_url, website_url, description, sector, size_label, location, is_active, created_at')
      .order('name')

    if (search) q = q.ilike('name', `%${search}%`)

    const { data, error } = await q
    if (error) throw error
    return NextResponse.json({ companies: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const admin = await assertAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const body = await req.json()
    const { name, logo_url, website_url, description, sector, size_label, location } = body
    if (!name?.trim()) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })

    const { data, error } = await supabase
      .from('companies')
      .insert({ name, logo_url, website_url, description, sector, size_label, location, created_by: admin.id })
      .select().single()

    if (error) throw error
    return NextResponse.json({ company: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
