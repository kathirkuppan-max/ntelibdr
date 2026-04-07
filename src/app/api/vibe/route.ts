import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const KEY = process.env.VIBE_API_KEY
  if (!KEY) return NextResponse.json({ error: 'VIBE_API_KEY not set' }, { status: 500 })

  try {
    const { action, payload = {} } = await req.json()
    const urls: Record<string, string> = {
      'fetch-businesses': 'https://api.explorium.ai/v1/businesses',
      'fetch-prospects': 'https://api.explorium.ai/v1/prospects',
      'enrich-prospects': 'https://api.explorium.ai/v1/prospects/enrich',
      'business-events': 'https://api.explorium.ai/v1/businesses/events',
      'match-business': 'https://api.explorium.ai/v1/businesses/match',
    }
    if (!urls[action]) return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })

    const r = await fetch(urls[action], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': KEY,
        'API_KEY': KEY,
        'Authorization': 'Bearer ' + KEY,
      },
      body: JSON.stringify(payload),
    })
    const data = await r.json()
    return NextResponse.json(data, { status: r.ok ? 200 : r.status })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
