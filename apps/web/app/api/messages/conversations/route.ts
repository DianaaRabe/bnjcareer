import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// ─── helpers ─────────────────────────────────────────────────────────────────

function fullName(p: { first_name?: string | null; last_name?: string | null } | null): string {
  if (!p) return 'Utilisateur'
  return [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Utilisateur'
}

// ─── GET /api/messages/conversations ─────────────────────────────────────────
// Works with the base schema (no migration required).
// After running 20260511_messaging_system.sql the route picks up extra columns
// (is_group flag stored in DB, named groups, last_message_at sort, etc.)

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // 1. Which conversations does the current user belong to?
  const { data: participations, error: pErr } = await admin
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (pErr) {
    console.error('[conversations GET] participants error:', pErr)
    return NextResponse.json({ error: pErr.message }, { status: 500 })
  }
  if (!participations?.length) return NextResponse.json({ conversations: [] })

  const convIds = participations.map((p) => p.conversation_id)

  // 2. Fetch conversations + participants + profiles (only existing columns)
  const { data: conversations, error: cErr } = await admin
    .from('conversations')
    .select(`
      id,
      created_at,
      conversation_participants (
        user_id,
        profiles ( id, first_name, last_name, role, avatar_url )
      )
    `)
    .in('id', convIds)

  if (cErr) {
    console.error('[conversations GET] conversations error:', cErr)
    return NextResponse.json({ error: cErr.message }, { status: 500 })
  }

  // 3. Fetch last message per conversation (for preview + sort)
  const { data: allLastMsgs } = await admin
    .from('messages')
    .select('conversation_id, content, sender_id, created_at')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: false })

  const lastMsgMap: Record<string, { content: string; created_at: string }> = {}
  ;(allLastMsgs ?? []).forEach((m) => {
    if (!lastMsgMap[m.conversation_id]) lastMsgMap[m.conversation_id] = m
  })

  // 4. Build result — derive group status from participant count
  const result = ((conversations ?? []) as any[]).map((conv) => {
    const participants: any[] = conv.conversation_participants ?? []
    const others = participants.filter((p) => p.user_id !== user.id)
    const isGroup = participants.length > 2

    const name = isGroup
      ? participants
          .map((p) => fullName(p.profiles))
          .join(', ')
      : fullName(others[0]?.profiles)

    const lastMsg = lastMsgMap[conv.id]

    return {
      id: conv.id,
      name,
      is_group: isGroup,
      last_message_at: lastMsg?.created_at ?? conv.created_at,
      last_message: lastMsg?.content ?? null,
      unread: 0, // read-tracking available after migration
      participants: participants.map((p) => ({
        user_id: p.user_id,
        full_name: fullName(p.profiles),
        role: p.profiles?.role ?? null,
        avatar_url: p.profiles?.avatar_url ?? null,
        last_read_at: null,
      })),
    }
  })

  // Sort by last message descending
  result.sort(
    (a, b) =>
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  )

  return NextResponse.json({ conversations: result })
}

// ─── POST /api/messages/conversations ────────────────────────────────────────
// Create a DM or group. Tries to store extra fields added by migration,
// gracefully falls back to base schema if migration hasn't been applied yet.

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const body = await request.json()
  const {
    participant_ids,
    name,
    is_group = false,
  } = body as { participant_ids: string[]; name?: string; is_group?: boolean }

  if (!participant_ids?.length) {
    return NextResponse.json({ error: 'participant_ids requis' }, { status: 400 })
  }

  // For DMs: find existing conversation between these two users
  if (!is_group && participant_ids.length === 1) {
    const otherUserId = participant_ids[0]

    const { data: myConvs } = await admin
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    if (myConvs?.length) {
      const myConvIds = myConvs.map((c) => c.conversation_id)
      const { data: shared } = await admin
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', myConvIds)

      for (const s of shared ?? []) {
        const { data: allParts } = await admin
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', s.conversation_id)
        if (allParts?.length === 2) {
          return NextResponse.json({ conversation: { id: s.conversation_id } })
        }
      }
    }
  }

  // Try inserting with migration-added columns; fall back to base schema
  let conv: any = null
  let convErr: any = null

  // Attempt 1: with new columns (migration applied)
  ;({ data: conv, error: convErr } = await admin
    .from('conversations')
    .insert({
      name: is_group ? (name?.trim() || 'Nouveau groupe') : null,
      is_group,
      created_by: user.id,
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single())

  if (convErr) {
    // Attempt 2: base schema only (migration not yet applied)
    ;({ data: conv, error: convErr } = await admin
      .from('conversations')
      .insert({})
      .select()
      .single())
  }

  if (convErr || !conv) {
    console.error('[conversations POST] insert error:', convErr)
    return NextResponse.json({ error: convErr?.message ?? 'Erreur création' }, { status: 500 })
  }

  // Add all participants (creator + invitees, deduplicated)
  const allParticipants = Array.from(new Set([user.id, ...participant_ids]))
  const { error: partErr } = await admin
    .from('conversation_participants')
    .insert(allParticipants.map((uid) => ({ conversation_id: conv.id, user_id: uid })))

  if (partErr) {
    console.error('[conversations POST] participants error:', partErr)
    return NextResponse.json({ error: partErr.message }, { status: 500 })
  }

  return NextResponse.json({ conversation: conv }, { status: 201 })
}
