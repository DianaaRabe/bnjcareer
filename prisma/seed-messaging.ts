/**
 * Seed: conversations & messages
 *
 * Prérequis :
 *   1. seed-benjamin-fanilo.ts doit avoir été exécuté (Benjamin + Fanilo + test candidates).
 *   2. La migration prisma/migrations/20260511_messaging_system.sql doit être appliquée
 *      dans le dashboard Supabase (SQL Editor) pour les champs is_group / name / created_by.
 *      Si la migration n'est pas encore appliquée, ce seed fonctionne quand même en mode dégradé
 *      (les conversations seront créées sans nom ni flag is_group).
 *
 * Commande : npm run seed:messaging
 */

import { createClient } from '@supabase/supabase-js'

// Mêmes constantes que seed-benjamin-fanilo.ts
const SUPABASE_URL = 'https://ogwrtegpknihxixgptqe.supabase.co'
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3J0ZWdwa25paHhpeGdwdHFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc0MzE0NiwiZXhwIjoyMDkxMzE5MTQ2fQ.Qe52dmgdVa_XXip5xC7NxSqFnAwgWTJzZNvs6CB8EaY'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── helpers ──────────────────────────────────────────────────────────────────

async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  return users.find((u) => u.email === email)?.id ?? null
}

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString()
}
const MIN = 60_000
const H = 3_600_000
const D = 86_400_000

// ─── Create a conversation (tries with new columns, falls back gracefully) ────

async function createConversation(
  opts: { name?: string; is_group?: boolean; created_by?: string }
): Promise<string> {
  // Try with migration columns
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      name: opts.name ?? null,
      is_group: opts.is_group ?? false,
      created_by: opts.created_by,
      last_message_at: new Date().toISOString(),
    } as any)
    .select('id')
    .single()

  if (!error && data) return data.id

  // Fallback: base schema only
  const { data: base, error: baseErr } = await supabase
    .from('conversations')
    .insert({})
    .select('id')
    .single()

  if (baseErr || !base) throw new Error('Cannot create conversation: ' + (baseErr?.message ?? 'unknown'))
  return base.id
}

async function addParticipants(convId: string, userIds: string[]): Promise<void> {
  const unique = Array.from(new Set(userIds))
  await supabase.from('conversation_participants').insert(
    unique.map((uid) => ({ conversation_id: convId, user_id: uid }))
  )
}

