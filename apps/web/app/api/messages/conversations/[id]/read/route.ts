import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/messages/conversations/[id]/read
// Updates last_read_at (available after migration). Silently no-ops if
// the column doesn't exist yet — always returns 200 to the client.

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Fire-and-forget — ignore errors (column may not exist pre-migration)
  await admin
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() } as any)
    .eq('conversation_id', params.id)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
