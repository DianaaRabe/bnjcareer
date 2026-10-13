// ─────────────────────────────────────────────────────────────────────────────
// Pre-downloaded Apify runs — instant content before the user searches.
//
// Ported from apps/web/lib/jobs/runsLoader.ts. Same rationale as the legacy
// app: "saves an Apify call per page load and gives us instant content".
// Datasets live in apps/api/data/runs/{tech,non-tech}/.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs'
import path from 'node:path'
import { env } from '@/config/env.js'
import { NORMALIZERS } from './apifyNormalizers.js'
import { JOB_SOURCE, type JobSourceId, type NormalizedJob } from './types.js'

/** Relative to the API working directory, like UPLOAD_DIR. */
const RUNS_ROOT = env.JOBS_RUNS_DIR

/** Dataset filenames carry their scraper name — that is how a file maps to a source. */
const FILE_MARKERS: { marker: string; source: JobSourceId }[] = [
  { marker: 'indeed-scraper', source: JOB_SOURCE.indeed },
  { marker: 'linkedin-jobs-scraper', source: JOB_SOURCE.linkedin },
  { marker: 'hellowork-jobs-scraper', source: JOB_SOURCE.hellowork },
]

// Static files: read once per process.
let cache: NormalizedJob[] | null = null

function readJsonArray(filePath: string): Record<string, unknown>[] {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : []
  } catch (error) {
    console.warn(`[jobs] unreadable run dataset ${filePath}:`, error)
    return []
  }
}

function loadAll(): NormalizedJob[] {
  if (cache) return cache

  const jobs: NormalizedJob[] = []
  for (const category of ['tech', 'non-tech']) {
    const dir = path.join(RUNS_ROOT, category)
    let files: string[] = []
    try {
      files = fs.readdirSync(dir)
    } catch {
      continue
    }

    for (const file of files.filter((name) => name.endsWith('.json'))) {
      const source = FILE_MARKERS.find(({ marker }) => file.includes(marker))?.source
      if (!source) continue
      jobs.push(...readJsonArray(path.join(dir, file)).map(NORMALIZERS[source]))
    }
  }

  // Runs overlap across categories — keep one offer per title+company.
  const seen = new Set<string>()
  cache = jobs.filter((job) => {
    const key = `${job.title}|${job.company}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return cache
}

/** Fisher-Yates — a fresh selection on every page load. */
function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/** `total` is the whole local stock for that source, not the returned page. */
export function loadPreviewJobs(source: JobSourceId, limit: number) {
  const available = loadAll().filter((job) => job.source === source)
  return { jobs: shuffle(available).slice(0, limit), total: available.length }
}
