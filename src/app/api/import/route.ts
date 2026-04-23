// Bulk import the entire Nteli ICP universe from Explorium into Neon.
// One-shot admin endpoint — call POST /api/import?action=run to trigger.
// Uses Explorium v1 API directly (verified format from developers.explorium.ai).
// Writes to the existing `accounts` table in Neon.

import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import type { Account, Signal, SignalType } from '@/lib/types'

export const maxDuration = 300 // 5 minutes; this is a long-running job

interface ExploriumBusiness {
  business_id: string
  business_name: string
  business_domain?: string
  business_website?: string
  business_country_name?: string
  business_city_name?: string | null
  business_region?: string | null
  business_number_of_employees_range?: string
  business_yearly_revenue_range?: string
  business_naics?: string
  business_naics_description?: string
  business_sic_code?: string
  business_business_description?: string
}

interface ExploriumEvent {
  event_name: string
  event_time: string
  event_id: string
  business_id: string
  data: {
    title?: string
    snippet?: string
    link?: string
    case_type?: string
    product_name?: string
    product_description?: string
    description?: string
  }
}

const SIGNAL_MAP: Record<string, SignalType> = {
  new_product: 'new_product',
  new_funding_round: 'new_funding_round',
  merger_and_acquisitions: 'merger_and_acquisitions',
  ipo_announcement: 'ipo_announcement',
  lawsuits_and_legal_issues: 'lawsuits_and_legal_issues',
  hiring_in_finance_department: 'hiring_in_finance_department',
  employee_joined_company: 'new_executive',
}

const NAICS_PHARMA = ['325412', '325411', '3254'] // pharma preparation, medicinal, and all
const REV_BANDS = ['25M-75M', '10M-25M', '75M-200M']

async function fetchExploriumPage(apiKey: string, revenueBand: string, page: number, pageSize: number): Promise<ExploriumBusiness[]> {
  const res = await fetch('https://api.explorium.ai/v1/businesses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', API_KEY: apiKey, api_key: apiKey, Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      mode: 'full',
      size: 10000,
      page_size: pageSize,
      page,
      filters: {
        country_code: { values: ['us'] },
        company_revenue: { values: [revenueBand] },
        naics_category: { values: ['325412'] }, // Strict: Pharmaceutical Preparation Manufacturing
      },
    }),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.data || data.businesses || data.results || []
}

async function fetchBusinessEvents(apiKey: string, businessIds: string[]): Promise<Record<string, ExploriumEvent[]>> {
  if (!businessIds.length) return {}
  const res = await fetch('https://api.explorium.ai/v1/businesses/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', API_KEY: apiKey, api_key: apiKey, Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      business_ids: businessIds,
      event_types: ['new_product', 'new_funding_round', 'merger_and_acquisitions', 'ipo_announcement', 'lawsuits_and_legal_issues', 'hiring_in_finance_department'],
      timestamp_from: '2025-10-01',
    }),
  })
  if (!res.ok) return {}
  const data = await res.json()
  const events: ExploriumEvent[] = data.data || data.events || data.results || []
  const byBiz: Record<string, ExploriumEvent[]> = {}
  for (const e of events) {
    if (!byBiz[e.business_id]) byBiz[e.business_id] = []
    byBiz[e.business_id].push(e)
  }
  return byBiz
}

