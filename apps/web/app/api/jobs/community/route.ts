// Public API — community tenant jobs (read-only for candidates)
import { NextRequest, NextResponse } from 'next/server'
import { getJobProvider } from '@/lib/jobs/factory'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const provider = getJobProvider('local-db')
    const result = await provider.search({
      keywords: searchParams.get('keywords') ?? undefined,
      location: searchParams.get('location') ?? undefined,
      limit:    Number(searchParams.get('limit') ?? 50),
    })
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ items: [], error: err.message }, { status: 500 })
  }
}
