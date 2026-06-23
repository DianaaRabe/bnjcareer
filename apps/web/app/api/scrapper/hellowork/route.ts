import { NextResponse } from 'next/server'

const ACTOR_ID = '3wmy1nLYOHocecwCj'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      keywords,
      location,
      period    = '7d',       // last week
      distance  = '20',       // km
      sort_by   = 'relevance',
      limit     = 30,
      contract,               // optional array of contract types (CDI, CDD, Stage…)
    } = body

    const token = process.env.APIFY_API_TOKEN_HELLOWORK
    if (!token) {
      return NextResponse.json({ error: 'APIFY_API_TOKEN_HELLOWORK manquant dans .env' }, { status: 500 })
    }

    const input: Record<string, unknown> = {
      sort_by,
      keywords: keywords || 'Développeur',
      location: location || 'Paris',
      distance: String(distance),
      period,
      limit: Math.min(Number(limit) || 30, 100),
    }
    // Only include the contract filter when the user selected at least one type
    if (Array.isArray(contract) && contract.length > 0) {
      input.contract = contract
    }

    const url = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Apify HelloWork error: ${errText}`)
    }

    const raw: any[] = await response.json()

    // Normalize to a common job shape
    const items = raw.map((item) => ({
      id:              String(item.job_id ?? item.link ?? Math.random()),
      source:          'hellowork' as const,
      title:           item.job_title        ?? 'Poste non spécifié',
      companyName:     item.company          ?? 'Entreprise inconnue',
      location:        item.location         ?? item.city ?? '',
      salary:          item.salary           ?? null,
      contractType:    item.contract         ?? null,
      experienceLevel: item.experiences      ?? null,
      sector:          item.industries       ?? null,
      remote:          item.remote           ?? null,
      jobUrl:          item.link             ?? '',
      applyUrl:        item.link             ?? '',
      postedDate:      item.extraction_date  ? item.extraction_date.split('T')[0] : null,
      postedTimeAgo:   item.time             ?? null,
      duration:        item.duration         ?? null,
      descriptionText: item.description
        ? item.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        : '',
      descriptionHtml: item.description     ?? '',
      companyLogo:     item.company_logo    ?? null,
      department:      item.department      ?? null,
    }))

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('[scrapper/hellowork]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
