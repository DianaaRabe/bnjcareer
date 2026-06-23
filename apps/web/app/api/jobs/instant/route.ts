// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jobs/instant
//
// Returns random placeholder/preview job offers from pre-downloaded Apify runs.
// Shown on the /scrapper page before the user runs an actual search.
// Category (tech / non-tech) is inferred from profiles.industry.
//
// Returns a fresh random selection on every call — no caching.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { loadPlaceholderJobs } from "@/lib/jobs/runsLoader"
import { isTechIndustry } from "@/lib/jobs/categoryMatcher"

// Cannot use Edge runtime here because we read from the filesystem (runs/ JSON).
export const runtime = "nodejs"

// Force Next.js to treat this route as dynamic (never cache the response)
export const dynamic = "force-dynamic"

export async function GET() {
  let category: "tech" | "non-tech" = "non-tech"

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("industry")
        .eq("id", user.id)
        .single()

      if (isTechIndustry(profile?.industry)) {
        category = "tech"
      }
    }
  } catch (err) {
    // Auth or DB failure → still serve non-tech placeholders, never block UI.
    console.warn("[jobs/instant] profile lookup failed, defaulting to non-tech:", err)
  }

  // Serve 12 random offers (was 5) for more variety
  const jobs = loadPlaceholderJobs(category, 12)
  return NextResponse.json(
    { jobs, category, count: jobs.length },
    {
      headers: {
        // Never cache — each request gets a fresh random selection
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  )
}
