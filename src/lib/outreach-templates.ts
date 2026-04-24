// Persona-specific outreach templates for Recapture
// Each template is plugged into the Claude prompt as the messaging backbone.
// Based on the Apexus / Vizient JD mirror and the CFO objection cheat sheet.

export interface OutreachTemplate {
  persona: string
  role_titles: string[]   // job-title keywords to match contacts to persona
  hook: string            // first-email opener (≤2 sentences)
  insight: string         // 1-sentence domain proof
  ask: string             // the specific meeting ask
  case_study: string      // which reference story to pull in
}

export const PERSONAS: OutreachTemplate[] = [
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
]

// Match a contact to the best persona by title keywords
export function pickPersona(contactTitle: string): OutreachTemplate {
  const t = (contactTitle || '').toLowerCase()
  for (const p of PERSONAS) {
    if (p.role_titles.some(k => t.includes(k))) return p
  }
  return PERSONAS[2] // default to CFO
}
