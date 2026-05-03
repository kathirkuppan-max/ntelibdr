// Seed Neon `accounts` table from the canonical MDRP universe.
// Source: src/lib/universe-mdrp.ts (built from CMS public data)
// Each labeler becomes an Account; firmographics + signals enrich incrementally.
//
// Idempotent — uses labeler code as a stable key (not Explorium ID, since most
// labelers haven't been matched in Explorium yet).
//
// POST /api/seed-mdrp → run the seed; returns { added, skipped, total }
// GET  /api/seed-mdrp?action=preview → first 30 candidates without writing

import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import type { Account } from '@/lib/types'
import { compute340BFit } from '@/lib/fit-score'
import { MDRP_UNIVERSE, type MdrpLabeler } from '@/lib/universe-mdrp'

export const maxDuration = 120

// Heuristic vertical from product names. Falls back to "Generic Pharmaceuticals".
function inferVertical(labeler: MdrpLabeler): string {
  const products = labeler.sampleProducts.join(' ').toLowerCase()
  if (products.match(/inject|vial|infusion|sterile/)) return 'Specialty Injectables'
  if (products.match(/oncolog|cancer|tumor|leukem|chemo/)) return 'Oncology Specialty'
  if (products.match(/insulin|diabet|glp/)) return 'Diabetes / Metabolic'
  if (products.match(/hiv|antiretroviral/)) return 'HIV / Antiretroviral'
  if (products.match(/hepatitis|hcv/)) return 'Hepatitis / Antiviral'
  if (products.match(/pain|opioid|oxy|fent|hydro|tramado/)) return 'Pain / Controlled Substances'
  if (products.match(/adhd|cns|psych|anti.?depress|antipsych/)) return 'CNS / Psychiatry'
  if (products.match(/derm|skin|topical|cream|ointment/)) return 'Dermatology / Topical'
  if (products.match(/ophthalm|eye|optic/)) return 'Ophthalmic'
  if (products.match(/ped|child/)) return 'Pediatric Specialty'
  return 'Generic Pharmaceuticals'
}

// Estimate revenue band from drug count — crude but useful when no firmographic
// data is available. Backed by Drug Channels per-NDC revenue averages.
function estimateRevenue(drugCount: number): string {
  if (drugCount < 20) return '$10M-$25M'
  if (drugCount < 100) return '$25M-$75M'
  if (drugCount < 500) return '$75M-$200M'
  if (drugCount < 2000) return '$200M-$500M'
  return '$500M+'
}

function labelerToAccount(L: MdrpLabeler, id: number): Account {
  const vertical = inferVertical(L)
  const rev = estimateRevenue(L.drugCount)
  const account: Account = {
    id,
    company: L.name,
    city: 'Unknown',
    market: 'Unknown',
    vertical,
    rev,
    emp: 'Unknown',
    priority: 'Medium',
    pe: false,
    ownership: 'Unknown',
    pains: [
      'Chargeback / ship-debit leakage (5-10% typical)',
      'GTN variance and reserve accuracy',
      '844 exception processing volume',
    ],
    cxo: 'Unknown — enrich prospects',
    website: '',
    liSearch: L.name,
    stage: 'Prospect',
    source: 'mdrp',
    contacted: false,
    signals: [],
    contacts: [],
    meetings: [],
    explorium_id: undefined,
    stageHistory: [{ stage: 'Prospect', date: new Date().toISOString(), note: `Seeded from MDRP labeler ${L.labelerCode}` }],
    notes: `MDRP labeler ${L.labelerCode}. ${L.drugCount} active products: ${L.sampleProducts.slice(0, 3).join(', ')}.${L.aliases.length ? ' Aliases: ' + L.aliases.join(', ') : ''}`,
  }
  account.fitScore340B = compute340BFit(account)
  return account
}

export async function POST(_req: NextRequest) {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!DATABASE_URL) return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 })
  const sql = neon(DATABASE_URL)

  try {
    // 1. Read existing accounts to dedupe
    const existingRows = await sql`SELECT data FROM accounts`
    const existing: Account[] = existingRows.map(r => r.data as Account)
    const existingNames = new Set(existing.map(a => a.company.toLowerCase().trim()))
    const existingNotesContain = (code: string) =>
      existing.some(a => (a.notes || '').includes(`MDRP labeler ${code}`))
    let nextId = existing.reduce((m, a) => Math.max(m, a.id), 0) + 1

    let added = 0
    let skippedDup = 0
    const addedSamples: string[] = []

    for (const L of MDRP_UNIVERSE) {
      const nameKey = L.name.toLowerCase().trim()
      if (existingNames.has(nameKey)) { skippedDup++; continue }
      // Aliases match too
      if (L.aliases.some(a => existingNames.has(a.toLowerCase().trim()))) { skippedDup++; continue }
      if (existingNotesContain(L.labelerCode)) { skippedDup++; continue }

      const account = labelerToAccount(L, nextId++)
      await sql`INSERT INTO accounts (account_id, data) VALUES (${account.id}, ${JSON.stringify(account)}) ON CONFLICT (account_id) DO NOTHING`
      existingNames.add(nameKey)
      added++
      if (addedSamples.length < 10) addedSamples.push(account.company)
    }

    return NextResponse.json({
      success: true,
      total: MDRP_UNIVERSE.length,
      added,
      skippedDup,
      addedSamples,
      sourceCsv: 'CMS MDRP Q4 2025 (drugproducts4q_2025Updated02122026)',
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('action') === 'preview') {
    const sample = MDRP_UNIVERSE.slice(0, 30).map(L => ({
      labelerCode: L.labelerCode,
      name: L.name,
      drugCount: L.drugCount,
      vertical: inferVertical(L),
      revenueEstimate: estimateRevenue(L.drugCount),
      sampleProducts: L.sampleProducts.slice(0, 3),
    }))
    return NextResponse.json({ total: MDRP_UNIVERSE.length, sample })
  }
  return NextResponse.json({ total: MDRP_UNIVERSE.length, message: 'POST to seed' })
}
