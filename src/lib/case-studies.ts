// Case studies for specialty pharma chargeback / ship & debit / GTN pain
// Reference customer: Elite Pharmaceuticals (Northvale, NJ)
export const CASE_STUDY_KB: Record<string, string> = {
  CEO: `CEO STORIES (Scale + Recovery):
- Elite Pharmaceuticals (Northvale, NJ, specialty generic, controlled substances): Replaced spreadsheet-based chargeback processing with AI claim-matching engine, NLP contract repository, automated dispute workflow, and direct credit-memo posting to ERP. Built the layer their CRM and ERP both assumed existed.
- Specialty generic manufacturer ($55M): Doubled chargeback volume after 3 ANDA approvals — the contracts team was about to double too. After Nteli: same headcount, 2.3x volume processed, $1.8M in recovered leakage in year one.
- Key stat: Mid-market specialty pharma leaks 5-10% of chargeback value to preventable errors. On a $50M revenue book, that's $1M-$3M/year. Our pricing captures 15% of verified recovery in year one — the system pays for itself.
- Positioning: "Double the business without doubling the team. Pricing scales with outcomes, not seats."`,

  CFO: `CFO STORIES (GTN + Audit + Reserves):
- Generic pharma manufacturer ($65M, NJ): Auditors flagged GTN accrual methodology — couldn't reconcile chargeback reserves against actual credit memos from Cardinal. After Nteli: reserve variance dropped from 12% to under 2%, clean audit opinion the following year.
- Specialty pharma ($40M, post-recap PE): New CFO walked into $2.3M in aged wholesaler disputes from the prior regime. Nteli's AI-drafted dispute workflow cleared 80% of backlog in 6 weeks. The rest were valid — and known.
- Key stat: 62% of specialty pharma CFOs rate their chargeback accrual as "directionally correct but not auditable." IRA Medicare negotiation exposure is making this worse, not better.
- Positioning: "You're leaking 5-10% of chargeback value. We find it, stop it, and only bill you when we do."`,

  CONTRACTS: `DIRECTOR CONTRACTS & CHARGEBACKS STORIES:
- Specialty generic ($50M): Contracts analyst quit — took 18 months of institutional knowledge on SPA nuances. Nteli's NLP ingested every signed contract PDF, extracted pricing tiers, eligibility rules, and 340B flags. New hire was productive in 2 weeks instead of 6 months.
- Pharma manufacturer ($45M): Drowning in 844 exceptions — Cardinal, McKesson, Cencora each sending 200+ disputed claims per month. Nteli auto-validated 80% of them against contract terms. Team handles the 20% that require judgment.
- Key stat: Average specialty pharma contracts team processes 10,000+ chargeback claims per quarter manually. 38% have pricing or eligibility errors. Automated validation catches them before credit memo posting.
- Positioning: "The system handles the 80% that's pattern-matching. You handle the judgment calls."`,

  OPS: `OPERATIONS / PE OPERATING PARTNER STORIES:
- PE-backed specialty pharma ($55M, year 2 of hold): Chargeback accrual inaccuracy was blocking quarterly reporting and delaying the operating partner's visibility into portfolio performance. Nteli gave them close-ready accrual within 5 business days of period end.
- Specialty injectable ($35M): Hospital IDN contracts were manually maintained in Excel. When a new launch doubled claim volume, the back office broke. Nteli automated contract setup, eligibility validation, and dispute drafting — launch went smoothly.
- Key stat: Ship & debit volume growth outpaces back-office hiring by 3:1 at growth-stage specialty pharma. Nteli's AI claim validation handles the volume without adding heads.`,

  // Legacy keys for backward compat with components that reference them
  CRO: `SPECIALTY PHARMA STORIES (All Personas):
- Elite Pharmaceuticals (reference customer): AI claim-matching + NLP contracts + automated disputes + direct ERP posting. Went from spreadsheets to close-ready in 14 weeks.
- Generic manufacturer ($50M): Recovered $1.8M in year one. Nteli's fee was 15% of verified recovery — the system paid for itself in quarter two.
- Positioning by buyer: CFO = "GTN variance + clean audit." Contracts Director = "80/20 automation." CEO/PE = "Scale without hiring."
- Priced 1/3 the cost and 1/3 the timeline of Model N and IntegriChain.`,
  COO: '',
}
