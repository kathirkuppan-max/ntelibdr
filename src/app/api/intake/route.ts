import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

// Public lead-intake endpoint. The Nteligroup marketing site posts the
// /contact.html form here; the payload is mapped to an Account row and
// inserted into Neon so it shows up in the BDR app's Today / Dashboard.
//
// Open CORS — the marketing site lives on a different origin (Vite dev
// or Vercel marketing project). Spam protection is intentionally minimal
// for now; add reCAPTCHA / hCaptcha when the form opens to the public.

interface IntakePayload {
  name?: string
  email?: string
  company?: string
  role?: string
  industry?: string
  size?: string
  diagnostic?: string
  problem?: string
  timeline?: string
  stack?: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500, headers: CORS_HEADERS })
  }

  let p: IntakePayload
  try {
    p = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS })
  }

  // Required fields (matches the * markers on the marketing form)
  const missing: string[] = []
  if (!p.name?.trim()) missing.push('name')
  if (!p.email?.trim()) missing.push('email')
  if (!p.company?.trim()) missing.push('company')
  if (!p.industry?.trim()) missing.push('industry')
  if (!p.problem?.trim()) missing.push('problem')
  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400, headers: CORS_HEADERS })
  }

  const sql = neon(DATABASE_URL)

  try {
    // Allocate next account ID (avoids collision with seed range 1-40 and semi range 1001-1013)
    const [{ max_id }] = await sql`SELECT COALESCE(MAX(account_id), 2000) AS max_id FROM accounts` as Array<{ max_id: number }>
    const newId = Math.max(2001, Number(max_id) + 1)

    const account = mapPayloadToAccount(newId, p)

    await sql`
      INSERT INTO accounts (account_id, data)
      VALUES (${newId}, ${JSON.stringify(account)})
      ON CONFLICT (account_id) DO UPDATE SET data = ${JSON.stringify(account)}, updated_at = NOW()
    `

    return NextResponse.json({ success: true, accountId: newId, company: account.company }, { headers: CORS_HEADERS })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500, headers: CORS_HEADERS })
  }
}

// Map marketing-form industry → which product/ICP this lead belongs to
function inferProduct(industry: string): 'recapture' | 'crm_erp' {
  const i = industry.toLowerCase()
  if (i.includes('pharma') || i.includes('life sciences')) return 'recapture'
  // Manufacturing, MedTech, SaaS, Financial Services, Other → CRM↔ERP
  return 'crm_erp'
}

// Enrich the form's industry string with extra keywords so the
// keyword-driven fit scorer in fit-score.ts ranks the right product
// highest for this account. Without this, "Pharma / Life Sciences" doesn't
// match any of Recapture's high-value keywords (oncology, hospital,
// specialty, etc.) and the tie-break sometimes goes the wrong way.
function enrichVertical(industry: string): string {
  const i = industry.toLowerCase()
  if (i.includes('pharma') || i.includes('life sciences')) {
    return `${industry} · Specialty Pharma · Hospital`
  }
  if (i.includes('medtech') || i.includes('medical device')) {
    return `${industry} · MedTech Manufacturer · Distributor Channel`
  }
  if (i.includes('manufacturing') || i.includes('industrial')) {
    return `${industry} · Industrial Manufacturer · Distributor Channel · Component`
  }
  if (i.includes('saas') || i.includes('technology')) {
    return `${industry} · Technology · Channel`
  }
  return industry
}

// Map "200-1,000 employees" → revenue band string the rest of the app understands
function inferRevenue(size: string | undefined): string {
  if (!size) return '$25M–$75M'
  const s = size.toLowerCase()
  if (s.includes('< 200')) return '$10M–$25M'
  if (s.includes('200') && s.includes('1,000')) return '$25M–$200M'
  if (s.includes('1,000') && s.includes('5,000')) return '$200M–$500M'
  if (s.includes('5,000+') || s.includes('5000+')) return '$500M+'
  return '$25M–$75M'
}

// Inbound leads with "this quarter" / "next quarter" intent get High priority
function inferPriority(timeline: string | undefined): 'High' | 'Medium' | 'Low' {
  if (!timeline) return 'Medium'
  const t = timeline.toLowerCase()
  if (t.includes('this quarter')) return 'High'
  if (t.includes('next quarter')) return 'High'
  if (t.includes('this year')) return 'Medium'
  return 'Low'
}

function mapPayloadToAccount(id: number, p: IntakePayload) {
  const product = inferProduct(p.industry || '')
  const initials = (p.name || '').split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
  const now = new Date().toISOString()

  // Build pains list from form's free-text problem + diagnostic interest
  const pains: string[] = []
  if (p.problem) pains.push(p.problem.slice(0, 300))
  if (p.diagnostic && p.diagnostic.trim()) pains.push(`Interested in: ${p.diagnostic}`)
  if (p.stack) pains.push(`Current stack: ${p.stack}`)

  // Inbound leads ALWAYS get a fresh "inbound_lead" signal so they surface
  // in the Today page's Hot Accounts ranking immediately.
  const signals = [{
    type: 'other' as const,
    title: `Inbound lead via nteligroup.com — "${(p.problem || '').slice(0, 120)}"`,
    date: now.slice(0, 10),
    snippet: `Diagnostic interest: ${p.diagnostic || '—'} · Timeline: ${p.timeline || '—'}`,
  }]

  return {
    id,
    company: p.company!.trim(),
    city: '—',
    market: 'Inbound',
    vertical: enrichVertical(p.industry || ''),
    rev: inferRevenue(p.size),
    emp: p.size || '—',
    priority: inferPriority(p.timeline),
    pe: false,
    ownership: '',
    pains,
    cxo: p.role ? `${p.name} (${p.role})` : (p.name || ''),
    website: '',
    liSearch: p.company || '',
    stage: 'Connected' as const,
    source: 'website',
    contacted: false,
    signals,
    contacts: [{
      name: p.name!.trim(),
      initials,
      title: p.role || 'Inbound lead',
      email: p.email!.trim(),
      emailValid: true,
      phone: '',
      linkedin: '',
      source: 'website-form',
    }],
    contactsDate: now.slice(0, 10),
    contactsSource: 'nteligroup.com /contact',
    products: [product],
    stageHistory: [
      { stage: 'Prospect', date: now },
      { stage: 'Connected', date: now, note: 'Self-identified via marketing site' },
    ],
    notes: p.problem || '',
  }
}
