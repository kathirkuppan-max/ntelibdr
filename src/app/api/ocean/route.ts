import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.OCEAN_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'OCEAN_API_KEY not configured' }, { status: 500 })

  try {
    const { endpoint, body } = await req.json()
    if (!endpoint || !body) return NextResponse.json({ error: 'Missing endpoint or body' }, { status: 400 })

    const url = `https://api.ocean.io/${endpoint}`
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-token': apiKey },
      body: JSON.stringify(body),
    })
    const data = await upstream.json()
    if (!upstream.ok) {
      return NextResponse.json({
        error: data?.detail || data?.message || data?.error || `Ocean.io HTTP ${upstream.status}`,
        upstream_body: data,
      }, { status: upstream.status })
    }
    return NextResponse.json(data)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
