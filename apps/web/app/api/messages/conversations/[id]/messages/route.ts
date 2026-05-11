import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// ─── GET /api/messages/conversations/[id]/messages ────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const convId = params.id

  // Verify participant
  const { data: part } = await admin
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', convId)
    .eq('user_id', user.id)
    .single()

  if (!part) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Fetch messages — profiles uses first_name + last_name (no full_name column)
  const { data: messages, error } = await admin
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      created_at,
      profiles ( first_name, last_name, avatar_url, role )
    `)
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) {
    console.error('[messages GET] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = ((messages ?? []) as any[]).map((m) => ({
    id: m.id,
    conversation_id: m.conversation_id,
    sender_id: m.sender_id,
    content: m.content,
    created_at: m.created_at,
    is_mine: m.sender_id === user.id,
    sender_name:
      [m.profiles?.first_name, m.profiles?.last_name].filter(Boolean).join(' ') ||
      'Utilisateur',
    sender_avatar: m.profiles?.avatar_url ?? null,
    sender_role: m.profiles?.role ?? null,
  }))

  return NextResponse.json({ messages: result })
}

// ─── POST /api/messages/conversations/[id]/messages ───────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const convId = params.id

  // Verify participant
  const { data: part } = await admin
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', convId)
    .eq('user_id', user.id)
    .single()

  if (!part) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { content } = await request.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Contenu vide' }, { status: 400 })

  const now = new Date().toISOString()

  // Insert message
  const { data: message, error: msgErr } = await admin
    .from('messages')
    .insert({ conversation_id: convId, sender_id: user.id, content: content.trim() })
    .select()
    .single()

  if (msgErr) {
    console.error('[messages POST] insert error:', msgErr)
    return NextResponse.json({ error: msgErr.message }, { status: 500 })
  }

  // Optional: update last_message_at on conversation (only if migration has been applied)
  // Errors are silently ignored — column may not exist yet
  await admin
    .from('conversations')
    .update({ last_message_at: now } as any)
    .eq('id', convId)

  // Optional: mark sender's read timestamp
  await admin
    .from('conversation_participants')
    .update({ last_read_at: now } as any)
    .eq('conversation_id', convId)
    .eq('user_id', user.id)

  return NextResponse.json({ message }, { status: 201 })
}
