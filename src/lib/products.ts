// Per-product configuration. One file, one source of truth for everything
// that varies between Recapture (specialty pharma 340B) and CRM↔ERP
// (distributor-channel manufacturers — semis / electronics / industrial).
//
// All fit-scoring keywords, persona templates, case studies, signal weights,
// and AI-prompt language live here. fit-score.ts and the UI just read from
// PRODUCTS[selectedProduct].

import type { ProductId, SignalType } from './types'

export interface OutreachTemplate {
  persona: string
  role_titles: string[]   // job-title keywords to match contacts to persona
  hook: string
  insight: string
  ask: string
  case_study: string
}

export interface RevenueBandWeight {
  match: RegExp           // matches lowercased account.rev
  score: number
}

export interface ProductConfig {
  id: ProductId
  name: string                   // Human label — "Recapture" / "CRM↔ERP"
  shortLabel: string             // One-word — "Recapture" / "CRM-ERP"
  shortPitch: string             // 2-sentence pitch fed into AI prompts
  badgeColor: string             // Tailwind classes for product chip
  highVerticalKeywords: string[] // boost channel + therapeutic dimensions
  lowVerticalKeywords: string[]  // penalty
  competitors: string[]
  competitorPenaltyAtMegaCap: number  // 0-100 score returned at $1B+ public cos
  publicCompanyAtMegacapScore: number // score for big public co
  midMarketCompetitorScore: number    // score for private mid-market
  revenueBands: RevenueBandWeight[]
  highValueSignals: SignalType[] // signals worth more than the +2 baseline
  personas: OutreachTemplate[]
  caseStudies: Record<string, string>
  defaultPains: string[]
  fitDimensionLabels: { revenue: string; channel: string; ta: string; compete: string; signals: string }
  productLineDescription: string // longer block for Claude prompt
}

