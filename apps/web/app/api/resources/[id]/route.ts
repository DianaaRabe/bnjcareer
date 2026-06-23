import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/resources/[id] — coach updates a resource
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()

    const { data: existing } = await supabase
      .from('resources')
      .select('coach_id')
      .eq('id', id)
      .single()

    if (!existing || existing.coach_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const updatePayload: Record<string, unknown> = {
      ...body,
      updated_at: new Date().toISOString(),
    }
    // Keep url in sync with file_url for backwards compat
    if (body.file_url !== undefined) updatePayload.url = body.file_url
    // Reset price to 0 when unlocking
    if (body.is_locked === false) updatePayload.price = 0

    const { data, error } = await supabase
      .from('resources')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ resource: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/resources/[id] — coach deletes a resource
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)
      .eq('coach_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/resources/[id] — increment view count (fire-and-forget)
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    // Fetch current count then bump it
    const { data } = await supabase
      .from('resources')
      .select('views_count')
      .eq('id', params.id)
      .single()
    if (data) {
      await supabase
        .from('resources')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', params.id)
    }
  } catch {}
  return NextResponse.json({ success: true })
}
