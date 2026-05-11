/**
 * Cleanup : supprime les doublons de Benjamin Parienty et Fanilo Rabemanantsoa
 *
 * Stratégie :
 *   - On garde UNIQUEMENT les comptes dont l'email correspond aux vrais comptes.
 *   - Tout profil avec le même prénom/nom mais un email différent est supprimé
 *     (avec toutes ses données associées).
 *
 * Usage : npm run cleanup:duplicates
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ogwrtegpknihxixgptqe.supabase.co'
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3J0ZWdwa25paHhpeGdwdHFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc0MzE0NiwiZXhwIjoyMDkxMzE5MTQ2fQ.Qe52dmgdVa_XXip5xC7NxSqFnAwgWTJzZNvs6CB8EaY'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const log  = (m: string) => console.log(`\x1b[36m▸\x1b[0m ${m}`)
const ok   = (m: string) => console.log(`\x1b[32m✓\x1b[0m ${m}`)
const warn = (m: string) => console.log(`\x1b[33m⚠\x1b[0m ${m}`)
const err  = (m: string) => console.log(`\x1b[31m✗\x1b[0m ${m}`)

// Comptes à préserver (email → { first_name, last_name })
const REAL_USERS: Record<string, { first_name: string; last_name: string }> = {
  'site.benjaminparienty@gmail.com': { first_name: 'Benjamin', last_name: 'Parienty' },
  'fanilo@bnjteammaker.fr':          { first_name: 'Fanilo',   last_name: 'Rabemanantsoa' },
}

// ─── Supprime toutes les données d'un utilisateur et son compte auth ──────────

async function deleteUserAndData(userId: string, email: string): Promise<void> {
  log(`  Suppression de ${email} (${userId.slice(0, 8)}...)`)

  // Supprimer les participations aux conversations
  const { error: cpErr } = await supabase
    .from('conversation_participants')
    .delete()
    .eq('user_id', userId)
  if (cpErr) warn(`    conversation_participants: ${cpErr.message}`)
  else log(`    conversation_participants ✓`)

  // Supprimer les messages envoyés
  const { error: msgErr } = await supabase
    .from('messages')
    .delete()
    .eq('sender_id', userId)
  if (msgErr) warn(`    messages: ${msgErr.message}`)
  else log(`    messages ✓`)

  // Supprimer les inscriptions formations
  const { error: feErr } = await supabase
    .from('formation_enrollments')
    .delete()
    .eq('student_id', userId)
  if (feErr) warn(`    formation_enrollments: ${feErr.message}`)
  else log(`    formation_enrollments ✓`)

  // Supprimer les objectifs
  const { error: gErr } = await supabase
    .from('goals')
    .delete()
    .eq('user_id', userId)
  if (gErr) warn(`    goals: ${gErr.message}`)
  else log(`    goals ✓`)

  // Supprimer les candidatures
  const { error: appErr } = await supabase
    .from('applications')
    .delete()
    .eq('user_id', userId)
  if (appErr) warn(`    applications: ${appErr.message}`)
  else log(`    applications ✓`)

  // Si c'est un coach : supprimer ses événements et formations
  const { data: coachEvents } = await supabase
    .from('coach_events')
    .select('id')
    .eq('coach_id', userId)

  if (coachEvents?.length) {
    // Supprimer les bookings liés à ces events
    const eventIds = coachEvents.map((e) => e.id)
    await supabase.from('bookings').delete().in('event_id', eventIds)
    // Supprimer les notifications coach
    await supabase.from('coach_notifications').delete().eq('coach_id', userId)
    // Supprimer les events
    await supabase.from('coach_events').delete().eq('coach_id', userId)
    log(`    coach_events (${coachEvents.length}) ✓`)
  }

  const { data: formations } = await supabase
    .from('formations')
    .select('id')
    .eq('coach_id', userId)

  if (formations?.length) {
    const formationIds = formations.map((f) => f.id)

    // Récupérer les enrollments de ces formations pour supprimer leur progression
    const { data: enrollments } = await supabase
      .from('formation_enrollments')
      .select('id')
      .in('formation_id', formationIds)

    if (enrollments?.length) {
      const enrollmentIds = enrollments.map((e) => e.id)
      await supabase.from('formation_progress').delete().in('enrollment_id', enrollmentIds)
      await supabase.from('formation_enrollments').delete().in('formation_id', formationIds)
    }

    // Supprimer modules et milestones
    await supabase.from('formation_modules').delete().in('formation_id', formationIds)
    await supabase.from('formation_milestones').delete().in('formation_id', formationIds)
    // Supprimer les formations
    await supabase.from('formations').delete().eq('coach_id', userId)
    log(`    formations (${formations.length}) ✓`)
  }

  // Supprimer le profil
  const { error: profErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)
  if (profErr) warn(`    profiles: ${profErr.message}`)
  else log(`    profiles ✓`)

  // Supprimer l'utilisateur auth
  const { error: authErr } = await supabase.auth.admin.deleteUser(userId)
  if (authErr) err(`    auth.deleteUser: ${authErr.message}`)
  else ok(`  Utilisateur supprimé : ${email}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🧹 \x1b[1mCleanup — suppression des doublons\x1b[0m\n')

  // Charger tous les utilisateurs auth
  const { data: { users: allUsers }, error: listErr } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  })
  if (listErr) { err('Impossible de lister les utilisateurs : ' + listErr.message); process.exit(1) }

  console.log(`Total utilisateurs auth : ${allUsers.length}\n`)

  for (const [realEmail, { first_name, last_name }] of Object.entries(REAL_USERS)) {
    console.log(`\n\x1b[35m━━ ${first_name} ${last_name} ━━\x1b[0m`)

    // Trouver le vrai compte (par email exact)
    const realUser = allUsers.find((u) => u.email === realEmail)

    if (!realUser) {
      warn(`Vrai compte introuvable pour ${realEmail} — rien à nettoyer.`)
      continue
    }
    ok(`Vrai compte : ${realEmail} → ${realUser.id.slice(0, 8)}...`)

    // Trouver les doublons : même prénom/nom dans profiles, email différent
    const { data: sameNameProfiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('first_name', first_name)
      .eq('last_name', last_name)
      .neq('id', realUser.id)  // exclure le vrai compte

    if (pErr) { err(`Erreur profiles : ${pErr.message}`); continue }

    if (!sameNameProfiles?.length) {
      ok(`Aucun doublon trouvé pour ${first_name} ${last_name}.`)
      continue
    }

    warn(`${sameNameProfiles.length} doublon(s) trouvé(s) pour ${first_name} ${last_name} :`)

    for (const profile of sameNameProfiles) {
      // Retrouver l'email de ce doublon dans la liste auth
      const dupUser = allUsers.find((u) => u.id === profile.id)
      const dupEmail = dupUser?.email ?? `(email inconnu)`
      warn(`  → id=${profile.id.slice(0, 8)}...  email=${dupEmail}`)
      await deleteUserAndData(profile.id, dupEmail)
    }
  }

  console.log('\n\x1b[32m🎉 Cleanup terminé !\x1b[0m\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
