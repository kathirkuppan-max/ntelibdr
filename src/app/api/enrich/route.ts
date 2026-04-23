// Background ICP enrichment endpoint
// Triggered by: (1) Vercel Cron daily, (2) manual "Run now" from Enrichment page
// Auth: Bearer CRON_SECRET

import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { evaluateIcp, candidateToAccount, type IcpCandidate, type EnrichmentRun } from '@/lib/icp-filter'
import type { Account, Contact } from '@/lib/types'

export const maxDuration = 60

async function runEnrichment(): Promise<EnrichmentRun> {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!DATABASE_URL) throw new Error('DATABASE_URL not configured')
  const VIBE_KEY = process.env.VIBE_API_KEY
  if (!VIBE_KEY) throw new Error('VIBE_API_KEY not configured')

  const sql = neon(DATABASE_URL)
  const existingRows = await sql`SELECT data FROM accounts`
  const existing: Account[] = existingRows.map(r => r.data as Account)
  const existingDomains = new Set(existing.map(a => (a.website || '').toLowerCase()))
  const existingNames = new Set(existing.map(a => a.company.toLowerCase()))

  const skipReasons: Record<string, number> = {}
  const addedCompanies: string[] = []
  let scanned = 0, added = 0, skippedDedupe = 0, skippedFilter = 0

  // ── Step 1: query Explorium for candidates across 3 revenue bands ──
  const REV_BANDS = ['25M-75M', '10M-25M', '75M-200M']
  const candidates: IcpCandidate[] = []

  for (const band of REV_BANDS) {
    try {
      const r = await fetch('https://api.explorium.ai/v1/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', api_key: VIBE_KEY, API_KEY: VIBE_KEY, Authorization: `Bearer ${VIBE_KEY}` },
        body: JSON.stringify({
          mode: 'full', size: 30, page_size: 30,
          filters: {
            linkedin_category: { values: ['pharmaceutical manufacturing'] },
            company_country_code: { values: ['US'] },
            company_revenue: { values: [band] },
          },
        }),
      })
      if (!r.ok) continue
      const data = await r.json()
      const businesses = data.data || data.businesses || data.results || []
      for (const b of businesses) {
        const company = b.company_name || b.name || ''
        const domain = (b.domain || b.website || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
        candidates.push({
          company,
          domain,
          city: b.city || '',
          state: b.state || '',
          country: b.country || 'US',
          linkedin_category: b.linkedin_category || b.industry || 'pharmaceutical manufacturing',
          revenue: band,
          employee_count: Number(b.employee_count || 0),
          explorium_id: String(b.business_id || ''),
          contacts: [],
        })
      }
    } catch { /* band failed, keep trying others */ }
  }

  // ── Step 2: dedupe + enrich each candidate with prospects ──
  for (const c of candidates) {
    scanned++
    if (!c.company) { skippedFilter++; continue }
    if (existingDomains.has(c.domain) || existingNames.has(c.company.toLowerCase())) {
      skippedDedupe++
      continue
    }
    if (!c.explorium_id) {
      skippedFilter++
      skipReasons['no-explorium-id'] = (skipReasons['no-explorium-id'] || 0) + 1
      continue
    }

    // Pull 5 buyer-persona contacts
    try {
      const r = await fetch('https://api.explorium.ai/v1/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', api_key: VIBE_KEY, API_KEY: VIBE_KEY, Authorization: `Bearer ${VIBE_KEY}` },
        body: JSON.stringify({
          mode: 'full', size: 5, page_size: 5,
          filters: {
            business_id: { values: [c.explorium_id] },
            job_level: { values: ['c-suite', 'director', 'vice president'] },
          },
        }),
      })
      if (r.ok) {
        const data = await r.json()
        const prospects = data.data || data.prospects || data.results || []
        c.contacts = prospects.slice(0, 5).map((p: Record<string, unknown>): Contact => ({
          name: String(p.full_name || p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown'),
          initials: String((p.first_name as string || '')[0] || '') + String((p.last_name as string || '')[0] || ''),
          title: String(p.job_title || p.title || 'Unknown'),
          email: String(p.email || p.business_email || ''),
          emailValid: !!(p.email || p.business_email),
          phone: String(p.phone_number || p.phone || ''),
          linkedin: String(p.linkedin_url || p.linkedin || ''),
        }))
      }
    } catch { /* enrichment failed, keep candidate with empty contacts */ }

    const verdict = evaluateIcp(c)
    if (!verdict.pass) {
      skippedFilter++
      const bucket = verdict.reason.split('(')[0].trim().slice(0, 60) || 'filter'
      skipReasons[bucket] = (skipReasons[bucket] || 0) + 1
      continue
    }

    // Passes ICP — persist
    const maxId = Math.max(0, ...existing.map(a => a.id))
    const newId = maxId + 1 + added
    const account = candidateToAccount(c, newId)
    await sql`INSERT INTO accounts (account_id, data) VALUES (${account.id}, ${JSON.stringify(account)})`
    existingDomains.add(account.website.toLowerCase())
    existingNames.add(account.company.toLowerCase())
    addedCompanies.push(account.company)
    added++
  }

  const run: EnrichmentRun = {
    runAt: new Date().toISOString(),
    scanned,
    added,
    skippedDedupe,
    skippedFilter,
    addedCompanies,
    skipReasons,
  }

  // Store run log in settings table (keep last 20 runs)
  const logRow = await sql`SELECT value FROM settings WHERE key = 'enrichment_log'`
  let log: EnrichmentRun[] = []
  if (logRow[0]?.value) {
    try { log = JSON.parse(logRow[0].value) } catch { log = [] }
  }
  log.unshift(run)
  log = log.slice(0, 20)
  const logStr = JSON.stringify(log)
  await sql`INSERT INTO settings (key, value) VALUES ('enrichment_log', ${logStr}) ON CONFLICT (key) DO UPDATE SET value = ${logStr}`

  return run
}

async function getLog(): Promise<EnrichmentRun[]> {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!DATABASE_URL) return []
  const sql = neon(DATABASE_URL)
  try {
    const row = await sql`SELECT value FROM settings WHERE key = 'enrichment_log'`
    if (row[0]?.value) return JSON.parse(row[0].value)
  } catch { /* settings table may not exist yet */ }
  return []
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'log') {
    const log = await getLog()
    return NextResponse.json({ success: true, log })
  }

  // Default GET = cron trigger. Vercel Cron sends Bearer $CRON_SECRET.
  const cronSecret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const run = await runEnrichment()
    return NextResponse.json({ success: true, run })
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Manual trigger from app UI — any logged-in session can run
  try {
    const run = await runEnrichment()
    return NextResponse.json({ success: true, run })
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}

// Also expose latest log via GET when called with ?action=log
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
