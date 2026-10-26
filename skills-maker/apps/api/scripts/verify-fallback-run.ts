// ─────────────────────────────────────────────────────────────────────────────
// Manual end-to-end proof that the pipeline NEVER dead-ends (skill §26).
//
// It drives the REAL `runApplicationPipeline` with the LLM forced down (no API
// keys), so the engine's own fallback path runs — scoreJobOffer throws → the
// deterministic heuristic scores every job → eligible jobs get prepared and
// flagged for review. No database, no network: discovery, persistence, contact
// resolution and letter generation are injected in-memory.
//
//   node --import tsx scripts/verify-fallback-run.ts
//
// Expected: at least one COMPLETED run with prepared >= 1 — the exact opposite of
// the "48 correspondantes · 0 préparées" the candidate kept seeing.
// ─────────────────────────────────────────────────────────────────────────────

import assert from 'node:assert/strict'

// ── Force "LLM down" BEFORE anything loads config/env ──────────────────────────
// dotenv never overwrites a var that is already set, so emptying the keys here wins
// over whatever the local .env holds. callLLM() then throws immediately, with no
// network call, which is exactly the degraded state we want to prove we survive.
process.env.GROQ_API_KEY = ''
process.env.GROQ_API_KEY_2 = ''
process.env.OPENROUTER_API_KEY = ''
process.env.LLM_PROVIDER = ''
// env.ts refuses to boot without these; give it valid throwaway values (no DB is opened).
process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/verify'
process.env.JWT_SECRET ??= 'verify-secret-0123456789'

type NormalizedJob = import('../src/lib/jobs/types.js').NormalizedJob
type AutomationStore = import('../src/lib/automation/store.js').AutomationStore
type ContactResolution = import('../src/lib/enrichment/resolveContact.js').ContactResolution
type AutomationSettingsRow = Parameters<
  typeof import('../src/lib/automation/constants.js').resolveAutomationSettings
>[0]

