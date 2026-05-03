import type { Account } from './types'

// Texas semiconductor / electronics universe for the CRM↔ERP product.
// Curated list (Apr 2026) of mid-market chip + RF + power semis in greater
// Austin (plus Tagore in Arlington). Each company has high distributor
// reliance and either low or emerging ship & debit maturity — i.e. they
// are exactly where the CRM↔ERP product slots in.
//
// IDs start at 1001 to stay clear of the Recapture seed range (1-40).
// Every account is tagged products: ['crm_erp'].
//
// Columns of context we preserve in `notes` so the rep can read distributor
// model, S&D maturity, and ERP/CRM stack inline.

const RAW_SEMI_ACCOUNTS: Omit<Account, 'products'>[] = [
  {
    id: 1001, company: 'Ambiq Micro', city: 'Austin, TX', market: 'Texas',
    vertical: 'Fabless Semiconductor · Ultra-Low-Power MCU', rev: '$75M–$200M', emp: '230',
    priority: 'High', pe: false, ownership: 'NYSE: AMBQ',
    pains: [
      'Distributor reliance high · S&D maturity low — manual POS reconciliation',
      'IoT scale-up is outrunning the channel-finance team',
      'NetSuite ERP, Salesforce CRM not integrated for design-reg workflow',
    ],
    cxo: 'CFO + VP Worldwide Sales', website: 'ambiq.com', liSearch: 'ambiq micro',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'ipo_announcement', title: 'Ambiq IPO completed — public-company controls now in scope', date: '2026-01-30' },
      { type: 'distributor_expansion', title: 'New distribution agreement signed for IoT modules', date: '2026-03-04' },
    ],
    notes: 'Tier 1. Distributor model: High. S&D maturity: Low. ERP: NetSuite. CRM: Salesforce/None. Why: Scaling IoT player with distributor reliance and likely manual POS reconciliation.',
  },
  {
    id: 1002, company: 'Atmosic Technologies', city: 'Austin, TX', market: 'Texas',
    vertical: 'Fabless Semiconductor · Low-Power Wireless / IoT', rev: '$25M–$75M', emp: '95',
    priority: 'High', pe: true, ownership: 'Privately held (Series B)',
    pains: [
      'Channel dependency heavy — no mature rebate or design-reg system',
      'HubSpot CRM, no formal ERP for ship & debit yet',
      'Design-win attribution latency frustrating sales reps',
    ],
    cxo: 'CFO + VP Sales', website: 'atmosic.com', liSearch: 'atmosic technologies',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'design_win', title: 'Atmosic powering low-energy beacon design at industrial OEM', date: '2026-03-10' },
    ],
    notes: 'Tier 1. Distributor model: High. S&D maturity: Low. ERP: NetSuite. CRM: HubSpot/None. Why: Competes in IoT with heavy channel dependency and no mature rebate systems.',
  },
  {
    id: 1003, company: 'Everspin Technologies', city: 'Austin, TX', market: 'Texas',
    vertical: 'Fabless Semiconductor · MRAM Memory', rev: '$25M–$75M', emp: '110',
    priority: 'High', pe: false, ownership: 'NASDAQ: MRAM',
    pains: [
      'Industrial + distributor mix with growing pricing complexity',
      'Oracle / NetSuite hybrid ERP — chargeback flows brittle',
      'Memory pricing volatility makes ship-debit accruals hard',
    ],
    cxo: 'CFO + VP Sales', website: 'everspin.com', liSearch: 'everspin technologies',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'new_product', title: 'Everspin announces 1Gb STT-MRAM for industrial systems', date: '2026-02-25' },
    ],
    notes: 'Tier 1. Distributor model: High. S&D maturity: Medium. ERP: Oracle/NetSuite. CRM: Salesforce. Why: Industrial + distributor mix with growing pricing complexity.',
  },
  {
    id: 1004, company: 'Tagore Technology', city: 'Arlington, TX', market: 'Texas',
    vertical: 'Fabless Semiconductor · RF Power', rev: '$25M–$75M', emp: '60',
    priority: 'High', pe: true, ownership: 'Privately held',
    pains: [
      'Classic RF distributor model with manual pricing approvals',
      'No CRM today — pricing approvals run through email + spreadsheet',
      'Design-reg + S&D credit cycle entirely manual',
    ],
    cxo: 'CFO + VP Sales', website: 'tagoretechnology.com', liSearch: 'tagore technology',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'distributor_expansion', title: 'Tagore signs new RF distributor for North America', date: '2026-03-02' },
    ],
    notes: 'Tier 1. Distributor model: High. S&D maturity: Low. ERP: NetSuite. CRM: None. Why: Classic RF distributor model with manual pricing approvals.',
  },
  {
    id: 1005, company: 'Uhnder', city: 'Austin, TX', market: 'Texas',
    vertical: 'Fabless Semiconductor · Automotive Radar', rev: '$10M–$25M', emp: '180',
    priority: 'High', pe: true, ownership: 'Privately held (Series D)',
    pains: [
      'Automotive Tier-1 programs will introduce complex pricing & rebates soon',
      'No CRM — design-win pipeline tracked in spreadsheets',
      'Multi-year design cycle has zero visibility into ship & debit credits',
    ],
    cxo: 'CFO + VP Operations', website: 'uhnder.com', liSearch: 'uhnder',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'design_win', title: 'Uhnder digital radar design-in at major Tier-1', date: '2026-03-25' },
      { type: 'new_funding_round', title: 'Series D extension closed — ramping for SOP', date: '2026-02-08' },
    ],
    notes: 'Tier 1. Distributor model: Medium-High. S&D maturity: Low. ERP: NetSuite. CRM: None. Why: Automotive programs will introduce complex pricing and rebates soon.',
  },
  {
    id: 1006, company: 'Anokiwave', city: 'Austin, TX', market: 'Texas',
    vertical: 'Fabless Semiconductor · mmWave ICs', rev: '$25M–$75M', emp: '120',
    priority: 'Medium', pe: true, ownership: 'Privately held',
    pains: [
      'Defense + telecom channel mix with emerging distributor motion',
      'No CRM — design-reg requests handled by AE inbox',
      'Pricing approvals routed manually for each opportunity',
    ],
    cxo: 'CFO + VP Sales', website: 'anokiwave.com', liSearch: 'anokiwave',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'new_product', title: 'Anokiwave releases new Ka-band beamforming IC', date: '2026-02-19' },
    ],
    notes: 'Tier 2. Distributor model: Medium. S&D maturity: Low. ERP: NetSuite. CRM: None. Why: Defense + telecom channel mix with emerging distributor motion.',
  },
  {
    id: 1007, company: 'Flex Logix', city: 'Austin, TX', market: 'Texas',
    vertical: 'Fabless Semiconductor · AI / FPGA', rev: '$25M–$75M', emp: '85',
    priority: 'Medium', pe: true, ownership: 'Privately held',
    pains: [
      'Growing AI hardware company with ecosystem sales model',
      'No CRM — partner enablement tracked in shared Notion',
      'Pricing complexity ramping with first volume design wins',
    ],
    cxo: 'CFO + VP Sales', website: 'flex-logix.com', liSearch: 'flex logix',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'design_win', title: 'Flex Logix InferX selected for edge-AI defense program', date: '2026-03-18' },
    ],
    notes: 'Tier 2. Distributor model: Medium. S&D maturity: Low. ERP: NetSuite. CRM: None. Why: Growing AI hardware company with ecosystem sales model.',
  },
  {
    id: 1008, company: 'SiFive', city: 'Austin, TX', market: 'Texas',
    vertical: 'Semiconductor IP · RISC-V Processors', rev: '$75M–$200M', emp: '450',
    priority: 'Medium', pe: true, ownership: 'Privately held (Series F)',
    pains: [
      'Licensing + hardware revenue creates hybrid pricing complexity',
      'NetSuite / SAP split — channel ledger lives in spreadsheets',
      'Royalty + per-unit + design-reg flows compete for the same close',
    ],
    cxo: 'CFO + VP Sales', website: 'sifive.com', liSearch: 'sifive austin',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'new_product', title: 'SiFive launches new high-performance RISC-V core IP', date: '2026-03-05' },
    ],
    notes: 'Tier 2. Distributor model: Medium. S&D maturity: Low. ERP: NetSuite/SAP. CRM: Salesforce. Why: Licensing + hardware creates hybrid pricing complexity.',
  },
  {
    id: 1009, company: 'Ideal Power', city: 'Austin, TX', market: 'Texas',
    vertical: 'Fabless Semiconductor · Power (B-TRAN)', rev: '$10M–$25M', emp: '40',
    priority: 'Medium', pe: false, ownership: 'NASDAQ: IPWR',
    pains: [
      'Early-stage company building distributor relationships',
      'QuickBooks-based finance won\'t scale past the first $25M',
      'No formal channel program yet — first wins coming through reps',
    ],
    cxo: 'CFO + VP Sales', website: 'idealpower.com', liSearch: 'ideal power inc',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'new_product', title: 'Ideal Power qualifies B-TRAN for solid-state circuit breakers', date: '2026-02-12' },
    ],
    notes: 'Tier 2. Distributor model: Medium. S&D maturity: Low. ERP: QuickBooks. CRM: None. Why: Early-stage company building distributor relationships.',
  },
  {
    id: 1010, company: 'Mythic AI', city: 'Austin, TX', market: 'Texas',
    vertical: 'Fabless Semiconductor · AI Inference', rev: '$25M–$75M', emp: '120',
    priority: 'Medium', pe: true, ownership: 'Privately held (Series C)',
    pains: [
      'Emerging company likely to face channel complexity soon',
      'NetSuite ERP, no CRM — design wins tracked in custom Airtable',
      'Inference-chip volume ramp will swamp manual reconciliation',
    ],
    cxo: 'CFO + VP Channel Sales', website: 'mythic.ai', liSearch: 'mythic ai austin',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'design_win', title: 'Mythic M2000 selected for industrial vision design at top OEM', date: '2026-03-12' },
      { type: 'channel_ops_hiring', title: 'Hiring Director of Channel Operations (Austin)', date: '2026-02-22' },
    ],
    notes: 'Tier 3. Distributor model: Medium. S&D maturity: Low. ERP: NetSuite. CRM: None. Why: Emerging company likely to face channel complexity soon.',
  },
  {
    id: 1011, company: 'Nuvoton (US Ops)', city: 'Austin, TX', market: 'Texas',
    vertical: 'Semiconductor · Microcontrollers (US Ops)', rev: '$75M–$200M', emp: '320',
    priority: 'Medium', pe: false, ownership: 'TWSE: 4919 (US sub)',
    pains: [
      'Established but fragmented US channel operations',
      'SAP ERP at parent, US sub uses Salesforce — handshake brittle',
      'Distributor inventory visibility lags POS by weeks',
    ],
    cxo: 'US CFO + VP Channel', website: 'nuvoton.com/usa', liSearch: 'nuvoton us austin',
    stage: 'Prospect', source: 'curated', contacted: false,
    explorium_id: undefined,
    signals: [
      { type: 'distributor_expansion', title: 'Nuvoton expands MCU distribution agreement in North America', date: '2026-02-28' },
    ],
    notes: 'Tier 2. Distributor model: High. S&D maturity: Medium. ERP: SAP. CRM: Salesforce. Why: Established but fragmented US channel operations.',
  },
]

export const SEED_SEMICONDUCTORS: Account[] = RAW_SEMI_ACCOUNTS.map(a => ({
  ...a,
  products: ['crm_erp'],
}))