function businessToAccount(b: ExploriumBusiness, id: number, signals: Signal[]): Account {
  const city = [b.business_city_name, b.business_region].filter(Boolean).join(', ')
  return {
    id,
    company: b.business_name,
    city: city || 'Unknown',
    market: b.business_region || 'Unknown',
    vertical: b.business_naics_description || 'Pharmaceutical Manufacturing',
    rev: b.business_yearly_revenue_range || 'Unknown',
    emp: b.business_number_of_employees_range || 'Unknown',
    priority: signals.length > 0 ? 'High' : 'Medium',
    pe: false,
    ownership: 'Unknown',
    pains: ['Chargeback / ship-debit leakage (5-10% typical on $50M book)', 'GTN variance and reserve accuracy', '844 exception processing volume'],
    cxo: 'Unknown — enrich prospects',
    website: (b.business_domain || b.business_website || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
    liSearch: b.business_name,
    stage: 'Prospect',
    source: 'explorium',
    contacted: false,
    signals,
    explorium_id: b.business_id,
    contacts: [],
    meetings: [],
    stageHistory: [{ stage: 'Prospect', date: new Date().toISOString(), note: 'Imported from Explorium' }],
  }
}

function eventToSignal(e: ExploriumEvent): Signal {
  return {
    type: SIGNAL_MAP[e.event_name] || 'other',
    title: e.data.title || e.data.product_name || e.data.case_type || e.event_name,
    date: (e.event_time || '').slice(0, 10),
    link: e.data.link,
    snippet: e.data.snippet || e.data.description || e.data.product_description,
  }
}

async function runImport() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!DATABASE_URL) throw new Error('DATABASE_URL not configured')
  const apiKey = process.env.VIBE_API_KEY
  if (!apiKey) throw new Error('VIBE_API_KEY not configured')
  const sql = neon(DATABASE_URL)

  // 1. Dedupe set
  const existingRows = await sql`SELECT data FROM accounts`
  const existing: Account[] = existingRows.map(r => r.data as Account)
  const existingDomains = new Set(existing.map(a => (a.website || '').toLowerCase()).filter(Boolean))
  const existingExploriumIds = new Set(existing.map(a => a.explorium_id).filter(Boolean))
  let nextId = existing.reduce((m, a) => Math.max(m, a.id), 0) + 1

  // 2. Pull all revenue bands paginated
  const allBusinesses: ExploriumBusiness[] = []
  for (const band of REV_BANDS) {
    for (let page = 1; page <= 10; page++) {
      const rows = await fetchExploriumPage(apiKey, band, page, 100)
      if (!rows.length) break
      allBusinesses.push(...rows.map(b => ({ ...b, _band: band })))
      if (rows.length < 100) break
    }
  }

  // 3. Filter to pharma-only (NAICS strict)
  const pharmaOnly = allBusinesses.filter(b => {
    const code = (b.business_naics || '').toString()
    return NAICS_PHARMA.some(prefix => code.startsWith(prefix))
  })

  // 4. Dedupe
  const toImport = pharmaOnly.filter(b => {
    const d = (b.business_domain || b.business_website || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (existingExploriumIds.has(b.business_id)) return false
    if (d && existingDomains.has(d)) return false
    return true
  })

  // 5. Fetch events in batches of 50 business IDs
  const eventsByBiz: Record<string, ExploriumEvent[]> = {}
  const businessIds = toImport.map(b => b.business_id)
  for (let i = 0; i < businessIds.length; i += 50) {
    const batch = businessIds.slice(i, i + 50)
    const batchEvents = await fetchBusinessEvents(apiKey, batch)
    Object.assign(eventsByBiz, batchEvents)
  }

  // 6. Build Account records and bulk-insert to Neon
  let imported = 0
  const importedCompanies: string[] = []
  for (const b of toImport) {
    const events = eventsByBiz[b.business_id] || []
    const signals: Signal[] = events.slice(0, 5).map(eventToSignal)
    const account = businessToAccount(b, nextId++, signals)
    await sql`INSERT INTO accounts (account_id, data) VALUES (${account.id}, ${JSON.stringify(account)}) ON CONFLICT (account_id) DO NOTHING`
    imported++
    importedCompanies.push(account.company)
    if (imported >= 500) break // safety cap
  }

  // 7. Log run
  const logStr = JSON.stringify({
    runAt: new Date().toISOString(),
    totalPulled: allBusinesses.length,
    pharmaOnly: pharmaOnly.length,
    afterDedupe: toImport.length,
    imported,
    importedCompanies: importedCompanies.slice(0, 20),
  })
  await sql`INSERT INTO settings (key, value) VALUES ('last_import', ${logStr}) ON CONFLICT (key) DO UPDATE SET value = ${logStr}`

  return {
    totalPulled: allBusinesses.length,
    pharmaOnly: pharmaOnly.length,
    afterDedupe: toImport.length,
    imported,
    importedCompanies: importedCompanies.slice(0, 20),
  }
}

export async function POST(_req: NextRequest) {
  try {
    const result = await runImport()
    return NextResponse.json({ success: true, ...result })
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}

export async function GET() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!DATABASE_URL) return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 })
  const sql = neon(DATABASE_URL)
  const row = await sql`SELECT value FROM settings WHERE key = 'last_import'`
  if (!row[0]?.value) return NextResponse.json({ success: true, last: null })
  try { return NextResponse.json({ success: true, last: JSON.parse(row[0].value) }) } catch {
    return NextResponse.json({ success: true, last: null })
  }
}