async function main() {
  // Dynamic imports so the env assignments above run first (ESM hoists static imports).
  const { runApplicationPipeline } = await import('../src/lib/automation/engine.js')
  const { canonicalJobKey } = await import('../src/lib/jobs/canonical.js')
  const { resolveAutomationSettings } = await import('../src/lib/automation/constants.js')

  // ── A candidate CV with real developer vocabulary ────────────────────────────
  const cv = {
    extractedData: {
      titles: ['Développeur Full-Stack'],
      skills: ['React', 'TypeScript', 'Node', 'GraphQL', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'Jest'],
      summary: 'Développeur full-stack JavaScript, frontend React et backend Node, microservices et API REST.',
    },
    profile: null,
  }

  // ── Offers: relevant dev roles, irrelevant roles, a duplicate, one already-applied ──
  let seq = 0
  const makeJob = (over: Partial<NormalizedJob>): NormalizedJob => {
    seq += 1
    return {
      id: `src-${seq}`,
      source: 'FRANCE_TRAVAIL',
      title: '',
      company: null,
      location: 'Paris',
      description: '',
      applyUrl: `https://example.test/offer-${seq}`,
      postedAt: null,
      salary: null,
      tags: [],
      isRemote: false,
      ...over,
    }
  }

  // 6+ shared meaningful tokens → heuristic ~70 (>= the default 65 threshold).
  const relevantDesc = 'Stack React, TypeScript, Node, GraphQL et PostgreSQL. Déploiement Docker.'
  const relevant: NormalizedJob[] = Array.from({ length: 8 }, (_, i) =>
    makeJob({
      title: `Développeur React TypeScript #${i + 1}`,
      company: `TechCorp ${i + 1}`,
      description: relevantDesc,
      tags: ['CDI'],
    }),
  )
  const irrelevant: NormalizedJob[] = [
    makeJob({ title: 'Boulanger', company: 'Fournil', description: 'Pétrissage, cuisson du pain en fournil traditionnel.' }),
    makeJob({ title: 'Jardinier paysagiste', company: 'VertJardin', description: 'Entretien des espaces verts, tonte, taille des haies.' }),
  ]
  // A verbatim duplicate of the first relevant offer (same apply URL) — must be de-duped.
  const duplicate = makeJob({ ...relevant[0], id: 'src-dup' })
  const allJobs = [...relevant, ...irrelevant, duplicate]

  // The candidate already applied to relevant #8 — its canonical key is marked applied below.
  const alreadyAppliedKey = canonicalJobKey(relevant[7])

  // ── In-memory store: records what the engine would persist ───────────────────
  const makeStore = (sentToday: number): { store: AutomationStore; events: Record<string, unknown>[] } => {
    const events: Record<string, unknown>[] = []
    const store: AutomationStore = {
      async findApplied(_candidateId, keys) {
        const map = new Map<string, { applicationId: string; stage: string | null }>()
        for (const key of keys) {
          if (key === alreadyAppliedKey) map.set(key, { applicationId: 'app-existing', stage: 'SENT' })
        }
        return map
      },
      async countPreparedSince() {
        return sentToday
      },
      async savePrepared(input) {
        const short = input.job.canonicalKey.slice(0, 8)
        return { applicationId: `app-${short}`, jobOfferId: `job-${short}`, created: true }
      },
      async saveContact() {},
      async recordEvent(applicationId, type, metadata) {
        events.push({ applicationId, type, ...metadata })
      },
    }
    return { store, events }
  }

  // Verified recruiter contact — proves prepared rows carry a usable address.
  const resolveContact = async (): Promise<ContactResolution> => {
    const best = { email: 'recrutement@techcorp.example', contactName: 'RH', source: 'SITE' as const, confidence: 'VERIFIED' as const }
    return { verified: [best], guessed: [], failures: [], best }
  }
  // Deterministic template letter — no LLM.
  const generateLetter = async () => ({ content: 'Madame, Monsieur, …', model: 'template:fallback', degraded: true })

  const baseRow: NonNullable<AutomationSettingsRow> = {
    enabled: true,
    frequency: 'WEEKLY',
    maxApplicationsPerRun: 5,
    maxApplicationsPerDay: 10,
    minMatchScore: 65,
    approvalMode: true,
    keywords: ['React', 'TypeScript'],
    locations: ['Paris'],
    contractTypes: ['PERMANENT'],
  }

  const runScenario = async (label: string, sentToday: number) => {
    const settings = resolveAutomationSettings(baseRow)
    const { store, events } = makeStore(sentToday)

    const provider = {
      id: 'FRANCE_TRAVAIL' as const,
      isConfigured: () => true,
      supportedFilters: ['CONTRACT_TYPE' as const],
      search: async () => ({ jobs: allJobs, total: allJobs.length }),
    }

    const outcome = await runApplicationPipeline(
      { candidateId: 'cand-1', settings, cv, language: 'fr' },
      {
        store,
        providers: [provider],
        // Let the REAL default matcher run so the engine's own LLM→heuristic fallback is exercised.
        resolveContact,
        generateLetter,
        pacer: async () => {},
        runId: 'run-verify',
      },
    )

    const byReason = outcome.skipped.reduce<Record<string, number>>((acc, s) => {
      const key = s.detail ? `${s.reason}:${s.detail}` : s.reason
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

    const status = outcome.failures.length > 0 ? 'PARTIAL' : 'COMPLETED'
    console.log(`\n═══ ${label} ═══`)
    console.log(`  settings appliqués : run=${settings.maxApplicationsPerRun}/jour=${settings.maxApplicationsPerDay} · minMatchScore=${settings.minMatchScore} · déjà préparées aujourd'hui=${sentToday}`)
    console.log(`  filtres candidat   : keywords=${JSON.stringify(settings.keywords)} · locations=${JSON.stringify(settings.locations)} · contractTypes=${JSON.stringify(settings.contractTypes)}`)
    console.log('  ── entonnoir ──')
    console.log(`  trouvées       : ${outcome.discovered.length}`)
    console.log(`  dédupliquées   : ${outcome.deduplicated.length} (doublons retirés: ${outcome.duplicatesRemoved})`)
    console.log(`  correspondantes: ${outcome.matched.length}`)
    console.log(`  PRÉPARÉES      : ${outcome.prepared.length}`)
    console.log(`  écartées       : ${outcome.skipped.length} → ${JSON.stringify(byReason)}`)
    console.log(`  échecs sources : ${outcome.failures.length}`)
    console.log(`  → statut run   : ${status}`)
    if (outcome.prepared.length > 0) {
      const p = outcome.prepared[0]
      console.log(`  exemple préparé: "${p.job.title}" score=${p.matchScore} contact=${p.contact?.email ?? '∅'} needsReview=${p.needsReview}`)
    }
    const sources = events.filter((e) => e.type === 'APPLICATION_PREPARED').map((e) => e.matchSource)
    console.log(`  matchSource des préparées: ${JSON.stringify(sources)}`)

    return { outcome, events, status }
  }

  // ── Scenario 1: fresh day — run cap (5) is the binding limit ──────────────────
  const a = await runScenario('Scénario 1 — journée fraîche (LLM en panne)', 0)
  assert.ok(a.outcome.prepared.length >= 1, 'AU MOINS 1 candidature doit être préparée')
  assert.equal(a.outcome.prepared.length, 5, 'le plafond par run (5) doit être respecté')
  assert.equal(a.outcome.duplicatesRemoved, 1, 'le doublon doit être retiré')
  assert.ok(
    a.outcome.skipped.some((s) => s.reason === 'ALREADY_APPLIED'),
    'la candidature déjà envoyée doit être écartée (ALREADY_APPLIED)',
  )
  assert.ok(
    a.outcome.skipped.some((s) => s.reason === 'MATCH_TOO_LOW'),
    'les offres hors-sujet doivent être écartées (MATCH_TOO_LOW)',
  )
  assert.ok(
    a.outcome.skipped.some((s) => s.reason === 'SKIPPED' && s.detail === 'budget'),
    'le surplus au-delà du budget doit être écarté (budget)',
  )
  assert.equal(a.status, 'COMPLETED', 'le run ne doit PAS être PARTIAL — le fallback n’est pas un échec')
  assert.ok(
    a.outcome.prepared.every((p) => p.needsReview === true),
    'une candidature scorée par heuristique doit être marquée needsReview',
  )
  assert.ok(
    a.events.filter((e) => e.type === 'APPLICATION_PREPARED').every((e) => e.matchSource === 'HEURISTIC'),
    'les préparées via fallback doivent être taguées matchSource=HEURISTIC',
  )

  // ── Scenario 2: near the daily ceiling — the day cap (10) now binds ───────────
  const b = await runScenario('Scénario 2 — proche du plafond quotidien (9/10 déjà faites)', 9)
  assert.equal(b.outcome.prepared.length, 1, 'avec 9/10 déjà préparées, le budget du jour n’autorise plus qu’1')
  assert.equal(b.status, 'COMPLETED', 'le run reste COMPLETED')

  console.log('\n✅ Preuve OK : la fonctionnalité produit des runs COMPLETED avec des candidatures préparées,')
  console.log('   même LLM en panne, et respecte strictement les plafonds par run / par jour du candidat.')
}

main().catch((err) => {
  console.error('\n❌ Échec de la preuve :', err)
  process.exit(1)
})
