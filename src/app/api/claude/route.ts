import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const KEY = process.env.ANTHROPIC_API_KEY
  if (!KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })

  try {
    const body = await req.json()
    const stream = body.stream === true

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    if (stream) {
      return new NextResponse(upstream.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      })
    }

    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.ok ? 200 : upstream.status })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
