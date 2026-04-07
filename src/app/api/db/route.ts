import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return handleRequest(req)
}

export async function POST(req: NextRequest) {
  return handleRequest(req)
}

async function handleRequest(req: NextRequest) {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!DATABASE_URL) return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 })

  const sql = neon(DATABASE_URL)
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || (req.method === 'POST' ? (await req.json().catch(() => ({}))).action : null)
  let body: Record<string, unknown> = {}
  if (req.method === 'POST') {
    try { body = await req.json() } catch { body = {} }
  }

  if (action === 'setup') {
    try {
      await sql`CREATE TABLE IF NOT EXISTS accounts (id SERIAL PRIMARY KEY, account_id INTEGER UNIQUE NOT NULL, data JSONB NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`
      await sql`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMP DEFAULT NOW())`
      await sql`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`
      return NextResponse.json({ success: true, message: 'Tables created' })
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }

  if (action === 'load') {
    try {
      const accounts = await sql`SELECT data FROM accounts ORDER BY account_id`
      const events = await sql`SELECT data FROM events ORDER BY created_at`
      const settings = await sql`SELECT key, value FROM settings`
      return NextResponse.json({
        accounts: accounts.map(r => r.data),
        events: events.map(r => r.data),
        settings: Object.fromEntries(settings.map(r => [r.key, r.value])),
      })
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }

  if (action === 'save-accounts') {
    const { accounts } = body as { accounts: Array<{ id: number }> }
    if (!accounts?.length) return NextResponse.json({ error: 'accounts array required' }, { status: 400 })
    try {
      await sql`DELETE FROM accounts`
      for (const acct of accounts) {
        await sql`INSERT INTO accounts (account_id, data) VALUES (${acct.id}, ${JSON.stringify(acct)})`
      }
      return NextResponse.json({ success: true, count: accounts.length })
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }

  if (action === 'save-account') {
    const { account } = body as { account: { id: number } }
    if (!account?.id) return NextResponse.json({ error: 'account with id required' }, { status: 400 })
    try {
      await sql`INSERT INTO accounts (account_id, data, updated_at) VALUES (${account.id}, ${JSON.stringify(account)}, NOW()) ON CONFLICT (account_id) DO UPDATE SET data = ${JSON.stringify(account)}, updated_at = NOW()`
      return NextResponse.json({ success: true })
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }

  if (action === 'save-events') {
    const { events } = body as { events: Array<{ id: string }> }
    if (!events?.length) return NextResponse.json({ error: 'events array required' }, { status: 400 })
    try {
      await sql`DELETE FROM events`
      for (const evt of events) {
        await sql`INSERT INTO events (id, data) VALUES (${evt.id}, ${JSON.stringify(evt)})`
      }
      return NextResponse.json({ success: true, count: events.length })
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }

  if (action === 'save-settings') {
    const { settings } = body as { settings: Record<string, string> }
    if (!settings) return NextResponse.json({ error: 'settings object required' }, { status: 400 })
    try {
      for (const [key, value] of Object.entries(settings)) {
        await sql`INSERT INTO settings (key, value) VALUES (${key}, ${String(value)}) ON CONFLICT (key) DO UPDATE SET value = ${String(value)}`
      }
      return NextResponse.json({ success: true })
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
