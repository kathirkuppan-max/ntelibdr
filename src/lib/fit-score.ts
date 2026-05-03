// Generalized fit scoring — same five dimensions for every product, but
// the keywords / weights / signal whitelist come from per-product config
// in `src/lib/products.ts`.
//
// Per-account result: `account.fitScores[productId]: FitScore`.
// `compute340BFit` is kept as a one-line wrapper so existing callers compile
// while we migrate.

import type { Account, FitScore, ProductId } from './types'
import { PRODUCTS, PRODUCT_IDS, type ProductConfig } from './products'

function scoreRevenue(rev: string, product: ProductConfig): number {
  const r = (rev || '').toLowerCase()
  for (const band of product.revenueBands) {
    if (band.match.test(r)) return band.score
  }
  return 50
}

function scoreChannel(account: Account, product: ProductConfig): number {
  const description = [account.vertical, account.ownership].join(' ').toLowerCase()
  let score = 50
  for (const kw of product.highVerticalKeywords) { if (description.includes(kw)) score += 10 }
  for (const kw of product.lowVerticalKeywords) { if (description.includes(kw)) score -= 15 }
  return Math.max(0, Math.min(100, score))
}

function scoreTherapeuticArea(account: Account, product: ProductConfig): { score: number; areas: string[] } {
  const vertical = (account.vertical || '').toLowerCase()
  const matched: string[] = []
  let score = 40
  for (const kw of product.highVerticalKeywords) {
    if (vertical.includes(kw)) { matched.push(kw); score += 15 }
  }
  for (const kw of product.lowVerticalKeywords) {
    if (vertical.includes(kw)) score -= 20
  }
  return { score: Math.max(0, Math.min(100, score)), areas: matched }
}

function scoreCompetitor(account: Account, product: ProductConfig): number {
  const rev = (account.rev || '').toLowerCase()
  const owner = (account.ownership || '').toLowerCase()
  const isPublic = owner.includes('nyse:') || owner.includes('nasdaq:') ||
                   owner.includes('lse:') || owner.includes('nse:') ||
                   owner.includes('bse:') || owner.includes('otc:')
  const isMegacap = /b\+|\$1b|\$2b|\$4b|\$10b/.test(rev)
  if (isPublic && isMegacap) return product.competitorPenaltyAtMegaCap
  if (isPublic) return product.publicCompanyAtMegacapScore
  return product.midMarketCompetitorScore
}

function scoreSignalBoost(account: Account, product: ProductConfig): { score: number; boosts: string[] } {
  const signals = account.signals || []
  const boosts: string[] = []
  let score = 0
  for (const s of signals) {
    if (product.highValueSignals.includes(s.type)) {
      score += 10
      boosts.push(`${s.type}: ${s.title.slice(0, 60)}`)
    } else {
      score += 2
    }
  }
  return { score: Math.min(30, score), boosts }
}

export function computeFitForProduct(account: Account, product: ProductConfig): FitScore {
  const revenueBand = scoreRevenue(account.rev, product)
  const channelExposure = scoreChannel(account, product)
  const therapeutic = scoreTherapeuticArea(account, product)
  const competitorRisk = scoreCompetitor(account, product)
  const signalBoost = scoreSignalBoost(account, product)

  const total = Math.round(
    revenueBand * 0.25 +
    channelExposure * 0.20 +
    therapeutic.score * 0.20 +
    competitorRisk * 0.20 +
    signalBoost.score * 0.15
  )

  const rationale: string[] = []
  if (revenueBand >= 85) rationale.push(`Revenue in ${product.name} sweet spot`)
  else if (revenueBand < 40) rationale.push(`Revenue outside ICP (${account.rev})`)
  if (therapeutic.areas.length) rationale.push(`${product.name} keywords matched: ${therapeutic.areas.join(', ')}`)
  if (channelExposure >= 70) rationale.push(`Strong channel match for ${product.name}`)
  if (channelExposure < 40) rationale.push(`Weak channel match for ${product.name}`)
  if (competitorRisk < 40) rationale.push(`Likely ${product.competitors[0]} entrenched already`)
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

export function computeAllFitScores(account: Account): Partial<Record<ProductId, FitScore>> {
  const out: Partial<Record<ProductId, FitScore>> = {}
  for (const pid of PRODUCT_IDS) {
    out[pid] = computeFitForProduct(account, PRODUCTS[pid])
  }
  return out
}

// Back-compat wrapper — Recapture only. Keeps existing callers compiling
// until they read account.fitScores instead.
export function compute340BFit(account: Account): FitScore {
  return computeFitForProduct(account, PRODUCTS.recapture)
}

export function scoreAllAccounts(accounts: Account[]): Account[] {
  return accounts.map(a => {
    const fitScores = computeAllFitScores(a)
    return { ...a, fitScores, fitScore340B: fitScores.recapture }
  })
}
