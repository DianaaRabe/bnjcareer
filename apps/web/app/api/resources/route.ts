import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/resources — all published resources visible to everyone
// Coaches also see their own drafts when ?mine=true
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const category  = searchParams.get('category')
    const search    = searchParams.get('search')
    const mineOnly  = searchParams.get('mine') === 'true'

    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
      .from('resources')
      .select('id, title, description, type, category, file_url, size_label, duration_label, is_published, is_locked, price, views_count, coach_id, created_at')
      .order('created_at', { ascending: false })

    if (mineOnly && user) {
      // Coach management view: own resources (published + drafts)
      query = query.eq('coach_id', user.id)
    } else {
      // Public view: all published resources (candidates + unauthenticated)
      query = query.eq('is_published', true)
    }

    if (category && category !== 'Tous') query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) throw error

    // For locked resources requested by non-owners, hide the actual file_url
    const userId = user?.id
    const safeData = (data || []).map((r) => {
      if (r.is_locked && r.coach_id !== userId) {
        return { ...r, file_url: null }
      }
      return r
    })

    return NextResponse.json({ resources: safeData })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/resources — coach creates a resource
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description    = '',
      type           = 'pdf',
      category       = 'Général',
      file_url       = '',
      size_label     = null,
      duration_label = null,
      is_published   = true,
      is_locked      = false,
      price          = 0,
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('resources')
      .insert({
        title,
        description,
        type,
        category,
        url: file_url,
        file_url,
        size_label,
        duration_label,
        is_published,
        is_locked,
        price: is_locked ? price : 0,
        coach_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ resource: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
