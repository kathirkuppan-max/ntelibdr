export interface Contact {
  name: string
  initials: string
  title: string
  email: string
  emailValid: boolean
  phone: string
  linkedin: string
  location?: string
  source?: string
  simulated?: boolean
}

export interface FollowUp {
  day: number
  status: 'pending' | 'ready' | 'sent' | 'opened' | 'replied'
  subject: string
  body: string
  sentAt: string | null
  emailId?: string
  threadId?: string
}

export interface Meeting {
  id: string
  event: string
  contact: string
  contactEmail: string
  contactTitle: string
  notes: string
  date: string
  followUps: FollowUp[]
}

export type Stage =
  | 'Prospect'
  | 'Connected'
  | 'Met'
  | 'Following Up'
  | 'Engaged'
  | 'Meeting'
  | 'Proposal'
  | 'Won'
  | 'Lost'

export interface StageChange {
  stage: Stage
  date: string
  note?: string
}

// Product / ICP identifier — every account scores against every product.
export type ProductId = 'recapture' | 'crm_erp'

export interface Account {
  id: number
  company: string
  city: string
  market: string
  vertical: string
  rev: string
  emp: string
  priority: 'High' | 'Medium' | 'Low'
  pe: boolean
  ownership: string
  pains: string[]
  cxo: string
  website: string
  liSearch: string
  stage: Stage
  source: string
  contacted: boolean
  signals: Signal[]
  contacts?: Contact[]
  contactsDate?: string
  contactsSource?: string
  meetings?: Meeting[]
  explorium_id?: string
  testContact?: { name: string; email: string; title: string }
  stageHistory?: StageChange[]
  notes?: string
  // Multi-product fit scoring (always populated for all known products)
  fitScores?: Partial<Record<ProductId, FitScore>>
  // Which product(s) this account is primarily a target for. Used as a
  // tie-breaker / chip in UI. Defaults to ['recapture'] for legacy rows.
  products?: ProductId[]
  // DEPRECATED — mirrored from fitScores.recapture for one release.
  // Delete in v12 once all consumers read fitScores instead.
  fitScore340B?: FitScore340B
}

export type SignalType =
  // Pharma / Recapture-relevant
  | 'new_product'                    // ANDA approval / drug launch
  | 'new_funding_round'              // Capital raise
  | 'merger_and_acquisitions'        // PE deal, acquisition, integration
  | 'ipo_announcement'
  | 'lawsuits_and_legal_issues'      // Patent fight, FDA issue
  | 'hiring_in_finance_department'   // New CFO/Controller
  | 'new_executive'                  // Generic senior hire
  | 'govpricing_hiring'              // 340B / Gov Pricing / Contracts hire
  // Distributor-channel / CRM↔ERP relevant
  | 'design_win'                     // Component design-in at OEM
  | 'distributor_expansion'          // New distributor / channel partner
  | 'erp_migration'                  // SAP / Oracle / NetSuite migration
  | 'channel_ops_hiring'             // Channel ops / channel finance hire
  | 'supply_chain_hiring'            // Supply-chain / ops hire
  | 'other'

// Generalized fit-score shape — same five dimensions for every product.
// Per-product configuration in `src/lib/products.ts` decides how each
// dimension is computed and weighted.
export interface FitScore {
  total: number          // 0-100
  channelExposure: number   // primary channel relevance (was channelExposure for 340B)
  therapeuticArea: number   // industry / vertical relevance (was therapeuticArea)
  revenueBand: number       // ICP revenue band match
  competitorRisk: number    // entrenched-competitor penalty
  signalBoost: number       // recent buying signals
  rationale: string[]       // human-readable reasons
}

// Backward-compat alias — existing imports of FitScore340B keep working.
export type FitScore340B = FitScore

export interface Signal {
  type: SignalType
  title: string
  date: string       // ISO date
  link?: string
  snippet?: string
}

export type EventCategory = 'trade_show' | 'conference' | 'meetup' | 'coworking' | 'dinner'

export interface EventTag {
  accountId: number
  contactName: string
}

export interface BdrEvent {
  id: string
  name: string
  dates: string
  location: string
  type: string
  category: EventCategory
  why: string
  relevance: 'High' | 'Medium' | 'Low'
  url: string
  attending: boolean
  notes: string
  eventTags?: EventTag[]
}
