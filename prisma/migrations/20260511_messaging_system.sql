-- =============================================================
-- BNJ Career – Messaging System Migration
-- 2026-05-11
-- =============================================================

-- 1. Extend conversations table
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS name            TEXT,
  ADD COLUMN IF NOT EXISTS is_group        BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_by      UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ  DEFAULT NOW();

-- 2. Extend conversation_participants table
ALTER TABLE conversation_participants
  ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ;

-- 3. Extend messages table
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 4. Enable RLS
ALTER TABLE conversations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                   ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- RLS: conversations
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "conv_select" ON conversations;
CREATE POLICY "conv_select" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "conv_insert" ON conversations;
CREATE POLICY "conv_insert" ON conversations
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "conv_update" ON conversations;
CREATE POLICY "conv_update" ON conversations
  FOR UPDATE USING (created_by = auth.uid());

-- ---------------------------------------------------------------
-- RLS: conversation_participants
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "cp_select" ON conversation_participants;
CREATE POLICY "cp_select" ON conversation_participants
  FOR SELECT USING (
    -- see your own rows OR rows in a conversation you belong to
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
        AND cp2.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cp_insert" ON conversation_participants;
CREATE POLICY "cp_insert" ON conversation_participants
  FOR INSERT WITH CHECK (
    -- only the conversation creator can add participants
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
        AND created_by = auth.uid()
    )
    OR user_id = auth.uid()   -- or you add yourself (for DMs)
  );

DROP POLICY IF EXISTS "cp_update" ON conversation_participants;
CREATE POLICY "cp_update" ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid());

-- ---------------------------------------------------------------
-- RLS: messages
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "msg_select" ON messages;
CREATE POLICY "msg_select" ON messages
  FOR SELECT USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "msg_insert" ON messages;
CREATE POLICY "msg_insert" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "msg_update" ON messages;
CREATE POLICY "msg_update" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- 5. Helper function: find existing DM between two users
CREATE OR REPLACE FUNCTION find_dm_conversation(user_a UUID, user_b UUID)
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT c.id
  FROM conversations c
  WHERE c.is_group = FALSE
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp1
      WHERE cp1.conversation_id = c.id AND cp1.user_id = user_a
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = c.id AND cp2.user_id = user_b
    )
    -- ensure exactly 2 participants (strict DM)
    AND (
      SELECT COUNT(*) FROM conversation_participants cp3
      WHERE cp3.conversation_id = c.id
    ) = 2
  LIMIT 1;
$$;

-- 6. Index for performance
CREATE INDEX IF NOT EXISTS idx_conv_participants_user  ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv  ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation   ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender        ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conv_last_message      ON conversations(last_message_at DESC);