async function sendMessages(
  convId: string,
  msgs: { sender_id: string; content: string; at: string }[]
): Promise<void> {
  for (const m of msgs) {
    await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id: m.sender_id,
      content: m.content,
      created_at: m.at,
    })
    // Update last_message_at if column exists
    await supabase
      .from('conversations')
      .update({ last_message_at: m.at } as any)
      .eq('id', convId)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('💬 Seeding messaging data...\n')

  // Get key users
  const benjaminId = await getUserIdByEmail('site.benjaminparienty@gmail.com')
  const faniloId   = await getUserIdByEmail('fanilo@bnjteammaker.fr')

  if (!benjaminId) {
    console.error('❌ Benjamin Parienty not found. Run seed-benjamin-fanilo.ts first.')
    process.exit(1)
  }
  if (!faniloId) {
    console.error('❌ Fanilo Rabemanantsoa not found. Run seed-benjamin-fanilo.ts first.')
    process.exit(1)
  }

  // Get extra candidates
  const { data: candidateProfiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('role', 'candidate')
    .neq('id', faniloId)
    .limit(4)

  const extras = candidateProfiles ?? []
  console.log(`Found ${extras.length} extra candidate(s) for group conversations.`)

  // ── 1. DM : Benjamin ↔ Fanilo ─────────────────────────────────────────────
  console.log('\n1. Création DM Benjamin ↔ Fanilo...')
  const dmBF = await createConversation({
    is_group: false,
    created_by: benjaminId,
  })
  await addParticipants(dmBF, [benjaminId, faniloId])
  await sendMessages(dmBF, [
    { sender_id: benjaminId, content: 'Bonjour Fanilo ! Comment avancez-vous sur la formation Personal Branding ?', at: ago(D + H * 4) },
    { sender_id: faniloId,   content: 'Bonjour Benjamin ! Ça avance très bien. J\'ai terminé 80 % du contenu — la partie sur le pitch est vraiment percutante.', at: ago(D + H * 3) },
    { sender_id: benjaminId, content: 'Excellent ! Avez-vous commencé à tester votre pitch en situation réelle ?', at: ago(D + H * 2) },
    { sender_id: faniloId,   content: 'Oui, j\'ai présenté à un de mes contacts et le retour était très positif.', at: ago(D + H) },
    { sender_id: benjaminId, content: 'Parfait. Pour notre prochaine session vendredi, préparez 3 exemples concrets de situations professionnelles.', at: ago(H * 6) },
    { sender_id: faniloId,   content: 'Noté ! J\'ai aussi une question sur le module LinkedIn — le lien vers l\'exercice pratique ne s\'ouvre pas chez moi.', at: ago(H * 3) },
    { sender_id: benjaminId, content: 'Je vérifie ça et je vous renvoie le bon lien d\'ici ce soir.', at: ago(H * 2) },
    { sender_id: faniloId,   content: 'Merci beaucoup, à vendredi !', at: ago(H) },
  ])
  console.log('   ✅ DM Benjamin ↔ Fanilo créé')

  // ── 2. DM : Fanilo ↔ extra candidate 1 ────────────────────────────────────
  if (extras[0]) {
    console.log(`\n2. Création DM Fanilo ↔ ${extras[0].first_name}...`)
    const dmFE = await createConversation({
      is_group: false,
      created_by: faniloId,
    })
    await addParticipants(dmFE, [faniloId, extras[0].id])
    await sendMessages(dmFE, [
      { sender_id: extras[0].id, content: 'Salut Fanilo ! Tu suis quelle formation avec Benjamin en ce moment ?', at: ago(D * 2) },
      { sender_id: faniloId,     content: 'Je fais la formation Personal Branding et la Stratégie 360°. Les deux sont top, je te les recommande !', at: ago(D * 2 - H) },
      { sender_id: extras[0].id, content: 'Super, j\'hésite entre les deux. Tu as un code promo ?', at: ago(D * 2 - H * 2) },
      { sender_id: faniloId,     content: 'La Stratégie 360° est gratuite en ce moment je crois, fonce !', at: ago(D) },
      { sender_id: extras[0].id, content: 'Vraiment ? Je vérifie ça, merci 🙌', at: ago(D - H * 2) },
    ])
    console.log(`   ✅ DM Fanilo ↔ ${extras[0].first_name} créé`)
  }

  // ── 3. DM : Benjamin ↔ extra candidate 2 ─────────────────────────────────
  if (extras[1]) {
    console.log(`\n3. Création DM Benjamin ↔ ${extras[1].first_name}...`)
    const dmBE = await createConversation({
      is_group: false,
      created_by: extras[1].id,
    })
    await addParticipants(dmBE, [benjaminId, extras[1].id])
    await sendMessages(dmBE, [
      { sender_id: extras[1].id, content: 'Bonjour Benjamin, j\'aimerais discuter de mon CV avant de postuler chez Capgemini.', at: ago(D * 4) },
      { sender_id: benjaminId,   content: 'Bien sûr ! Envoyez-moi votre CV via la plateforme et la description du poste, je vous ferai un retour rapide.', at: ago(D * 3 + H * 18) },
      { sender_id: extras[1].id, content: 'C\'est fait, je viens de l\'envoyer. Merci beaucoup !', at: ago(D * 3 + H * 16) },
      { sender_id: benjaminId,   content: 'Bien reçu. Je vous reviens demain matin avec mes observations.', at: ago(D * 3 + H * 14) },
      { sender_id: benjaminId,   content: 'J\'ai regardé votre CV. Le fond est solide mais la mise en page peut être améliorée. Je vous ai laissé des commentaires dans l\'outil CV de la plateforme.', at: ago(D * 2 + H * 10) },
      { sender_id: extras[1].id, content: 'Wow, merci pour le retour détaillé ! Je prends en compte tout ça.', at: ago(D * 2 + H * 8) },
      { sender_id: benjaminId,   content: 'De rien. Revenez vers moi quand c\'est mis à jour et on pourra faire une simulation d\'entretien si vous le souhaitez.', at: ago(D + H * 5) },
    ])
    console.log(`   ✅ DM Benjamin ↔ ${extras[1].first_name} créé`)
  }

  // ── 4. Groupe : Coaching Personal Branding ────────────────────────────────
  const groupParticipants = [benjaminId, faniloId, ...extras.slice(0, 3).map((e) => e.id)]
  if (groupParticipants.length >= 3) {
    console.log('\n4. Création groupe "Coaching Personal Branding"...')
    const groupConv = await createConversation({
      name: 'Coaching Personal Branding 🚀',
      is_group: true,
      created_by: benjaminId,
    })
    await addParticipants(groupConv, groupParticipants)
    await sendMessages(groupConv, [
      { sender_id: benjaminId,        content: 'Bienvenue dans le groupe Coaching Personal Branding ! Ici on partage nos avancées, nos questions et nos ressources 🎯', at: ago(D * 5) },
      { sender_id: faniloId,          content: 'Merci pour l\'invitation ! Ravi de rejoindre ce groupe.', at: ago(D * 5 - MIN * 20) },
      ...(extras[0] ? [{ sender_id: extras[0].id, content: 'Pareil, super initiative !', at: ago(D * 5 - MIN * 15) }] : []),
      { sender_id: benjaminId,        content: 'Pour bien démarrer, je vous recommande de commencer par le module 1 "Définir votre identité professionnelle". Prenez des notes sur vos 3 valeurs fondamentales.', at: ago(D * 4 + H * 3) },
      { sender_id: faniloId,          content: 'Question : est-ce qu\'on fait les exercices en autonomie ou en live ensemble ?', at: ago(D * 3) },
      { sender_id: benjaminId,        content: 'Les deux ! Vous avancez en autonomie sur les modules vidéo, et on applique ensemble lors des ateliers de groupe. Le prochain atelier est jeudi à 18h00.', at: ago(D * 3 - H) },
      ...(extras[1] ? [{ sender_id: extras[1].id, content: 'Parfait. J\'ai une question sur le module 2 — comment on mesure son "impact en ligne" sans gros réseau LinkedIn ?', at: ago(D * 2 + H * 5) }] : []),
      { sender_id: benjaminId,        content: 'Très bonne question ! On part de 0, et c\'est justement l\'objectif de la formation de vous aider à construire votre présence. Regardez l\'exercice pratique à la fin du module 2.', at: ago(D * 2 + H * 4) },
      { sender_id: faniloId,          content: 'Rappel pour tout le monde : Benjamin a partagé des ressources bonus dans la section "Ressources" de la formation. Il y a notamment un template de pitch vraiment utile 🔥', at: ago(D + H * 8) },
      { sender_id: benjaminId,        content: 'Merci Fanilo ! Effectivement, j\'ai ajouté 2 nouvelles ressources ce matin. À jeudi pour notre atelier collectif, préparez un exemple de situation professionnelle que vous souhaitez travailler.', at: ago(H * 4) },
      ...(extras[0] ? [{ sender_id: extras[0].id, content: 'Noté, à jeudi !', at: ago(H * 2) }] : []),
      { sender_id: faniloId,          content: 'À jeudi Benjamin et tout le monde ! 💪', at: ago(H) },
    ])
    console.log('   ✅ Groupe "Personal Branding" créé')
  }

  // ── 5. Groupe : Questions & Réponses formation ────────────────────────────
  const qaParticipants = [benjaminId, ...extras.slice(0, 4).map((e) => e.id)]
  if (qaParticipants.length >= 3) {
    console.log('\n5. Création groupe "Q&R Formations BNJ"...')
    const qaConv = await createConversation({
      name: 'Q&R Formations BNJ 💡',
      is_group: true,
      created_by: benjaminId,
    })
    await addParticipants(qaConv, qaParticipants)
    await sendMessages(qaConv, [
      { sender_id: benjaminId,  content: 'Groupe dédié aux questions sur les formations. Posez vos questions ici, je réponds sous 24h !', at: ago(D * 7) },
      ...(extras[0] ? [{ sender_id: extras[0].id, content: 'Est-ce que les formations sont accessibles à vie ou y a-t-il une date d\'expiration ?', at: ago(D * 6) }] : []),
      { sender_id: benjaminId,  content: 'À vie pour toutes les formations que vous avez achetées ou rejointes ! Vous pouvez revenir sur les modules à tout moment.', at: ago(D * 6 - H * 2) },
      ...(extras[1] ? [{ sender_id: extras[1].id, content: 'Les certificats sont-ils reconnus par les employeurs ?', at: ago(D * 4) }] : []),
      { sender_id: benjaminId,  content: 'Les certificats BNJ attestent de la complétion de la formation et peuvent être ajoutés à votre profil LinkedIn ou CV. Ils sont de plus en plus reconnus dans les secteurs tech et consulting.', at: ago(D * 4 - H * 3) },
      ...(extras[2] ? [{ sender_id: extras[2].id, content: 'Y a-t-il des formations sur la reconversion professionnelle ?', at: ago(D * 2 + H * 6) }] : []),
      { sender_id: benjaminId,  content: 'Absolument ! La formation "Stratégie 360°" est parfaite pour ça. Elle couvre le bilan de compétences, la définition d\'un nouveau projet pro, et la stratégie de transition. Je l\'ai justement retravaillée ce mois-ci.', at: ago(D * 2 + H * 4) },
    ])
    console.log('   ✅ Groupe "Q&R Formations BNJ" créé')
  }

  console.log('\n🎉 Messaging seed terminé !\n')
  console.log('💡 Conseil : si les champs is_group / name / created_by n\'apparaissent pas,')
  console.log('   exécutez d\'abord la migration SQL dans votre dashboard Supabase :')
  console.log('   prisma/migrations/20260511_messaging_system.sql\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