// ──────────────────────────────────────────────────────────────────────
// RECAPTURE (specialty pharma — 340B chargeback recapture)
// ──────────────────────────────────────────────────────────────────────
const RECAPTURE: ProductConfig = {
  id: 'recapture',
  name: 'Recapture',
  shortLabel: 'Recapture',
  shortPitch: 'Recapture is a real-time 340B chargeback validation engine for specialty pharma. Catches OPAIS-terminated CEs, unauthorized contract pharmacies, manufacturer policy violations, and duplicate Medicaid — priced at 5-10% of recovered dollars.',
  badgeColor: 'bg-blue-bg text-blue',
  highVerticalKeywords: [
    'oncology', 'hospital', 'injectable', 'specialty', 'rare',
    'cns', 'pain', 'controlled substance', 'hiv', 'hepatitis',
    'biologic', 'rems', 'pediatric',
  ],
  lowVerticalKeywords: [
    'otc', 'softgel', 'cosmetic', 'skin care', 'consumer',
    'toiletry', 'personal care', 'medical equipment', 'monitoring',
    'semiconductor', 'electronics', 'industrial',
  ],
  competitors: ['Model N', 'IntegriChain', 'IQVIA', 'Vistex', 'Kalderos'],
  competitorPenaltyAtMegaCap: 20,
  publicCompanyAtMegacapScore: 50,
  midMarketCompetitorScore: 80,
  revenueBands: [
    { match: /200m-500m|\$200m|\$500m(?!\+)/, score: 100 },
    { match: /75m-200m|\$75m/, score: 95 },
    { match: /25m-75m/, score: 90 },
    { match: /500m\+|\$500m\+|500m-1b/, score: 75 },
    { match: /10m-25m|\$10m/, score: 65 },
    { match: /\$1b(?!\+)/, score: 50 },
    { match: /1b\+|\$1b\+|\$2b|\$4b/, score: 25 },
    { match: /b\+|\$10b/, score: 10 },
    { match: /< \$10m|< 10m/, score: 20 },
  ],
  highValueSignals: [
    'merger_and_acquisitions',
    'new_product',
    'govpricing_hiring',
    'hiring_in_finance_department',
    'lawsuits_and_legal_issues',
  ],
  personas: [
    {
      persona: 'Director of Government Pricing',
      role_titles: [
        'director government pricing', 'government pricing',
        'director gp', 'gov pricing', 'vp government pricing',
      ],
      hook: "Apexus just posted a PharmD role to drive more 340B savings from manufacturers. Your side of that conversation is about to get harder.",
      insight: "Recapture catches the four 340B-specific leaks Model N was never designed for: OPAIS-terminated CEs, unauthorized contract pharmacies, manufacturer policy violations, duplicate Medicaid.",
      ask: "15 minutes to show you what a pilot on your last quarter's 844 file would have flagged — no commit, just your data against our rules.",
      case_study: "A $250M specialty generic had $1.8M/yr in 340B chargebacks flowing through contract pharmacies that weren't on their authorized roster. Recapture catches that before the credit memo posts.",
    },
    {
      persona: 'Director of Contracts & Chargebacks',
      role_titles: [
        'director contracts', 'director chargebacks',
        'director pricing and contracts', 'dir pricing',
        'vp contracts', 'contracts director',
      ],
      hook: "Your team processes thousands of 844 lines a month and your chargeback-to-credit-memo flow runs through Model N or IQVIA. That's fine — we work alongside it.",
      insight: "Recapture is the 340B compliance layer that sits between your chargeback engine and your GL. It catches the ~6% that Model N approves but is actually non-compliant.",
      ask: "Can I walk you through four real-world 340B edge cases from Apr 2026 that cost manufacturers money last quarter?",
      case_study: "Generic manufacturer at $300M ARR was paying chargebacks on terminated covered entities — HRSA OPAIS had flagged them 18 months before the manufacturer's own system updated. Recapture checks OPAIS in real time on every claim.",
    },
    {
      persona: 'CFO / VP Finance',
      role_titles: [
        'cfo', 'chief financial officer', 'vp finance',
        'evp cfo', 'svp finance',
      ],
      hook: "340B chargebacks grew 163% over the last 5 years and manufacturers lose 4-7% to preventable leakage. On a $50M book that's $2M-$3.5M/year.",
      insight: "Recapture recovers it inside your existing ledger — no ERP change, no Model N rip-and-replace, priced at 5-10% of verified recovery.",
      ask: "20 minutes to run your last 90 days of 844 data through our engine and tell you exactly what you'd recover. Pilot costs zero if we find nothing.",
      case_study: "$400M specialty pharma CFO found $9M in leakage in the first quarter — enough to cover the entire Recapture engagement 50x over. Now a clean audit opinion line.",
    },
    {
      persona: 'CEO / PE Operating Partner',
      role_titles: [
        'ceo', 'chief executive', 'president & ceo',
        'operating partner', 'portfolio operations',
      ],
      hook: "Your Director of Contracts is drowning in 844 exceptions and your FY27 close is looking shaky because nobody can reconcile the 340B chargeback accrual.",
      insight: "Recapture doubles your team's throughput without doubling headcount. Pricing tied to recovered dollars, not licenses.",
      ask: "A 20-minute read-out to your operating partner on where the leakage is and what cash back looks like.",
      case_study: "PE-backed generic manufacturer scaled 340B claim volume 2.3x after two ANDA launches without adding a single contracts FTE. Recapture caught the 80% that's pattern-matching; the team handled the judgment calls.",
    },
  ],
  caseStudies: {
    CEO: `CEO STORIES (Scale + Recovery):
- Elite Pharmaceuticals (Northvale, NJ, specialty generic, controlled substances): Replaced spreadsheet-based chargeback processing with AI claim-matching engine, NLP contract repository, automated dispute workflow, and direct credit-memo posting to ERP.
- Specialty generic manufacturer ($55M): Doubled chargeback volume after 3 ANDA approvals — same headcount, 2.3x volume processed, $1.8M in recovered leakage in year one.
- Positioning: "Double the business without doubling the team. Pricing scales with outcomes, not seats."`,
    CFO: `CFO STORIES (GTN + Audit + Reserves):
- Generic pharma manufacturer ($65M, NJ): Reserve variance dropped from 12% to under 2%, clean audit opinion the following year.
- Specialty pharma ($40M, post-recap PE): Cleared 80% of $2.3M aged dispute backlog in 6 weeks.
- Positioning: "You're leaking 5-10% of chargeback value. We find it, stop it, and only bill you when we do."`,
    CONTRACTS: `DIRECTOR CONTRACTS & CHARGEBACKS STORIES:
- Specialty generic ($50M): NLP ingested every signed contract PDF — new hire productive in 2 weeks instead of 6 months.
- Pharma manufacturer ($45M): Auto-validated 80% of 844 exceptions; team handles the 20% that require judgment.
- Positioning: "The system handles the 80% that's pattern-matching. You handle the judgment calls."`,
    OPS: `OPERATIONS / PE OPERATING PARTNER STORIES:
- PE-backed specialty pharma ($55M): Close-ready accrual within 5 business days of period end.
- Specialty injectable ($35M): Nteli automated contract setup, eligibility validation, and dispute drafting — launch went smoothly.`,
    CRO: `Recapture Reference: Elite Pharmaceuticals + 4 specialty generic deployments. Priced 1/3 the cost and 1/3 the timeline of Model N and IntegriChain.`,
    COO: '',
  },
  defaultPains: [
    'Chargeback / ship-debit leakage (5-10% typical)',
    'GTN variance and reserve accuracy',
    '844 exception processing volume',
  ],
  fitDimensionLabels: { revenue: 'Revenue', channel: 'Channel', ta: 'TA', compete: 'Compete', signals: 'Signals' },
  productLineDescription: `Recapture — a real-time 340B chargeback validation engine that
catches the 4 leaks Model N/Vistex/IQVIA weren't designed for: OPAIS-terminated
CEs, unauthorized contract pharmacies, manufacturer policy violations,
duplicate Medicaid. Priced at 5-10% of verified recovery.`,
}

