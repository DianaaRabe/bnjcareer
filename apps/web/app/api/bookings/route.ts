import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // User-scoped client for auth verification
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Admin client to bypass RLS for counter updates and notifications
  const admin = createAdminClient()

  try {
    const { event_id, action } = await request.json()

    if (!event_id || !action) {
      return NextResponse.json({ error: 'event_id et action requis' }, { status: 400 })
    }

    if (action === 'book') {
      // Check if already booked (use admin to see all bookings)
      const { data: existing } = await admin
        .from('bookings')
        .select('id')
        .eq('event_id', event_id)
        .eq('user_id', user.id)
        .eq('status', 'booked')
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ error: 'Déjà inscrit' }, { status: 409 })
      }

      // Check event capacity (use admin to read current_participants reliably)
      const { data: event, error: eventError } = await admin
        .from('coach_events')
        .select('max_participants, current_participants, coach_id, title')
        .eq('id', event_id)
        .single()

      if (eventError || !event) {
        console.error('[booking] Event fetch error:', eventError)
        return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
      }

      const currentCount = event.current_participants || 0
      if (currentCount >= event.max_participants) {
        return NextResponse.json({ error: 'Plus de places disponibles' }, { status: 409 })
      }

      // Insert booking (admin bypasses RLS)
      const { error: bookingError } = await admin
        .from('bookings')
        .insert({ event_id, user_id: user.id, status: 'booked' })

      if (bookingError) {
        console.error('[booking] Insert error:', bookingError)
        return NextResponse.json({ error: bookingError.message }, { status: 500 })
      }

      // Increment current_participants (admin bypasses RLS on coach_events)
      const { error: updateError } = await admin
        .from('coach_events')
        .update({ current_participants: currentCount + 1 })
        .eq('id', event_id)

      if (updateError) {
        console.error('[booking] Update count error:', updateError)
      }

      // Create notification for the coach
      const { error: notifError } = await admin
        .from('coach_notifications')
        .insert({
          coach_id: event.coach_id,
          candidate_id: user.id,
          event_id: event_id,
          type: 'booking',
          is_read: false,
        })

      if (notifError) {
        console.error('[booking] Notification error:', notifError)
      }

      return NextResponse.json({ 
        success: true, 
        action: 'booked',
        current_participants: currentCount + 1 
      })

    } else if (action === 'unbook') {
      // Get event info before deleting (admin client)
      const { data: event } = await admin
        .from('coach_events')
        .select('current_participants, coach_id')
        .eq('id', event_id)
        .single()

      // Delete booking (admin bypasses RLS)
      const { error: deleteError } = await admin
        .from('bookings')
        .delete()
        .eq('event_id', event_id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('[booking] Delete error:', deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      // Decrement current_participants (admin bypasses RLS)
      let newCount = 0
      if (event) {
        newCount = Math.max(0, (event.current_participants || 1) - 1)
        const { error: updateError } = await admin
          .from('coach_events')
          .update({ current_participants: newCount })
          .eq('id', event_id)

        if (updateError) {
          console.error('[booking] Update count error:', updateError)
        }

        // Create notification for the coach
        const { error: notifError } = await admin
          .from('coach_notifications')
          .insert({
            coach_id: event.coach_id,
            candidate_id: user.id,
            event_id: event_id,
            type: 'cancellation',
            is_read: false,
          })

        if (notifError) {
          console.error('[booking] Notification error:', notifError)
        }
      }

      return NextResponse.json({ 
        success: true, 
        action: 'unbooked',
        current_participants: newCount 
      })

    } else {
      return NextResponse.json({ error: 'Action invalide (book|unbook)' }, { status: 400 })
    }
  } catch (error) {
    console.error('[booking] Server Error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
