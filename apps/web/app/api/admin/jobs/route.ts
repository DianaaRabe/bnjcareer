import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const search     = searchParams.get('search')
    const companyId  = searchParams.get('company_id')
    const activeOnly = searchParams.get('active') !== 'false'

    let q = supabase
      .from('local_jobs')
      .select(`
        id, title, location, contract_type, salary_label, experience_level,
        remote, is_active, created_at, expires_at, skills,
        companies(id, name, logo_url)
      `)
      .order('created_at', { ascending: false })

    if (activeOnly) q = q.eq('is_active', true)
    if (companyId)  q = q.eq('company_id', companyId)
    if (search)     q = q.ilike('title', `%${search}%`)

    const { data, error } = await q
    if (error) throw error
    return NextResponse.json({ jobs: data ?? [] })
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
    const { title, company_id } = body
    if (!title?.trim())     return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })
    if (!company_id)        return NextResponse.json({ error: 'L\'entreprise est requise' }, { status: 400 })

    const { data, error } = await supabase
      .from('local_jobs')
      .insert({ ...body, created_by: admin.id })
      .select().single()

    if (error) throw error
    return NextResponse.json({ job: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
