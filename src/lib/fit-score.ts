// 340B Recapture fit scoring
// Scoring dimensions are tuned to Recapture's actual value prop per
// the research dossier: catch the 4 leaks (OPAIS terminations, unauthorized
// contract pharmacies, manufacturer policy violations, duplicate Medicaid).

import type { Account, FitScore340B, SignalType } from './types'

// Therapeutic areas ranked by 340B dispensing concentration.
// Oncology, rare disease, specialty injectables dominate 340B volume.
const HIGH_340B_KEYWORDS = [
  'oncology', 'hospital', 'injectable', 'specialty', 'rare',
  'cns', 'pain', 'controlled substance', 'hiv', 'hepatitis',
  'biologic', 'rems', 'pediatric',
]
const LOW_340B_KEYWORDS = [
  'otc', 'softgel', 'cosmetic', 'skin care', 'consumer',
  'toiletry', 'personal care', 'medical equipment', 'monitoring',
]

// Revenue band scoring — per dossier, $50M-$5B is sweet spot.
// <$50M pre-commercial; >$5B Model N territory.
function scoreRevenue(rev: string): number {
  const r = rev.toLowerCase()
  if (r.includes('200m-500m') || r.includes('$200m') || r.includes('$500m')) return 100 // upper mid
  if (r.includes('75m-200m') || r.includes('$75m')) return 95                             // lower mid
  if (r.includes('25m-75m')) return 90                                                    // ICP core
  if (r.includes('500m+') || r.includes('$500m+') || r.includes('500m-1b')) return 75     // upper but accessible
  if (r.includes('10m-25m') || r.includes('$10m')) return 65                              // small but workable
  if (r.includes('$1b') && !r.includes('$1b+')) return 50                                 // getting into MN territory
  if (r.includes('1b+') || r.includes('$1b+') || r.includes('$2b') || r.includes('$4b')) return 25   // Model N entrenched
  if (r.includes('b+') || r.includes('$10b')) return 10                                   // mega-cap
  if (r.includes('< $10m') || r.includes('< 10m')) return 20                              // too small
  return 50
}

// Channel exposure — hospital/IDN/injectable = high 340B flow
function scoreChannel(account: Account): number {
  const vertical = (account.vertical || '').toLowerCase()
  const description = [vertical, account.ownership].join(' ').toLowerCase()

  let score = 50
  for (const kw of HIGH_340B_KEYWORDS) { if (description.includes(kw)) score += 10 }
  for (const kw of LOW_340B_KEYWORDS) { if (description.includes(kw)) score -= 15 }
  return Math.max(0, Math.min(100, score))
}

// Therapeutic area gets its own explicit score for transparency
function scoreTherapeuticArea(account: Account): { score: number; areas: string[] } {
  const vertical = (account.vertical || '').toLowerCase()
  const matched: string[] = []
  let score = 40
  for (const kw of HIGH_340B_KEYWORDS) {
    if (vertical.includes(kw)) { matched.push(kw); score += 15 }
  }
  for (const kw of LOW_340B_KEYWORDS) {
    if (vertical.includes(kw)) score -= 20
  }
  return { score: Math.max(0, Math.min(100, score)), areas: matched }
}

// Competitor risk — Model N tends to be entrenched at big-pharma
function scoreCompetitor(account: Account): number {
  const rev = account.rev.toLowerCase()
  const owner = (account.ownership || '').toLowerCase()
  // Public large-cap → almost certainly Model N
  if (owner.includes('nyse:') || owner.includes('nasdaq:')) {
    if (rev.includes('b+') || rev.includes('$1b') || rev.includes('$2b') || rev.includes('$4b') || rev.includes('$10b')) {
      return 20 // Model N likely entrenched
    }
    return 50
  }
  return 80 // Private / mid-market → fresh opportunity
}

// Boost based on fresh buying signals that matter for Recapture
function scoreSignalBoost(account: Account): { score: number; boosts: string[] } {
  const signals = account.signals || []
  const boosts: string[] = []
  let score = 0
  // Types that concretely raise 340B relevance
  const relevantTypes: SignalType[] = [
    'merger_and_acquisitions',      // contract setup
    'new_product',                  // ANDA launch = chargeback volume
    'govpricing_hiring',            // direct hire-the-buyer signal
    'hiring_in_finance_department', // AR team overwhelmed
    'lawsuits_and_legal_issues',    // compliance mandate
  ]
  for (const s of signals) {
    if (relevantTypes.includes(s.type)) {
      score += 10
      boosts.push(`${s.type}: ${s.title.slice(0, 60)}`)
    } else {
      score += 2
    }
  }
  return { score: Math.min(30, score), boosts }
}

export function compute340BFit(account: Account): FitScore340B {
  const revenueBand = scoreRevenue(account.rev)
  const channelExposure = scoreChannel(account)
  const therapeutic = scoreTherapeuticArea(account)
  const competitorRisk = scoreCompetitor(account)
  const signalBoost = scoreSignalBoost(account)

  // Weighted total
  const total = Math.round(
    revenueBand * 0.25 +
    channelExposure * 0.20 +
    therapeutic.score * 0.20 +
    competitorRisk * 0.20 +
    signalBoost.score * 0.15
  )

  const rationale: string[] = []
  if (revenueBand >= 85) rationale.push('Revenue in Recapture sweet spot')
  else if (revenueBand < 40) rationale.push(`Revenue outside ICP (${account.rev})`)
  if (therapeutic.areas.length) rationale.push(`340B-heavy therapeutic areas: ${therapeutic.areas.join(', ')}`)
  if (channelExposure >= 70) rationale.push('Hospital / IDN / specialty channel = high 340B exposure')
  if (channelExposure < 40) rationale.push('Consumer / OTC channel = limited 340B exposure')
  if (competitorRisk < 40) rationale.push('Likely Model N / IntegriChain customer already')
  if (signalBoost.score >= 15) rationale.push(`Fresh signals: ${signalBoost.boosts.length} relevant`)

  return {
    total,
    channelExposure,
    therapeuticArea: therapeutic.score,
    revenueBand,
    competitorRisk,
    signalBoost: signalBoost.score,
    rationale,
  }
}

export function scoreAllAccounts(accounts: Account[]): Account[] {
  return accounts.map(a => ({ ...a, fitScore340B: compute340BFit(a) }))
}
