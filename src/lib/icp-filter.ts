// ICP filter for specialty pharma enrichment
// Accept only companies that fit Nteli's ideal customer profile.

import type { Account, Contact } from './types'

export interface IcpCandidate {
  company: string
  domain: string
  city: string
  state: string
  country: string
  linkedin_category: string
  revenue: string      // e.g. "25M-75M"
  employee_count: number
  explorium_id: string
  contacts: Contact[]  // already enriched via Explorium prospects
}

export interface IcpVerdict {
  pass: boolean
  reason: string
  fitScore: number       // 0-100, for ranking
}

/** Revenue bands we consider in-ICP. PDF says $20M-$75M — we flex slightly. */
const CORE_REV_BANDS = new Set(['25M-75M'])
const EDGE_REV_BANDS = new Set(['10M-25M', '75M-200M'])

/** C-suite/director titles that indicate a real buyer */
const BUYER_TITLE_KEYWORDS = [
  'cfo', 'chief financial', 'vp finance', 'vice president finance',
  'director contracts', 'director chargebacks', 'director pricing',
  'vp contracts', 'vp pricing', 'national account',
  'ceo', 'chief executive', 'president',
]

export function evaluateIcp(c: IcpCandidate): IcpVerdict {
  let fitScore = 0
  const reasons: string[] = []

  // Hard rules first — any failure disqualifies
  if ((c.country || '').toUpperCase() !== 'US') {
    return { pass: false, reason: `country=${c.country} (ICP is US only)`, fitScore: 0 }
  }
  if (!c.domain) {
    return { pass: false, reason: 'no domain', fitScore: 0 }
  }
  if (!(c.linkedin_category || '').toLowerCase().includes('pharmaceutical')) {
    return { pass: false, reason: `industry=${c.linkedin_category} (need pharmaceutical)`, fitScore: 0 }
  }
  if (c.employee_count > 500) {
    return { pass: false, reason: `emp=${c.employee_count} (>500 is Model N/IntegriChain territory)`, fitScore: 0 }
  }
  if (c.employee_count > 0 && c.employee_count < 20) {
    return { pass: false, reason: `emp=${c.employee_count} (<20 too small, spreadsheets still work)`, fitScore: 0 }
  }

  // Revenue band scoring
  if (CORE_REV_BANDS.has(c.revenue)) { fitScore += 50; reasons.push('core-rev-band') }
  else if (EDGE_REV_BANDS.has(c.revenue)) { fitScore += 25; reasons.push('edge-rev-band') }
  else return { pass: false, reason: `rev=${c.revenue} (outside $10M-$200M flex band)`, fitScore: 0 }

  // Contact quality scoring
  const buyerContacts = c.contacts.filter(k =>
    BUYER_TITLE_KEYWORDS.some(kw => (k.title || '').toLowerCase().includes(kw))
  )
  if (buyerContacts.length === 0) {
    return { pass: false, reason: 'no buyer-persona contacts found (CFO/Dir/VP)', fitScore: 0 }
  }
  fitScore += Math.min(buyerContacts.length * 10, 30) // up to +30

  const hasEmail = c.contacts.some(k => k.emailValid)
  if (hasEmail) { fitScore += 15; reasons.push('has-email') }

  // Employee sweet spot (specialty pharma at 51-200 = ICP core per Explorium stats)
  if (c.employee_count >= 51 && c.employee_count <= 200) { fitScore += 5; reasons.push('sweet-spot-emp') }

  return { pass: true, reason: reasons.join(', ') || 'passes all rules', fitScore }
}

/** Convert a candidate + verdict into an Account ready to save. */
export function candidateToAccount(c: IcpCandidate, nextId: number): Account {
  const top = c.contacts[0]
  return {
    id: nextId,
    company: c.company,
    city: c.city || 'Unknown',
    market: c.state || 'Unknown',
    vertical: 'Specialty / Generic Pharma',
    rev: c.revenue,
    emp: String(c.employee_count || '—'),
    priority: 'High',
    pe: false,
    ownership: 'Unknown (needs research)',
    pains: [
      'Chargeback / ship-debit leakage (5-10% typical)',
      'GTN variance on partnered products',
      'Contract & 844 exception volume',
    ],
    cxo: top ? `${top.title}` : 'Unknown',
    website: c.domain,
    liSearch: c.company,
    stage: 'Prospect',
    source: 'enriched',
    contacted: false,
    signals: [],
    contacts: c.contacts,
    contactsDate: new Date().toLocaleDateString(),
    contactsSource: 'explorium',
    explorium_id: c.explorium_id,
    stageHistory: [{ stage: 'Prospect', date: new Date().toISOString(), note: 'Auto-added by ICP enrichment' }],
    meetings: [],
    notes: '',
  }
}

export interface EnrichmentRun {
  runAt: string
  scanned: number
  added: number
  skippedDedupe: number
  skippedFilter: number
  addedCompanies: string[]
  skipReasons: Record<string, number> // reason -> count
}
