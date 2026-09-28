// ─────────────────────────────────────────────────────────────
// Single source of truth for every row a dev-phase seed inserts.
//
// Each seed keys its rows off the generators/emails below, and the teardown
// script (`prisma/seed-teardown.ts`) removes exactly those rows — so seeds and
// their removal can never drift. When you add a new seed, register its ids and
// emails HERE first; never inline a literal seed id in a seed file.
//
// The fixed-uuid prefixes are deliberately per-domain so a prefix match reaches
// "every row this generator could ever produce" without knowing how many exist.
// ─────────────────────────────────────────────────────────────

const uuid = (prefix: string, n: number) => `${prefix}${String(n).padStart(12, '0')}`

/** Row-id generators — used by the seeds to write, mirrored by teardown to delete. */
export const seedId = {
  resource: (n: number) => uuid('d0000000-0000-4000-8000-', n),
  coach: (n: number) => uuid('c0000000-0000-4000-8000-', n),
  training: (n: number) => uuid('b0000000-0000-4000-8000-', n),
  coaching: {
    offer: (n: number) => `a0000000-0000-4000-8000-00000000000${n}`,
    application: (n: number) => `a1000000-0000-4000-8000-00000000000${n}`,
    match: 'a2000000-0000-4000-8000-000000000001',
    event: (n: number) => `a3000000-0000-4000-8000-00000000000${n}`,
    booking: (n: number) => `a4000000-0000-4000-8000-00000000000${n}`,
  },
  coachCandidate: (kind: string, slug: string) => `seed-coach-candidates-${kind}-${slug}`,
} as const

/**
 * Id prefixes for teardown's `startsWith` matches. Grouped by the table they
 * target so removal can walk foreign keys in a safe order.
 */
export const seedIdPrefix = {
  resource: 'd0000000-0000-4000-8000-',
  coach: 'c0000000-0000-4000-8000-',
  training: 'b0000000-0000-4000-8000-',
  coachingOffer: 'a0000000-0000-4000-8000-',
  coachingApplication: 'a1000000-0000-4000-8000-',
  coachingMatch: 'a2000000-0000-4000-8000-',
  coachingEvent: 'a3000000-0000-4000-8000-',
  coachingBooking: 'a4000000-0000-4000-8000-',
  // Every coach-candidate row (users, offers, applications, events, bookings, goals)
  // shares this string-id prefix regardless of kind.
  coachCandidate: 'seed-coach-candidates-',
} as const

/** Accounts created by seeds. Ids vary (generated or fixed), so match on email. */
export const seedEmails = {
  // Core login accounts (seed.ts). Kept by default at teardown — removing the
  // logins would break the demo — unless REMOVE_BASE_USERS=yes is set.
  base: ['candidat@test.dev', 'coach@test.dev', 'admin@test.dev'],
  // Directory coaches (seed-coaches.ts).
  coaches: [
    'thomas.dubois@bnj.dev',
    'harena.rabenandrasana@bnj.dev',
    'benjamin.parienty@bnj.dev',
    'camille.lerouge@bnj.dev',
  ],
  // Coach's candidate roster (seed-coach-candidates.ts) all use this domain.
  coachCandidateDomain: '@seed.dev',
} as const
