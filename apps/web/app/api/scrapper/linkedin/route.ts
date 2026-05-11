import { NextResponse } from 'next/server'

const ACTOR_ID = 'RIGGeqD6RqKmlVoQU'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      title,
      location,
      datePosted   = 'r604800',   // last week by default
      contractType = [],          // [] = all
      experienceLevel = [],       // [] = all
      remote = [],                // [] = all
      limit  = 25,
    } = body

    const token = process.env.APIFY_API_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'APIFY_API_TOKEN manquant dans .env' }, { status: 500 })
    }

    const input: Record<string, unknown> = {
      title:    title    || 'Développeur',
      location: location || 'France',
      datePosted,
      limit: Math.min(Number(limit) || 25, 50),
    }

    if (contractType.length)    input.contractType    = contractType
    if (experienceLevel.length) input.experienceLevel = experienceLevel
    if (remote.length)          input.remote          = remote

    const url = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Apify LinkedIn error: ${errText}`)
    }

    const raw: any[] = await response.json()

    // Normalize to a common job shape
    const items = raw.map((item) => ({
      id:               item.id ?? item.url,
      source:           'linkedin' as const,
      title:            item.title            ?? 'Poste non spécifié',
      companyName:      item.companyName       ?? 'Entreprise inconnue',
      location:         item.location          ?? '',
      salary:           item.salary            ?? null,
      contractType:     item.contractType      ?? null,
      experienceLevel:  item.experienceLevel   ?? null,
      sector:           item.sector            ?? null,
      remote:           item.workType          ?? null,
      jobUrl:           item.url               ?? '',
      applyUrl:         item.applyUrl          ?? item.url ?? '',
      postedDate:       item.postedDate        ?? null,
      applicationsCount: item.applicationsCount ?? null,
      descriptionText:  item.description       ?? '',
      recruiterName:    item.recruiterName     ?? null,
    }))

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('[scrapper/linkedin]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
