// ─────────────────────────────────────────────────────────────────────────────
// Loads pre-downloaded Apify run JSONs from /runs/{tech,non-tech} and
// normalizes them to the shape used by the scrapper UI.
//
// Used to show "preview" / placeholder offers on /scrapper before the user
// triggers a real Apify search. Saves an Apify call per page load and gives
// us instant content for demos.
// ─────────────────────────────────────────────────────────────────────────────

import fs from "fs"
import path from "path"

export type Source = "indeed" | "linkedin" | "hellowork"

/** Shape mirrors NormalizedJob in MultiSourceScrapper.tsx — kept compatible. */
export interface PlaceholderJob {
  id: string
  source: Source
  title: string
  companyName: string
  location: string
  salary: string | null
  contractType: string | null
  experienceLevel: string | null
  sector: string | null
  remote: string | null
  jobUrl: string
  applyUrl: string | null
  postedDate: string | null
  postedTimeAgo: string | null
  descriptionText: string
  companyLogo: string | null
  recruiterName: string | null
  applicationsCount: string | null
  duration: string | null
}

// ── Per-source normalizers ───────────────────────────────────────────────────

function normalizeIndeed(item: any): PlaceholderJob {
  const location =
    typeof item.location === "object"
      ? item.location?.formattedAddressShort ??
        item.location?.city ??
        item.location?.fullAddress ??
        ""
      : item.location ?? ""

  return {
    id: String(item.id ?? `${item.title}-${item.companyName}-${Math.random()}`),
    source: "indeed",
    title: item.title ?? "Poste",
    companyName: item.companyName ?? "Entreprise",
    location,
    salary:
      item.salary && typeof item.salary === "object"
        ? item.salary.salaryText ?? null
        : item.salary ?? null,
    contractType: Array.isArray(item.jobType)
      ? item.jobType[0] ?? null
      : item.jobType ?? null,
    experienceLevel: null,
    sector: null,
    remote:
      Array.isArray(item.jobType) && item.jobType.includes("Télétravail")
        ? "Télétravail"
        : null,
    jobUrl: item.url ?? item.jobUrl ?? "#",
    applyUrl: item.applyUrl ?? item.url ?? item.jobUrl ?? null,
    postedDate: item.datePublished ?? null,
    postedTimeAgo: item.age ?? null,
    descriptionText: (item.descriptionText ?? "").slice(0, 600),
    companyLogo: null,
    recruiterName: null,
    applicationsCount: null,
    duration: null,
  }
}

function normalizeLinkedIn(item: any): PlaceholderJob {
  return {
    id: String(item.id ?? item.url ?? Math.random()),
    source: "linkedin",
    title: item.title ?? "Poste",
    companyName: item.companyName ?? "Entreprise",
    location: item.location ?? "",
    salary: item.salary || null,
    contractType: item.contractType ?? null,
    experienceLevel: item.experienceLevel ?? null,
    sector: item.sector ?? null,
    remote: item.workType ?? null,
    jobUrl: item.url ?? "#",
    applyUrl: item.applyUrl || item.url || null,
    postedDate: item.postedDate ?? null,
    postedTimeAgo: item.postedTimeAgo ?? null,
    descriptionText: (item.description ?? "").slice(0, 600),
    companyLogo: null,
    recruiterName: item.recruiterName || null,
    applicationsCount: item.applicationsCount || null,
    duration: null,
  }
}

function normalizeHelloWork(item: any): PlaceholderJob {
  const description = item.description
    ? item.description
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 600)
    : ""
  return {
    id: String(item.job_id ?? item.link ?? Math.random()),
    source: "hellowork",
    title: item.job_title ?? "Poste",
    companyName: item.company ?? "Entreprise",
    location: item.location ?? "",
    salary: item.salary ?? null,
    contractType: item.contract ?? null,
    experienceLevel: null,
    sector: null,
    remote: item.remote ?? null,
    jobUrl: item.link ?? "#",
    applyUrl: item.link ?? null,
    postedDate: item.publication_date ?? null,
    postedTimeAgo: item.time ?? null,
    descriptionText: description,
    companyLogo: item.company_logo ?? null,
    recruiterName: null,
    applicationsCount: null,
    duration: item.duration ?? null,
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function readJsonArray(filePath: string): any[] {
  try {
    const raw = fs.readFileSync(filePath, "utf8")
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.warn(`[runsLoader] Failed to read ${filePath}:`, err)
    return []
  }
}

/** Fisher-Yates shuffle, returns a new array. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

// ── Main entry ───────────────────────────────────────────────────────────────

// In-memory cache: read JSON files once per process, not on every request.
// The data is static (pre-downloaded runs) so caching is safe.
const _cache: Record<string, PlaceholderJob[]> = {}

function loadAll(category: "tech" | "non-tech"): PlaceholderJob[] {
  if (_cache[category]) return _cache[category]

  const runsDir = path.join(process.cwd(), "runs", category)

  let files: string[] = []
  try {
    files = fs.readdirSync(runsDir)
  } catch {
    console.warn(`[runsLoader] No runs directory found for ${category}`)
    _cache[category] = []
    return []
  }

  const all: PlaceholderJob[] = []

  for (const file of files) {
    if (!file.endsWith(".json")) continue
    const fullPath = path.join(runsDir, file)
    const items = readJsonArray(fullPath)

    if (file.includes("indeed-scraper")) {
      all.push(...items.map(normalizeIndeed))
    } else if (file.includes("linkedin-jobs-scraper")) {
      all.push(...items.map(normalizeLinkedIn))
    } else if (file.includes("hellowork-jobs-scraper")) {
      all.push(...items.map(normalizeHelloWork))
    }
  }

  // Deduplicate by title+company (some runs have overlapping offers)
  const seen = new Set<string>()
  const deduped = all.filter((j) => {
    const key = `${j.title}|${j.companyName}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  console.log(`[runsLoader] ${category}: ${deduped.length} offres uniques chargées`)
  _cache[category] = deduped
  return deduped
}

/**
 * Loads `count` random placeholder jobs from /runs/{category}, mixing all 3
 * sources so the user sees variety. Returns a FRESH random selection on each
 * call (Fisher-Yates shuffle). Returns [] if the folder is missing or empty.
 */
export function loadPlaceholderJobs(
  category: "tech" | "non-tech",
  count = 12,
): PlaceholderJob[] {
  const all = loadAll(category)
  if (all.length === 0) return []

  // Bucket by source to ensure diversity
  const bySource: Record<Source, PlaceholderJob[]> = {
    indeed: all.filter((j) => j.source === "indeed"),
    linkedin: all.filter((j) => j.source === "linkedin"),
    hellowork: all.filter((j) => j.source === "hellowork"),
  }

  // Take ~equal share from each source, then shuffle the final mix
  const perSource = Math.ceil(count / 3)
  const mix = [
    ...pickRandom(bySource.indeed, perSource),
    ...pickRandom(bySource.linkedin, perSource),
    ...pickRandom(bySource.hellowork, perSource),
  ]

  return shuffle(mix).slice(0, count)
}