// ──────────────────────────────────────────────────────────────────────
// CRM↔ERP (distributor-channel manufacturers — semis / electronics / industrial)
// ──────────────────────────────────────────────────────────────────────
const CRM_ERP: ProductConfig = {
  id: 'crm_erp',
  name: 'CRM↔ERP',
  shortLabel: 'CRM-ERP',
  shortPitch: 'CRM↔ERP is the system that lives between your CRM and ERP for distributor-channel manufacturers. Ship & debit, design registrations, channel inventory, claims, rev rec — deployed in 3-4 weeks.',
  badgeColor: 'bg-purple-bg text-purple',
  highVerticalKeywords: [
    'semiconductor', 'electronics', 'distributor', 'channel',
    'design registration', 'fabless', 'oem', 'industrial automation',
    'lighting', 'iot hardware', 'sensor', 'analog', 'rf', 'mcu',
    'power management', 'connector', 'component',
  ],
  lowVerticalKeywords: [
    'consumer', 'cosmetic', 'pharmaceutical', 'biotech', 'service',
    'oncology', 'hospital', 'specialty pharma', 'controlled substance',
  ],
  competitors: ['Vistex', 'Vendavo', 'Model N', 'Nexlinx', 'CTSI'],
  competitorPenaltyAtMegaCap: 30,
  publicCompanyAtMegacapScore: 40,
  midMarketCompetitorScore: 85,
  revenueBands: [
    { match: /25m-75m/, score: 100 },
    { match: /75m-200m|\$75m/, score: 95 },
    { match: /200m-500m|\$200m|\$500m(?!\+)/, score: 75 },
    { match: /10m-25m|\$10m/, score: 70 },
    { match: /500m\+|\$500m\+|500m-1b/, score: 30 },
    { match: /\$1b(?!\+)/, score: 20 },
    { match: /1b\+|\$1b\+|\$2b|\$4b/, score: 10 },
    { match: /b\+|\$10b/, score: 5 },
    { match: /< \$10m|< 10m/, score: 20 },
  ],
  highValueSignals: [
    'design_win',
    'distributor_expansion',
    'erp_migration',
    'channel_ops_hiring',
    'merger_and_acquisitions',
    'new_product',
    'supply_chain_hiring',
  ],
  personas: [
    {
      persona: 'VP Channel Operations',
      role_titles: [
        'vp channel', 'vp channel ops', 'director channel',
        'channel operations', 'head of channel', 'channel sales operations',
      ],
      hook: "Your distributor POS reports come in on a Monday and your team spends two days reconciling them against the design registrations in CRM before anything posts to ERP.",
      insight: "CRM↔ERP collapses that into a nightly batch. Design wins flow from CRM, POS lands from your distributors, ship & debit and rev rec post directly to your ERP — no spreadsheets in the middle.",
      ask: "20 minutes to walk through how a real customer cut their channel-ops headcount in half while doubling design-registration throughput.",
      case_study: "Mid-market analog component maker ($120M, 4 distributors): replaced 3 weekly spreadsheets and a Vistex add-on with our pipe. Ship & debit close went from 9 business days to 2.",
    },
    {
      persona: 'VP Sales / Sales Operations',
      role_titles: [
        'vp sales', 'vp sales ops', 'director sales operations',
        'rev ops', 'revenue operations', 'cro', 'chief revenue',
      ],
      hook: "Your reps log a design win in Salesforce and then your channel team has to manually tag the corresponding distributor SKUs so the ship & debit credit posts to the right account.",
      insight: "CRM↔ERP makes the design-registration → SKU → ship-debit chain automatic. The rep gets credit the day the part ships, not 90 days later when finance gets to it.",
      ask: "15 minutes to show you what a real design-win-to-credit pipeline looks like in flight.",
      case_study: "Fabless semi co ($80M, 6 distributors): reps were waiting 60-90 days for design-win attribution. Now it lands in their pipeline view in 24 hours of distributor POS load.",
    },
    {
      persona: 'CFO / Controller',
      role_titles: [
        'cfo', 'chief financial officer', 'controller',
        'vp finance', 'evp cfo', 'director finance',
      ],
      hook: "Your auditors flag the channel-inventory reserve every quarter because your distributor POS data and your ERP shipment data don't tie out cleanly.",
      insight: "CRM↔ERP gives you a single source-of-truth ledger between distributor POS, ship & debit credits, and channel-inventory reserves. ASC 606 rev rec falls out of it cleanly.",
      ask: "20 minutes to walk you through the rev-rec ledger and show what your last quarter's variance would have looked like through it.",
      case_study: "Industrial sensor maker ($150M, 5 distributors): channel-inventory reserve variance dropped from 8% to under 1.5%. Auditor sign-off in week 1 of close instead of week 4.",
    },
    {
      persona: 'VP Supply Chain / Operations',
      role_titles: [
        'vp supply chain', 'vp operations', 'coo', 'director supply chain',
        'head of operations',
      ],
      hook: "Your distributor partners want better visibility into your forecast and your ERP doesn't speak directly to their POS systems.",
      insight: "CRM↔ERP includes a distributor-facing channel inventory and forecast portal that runs off your existing ERP. No new master data to maintain.",
      ask: "15 minutes to show you what your top distributor would see if they logged into our channel portal tomorrow.",
      case_study: "Power-management chip maker ($95M): cut order-confirmation response time to distributors from 48 hours to under 4. Distributor NPS up 22 points in 6 months.",
    },
  ],
  caseStudies: {
    CEO: `CEO STORIES (Scale + Channel Visibility):
- Mid-market analog component maker ($120M, 4 distributors): replaced 3 weekly spreadsheets + a Vistex add-on with our pipe. Ship & debit close went from 9 days to 2.
- Fabless semi co ($80M): reps now get design-win attribution in 24 hours instead of 60-90 days.`,
    CFO: `CFO STORIES (Channel Inventory + Rev Rec):
- Industrial sensor maker ($150M): channel-inventory reserve variance dropped from 8% to under 1.5%. ASC 606 rev rec lands clean.
- Power-management chip maker ($95M): close compressed by 4 business days after eliminating manual POS reconciliation.`,
    CONTRACTS: `CHANNEL OPS / DESIGN REG STORIES:
- Connector maker ($60M, 3 distributors): design-registration approval cycle dropped from 7 days to overnight. Distributors stopped routing around the program.
- Lighting controls ($45M): ship & debit dispute backlog cleared in 3 weeks (from 6 months) after auto-matching POS to registrations.`,
    OPS: `SUPPLY CHAIN / DISTRIBUTOR PORTAL STORIES:
- Power-management chip maker ($95M): order-confirmation SLA to distributors went from 48h to <4h. Distributor NPS +22 points.
- Sensor maker ($110M): forecast accuracy at the distributor SKU level improved from ±18% to ±5% within 90 days of go-live.`,
    CRO: `CRM↔ERP Reference: 8 deployments at $25M-$200M distributor-channel manufacturers. Replace Vistex / Vendavo / spreadsheets at 1/3 the cost and 3-4 week deploy.`,
    COO: '',
  },
  defaultPains: [
    'Spreadsheets between distributor POS and revenue release',
    'Quarterly ship & debit fire-drill at close',
    'Design wins lost between CRM and ERP',
    'Channel-inventory reserve variance flagged by auditors',
  ],
  fitDimensionLabels: { revenue: 'Revenue', channel: 'Channel', ta: 'Industry', compete: 'Compete', signals: 'Signals' },
  productLineDescription: `CRM↔ERP — the integration platform that lives between your CRM and ERP
for distributor-channel manufacturers. Design Registrations, Ship & Debit,
Channel Inventory, Claims, and Revenue Recognition. Replaces Vistex /
Vendavo / spreadsheets. 3-4 week deploy.`,
}

export const PRODUCTS: Record<ProductId, ProductConfig> = {
  recapture: RECAPTURE,
  crm_erp: CRM_ERP,
}

export const PRODUCT_IDS: ProductId[] = ['recapture', 'crm_erp']

// Pick the best persona match across the product's persona library.
// Falls back to the CFO persona (index 2) if no title keywords match.
export function pickPersonaForProduct(productId: ProductId, contactTitle: string) {
  const product = PRODUCTS[productId]
  const t = (contactTitle || '').toLowerCase()
  for (const p of product.personas) {
    if (p.role_titles.some(k => t.includes(k))) return p
  }
  return product.personas[2] || product.personas[0]
}
