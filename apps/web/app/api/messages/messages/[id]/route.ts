import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// DELETE /api/messages/messages/[id]
// Tries soft-delete (deleted_at) first; falls back to hard delete if column
// doesn't exist yet (migration not applied).

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Verify message ownership
  const { data: msg } = await admin
    .from('messages')
    .select('id, sender_id')
    .eq('id', params.id)
    .single()

  if (!msg) return NextResponse.json({ error: 'Message introuvable' }, { status: 404 })
  if (msg.sender_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Attempt soft delete (requires migration)
  const { error: softErr } = await admin
    .from('messages')
    .update({ deleted_at: new Date().toISOString() } as any)
    .eq('id', params.id)

  if (softErr) {
    // Column doesn't exist — fall back to hard delete
    const { error: hardErr } = await admin
      .from('messages')
      .delete()
      .eq('id', params.id)

    if (hardErr) {
      console.error('[messages DELETE] hard delete error:', hardErr)
      return NextResponse.json({ error: hardErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
