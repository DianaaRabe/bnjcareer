import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await request.json()
    
    // Validate required fields
    const { title, type, start_time, end_time, max_participants, meet_link, is_paid, price } = payload
    
    if (!title || !type || !start_time || !end_time) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    const eventData = {
      coach_id: user.id,
      title: title.trim(),
      type: type, // '1v1' or 'group'
      start_time: new Date(start_time).toISOString(),
      end_time: new Date(end_time).toISOString(),
      max_participants: type === '1v1' ? 1 : (Number(max_participants) || 10),
      meet_link: meet_link?.trim() || null,
      is_paid: !!is_paid,
      price: is_paid ? (Number(price) || 0) : 0,
    }

    const { data: newEvent, error: insertError } = await supabase
      .from('coach_events')
      .insert(eventData)
      .select()
      .single()

    if (insertError) {
      console.error('[coach-events] DB Insert Error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, event: newEvent })
  } catch (error) {
    console.error('[coach-events] Server Error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
