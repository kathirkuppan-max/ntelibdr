# Pricing flip checklist — run when BOTH directory reviews are approved

Decided by Kathir 2026-10-29: fixed onboarding (sized by quoting complexity) + flat monthly,
REPLACING the success fee (0.5% / $1,500 cap) entirely. Until both the Claude directory and
ChatGPT reviews clear, the public story stays "free to use, paid only when an order is won"
(reviewers verified that wording). /pricing already carries the new model (noindex) with a
bridge note grandfathering early-access workspaces.

## Numbers still needed from Kathir (page ships without them)
- Onboarding fee per tier (Flat catalog / Configured products / Engineered systems)
- Monthly fee per tier
- Whether a free trial window survives the flip (recommended: yes, time-boxed)

## On flip day (Asset Building session)
1. /pricing: remove noindex, add to sitemap + nav/footers; drop the bridge note or reword.
2. /claude pricing block: replace "Free to use… 0.5%… $1,500" with the fixed model (+ flip
   connect wording to directory per the separate approval instruction).
3. Site-wide CTA pricing line ("Free to use — Nteli is paid only when an order is won
   through it") on /engine + 15 vertical pages + both /guides pages: replace with
   "Fixed price, sized by your quoting complexity — see pricing." linking /pricing.
4. llms.txt: pricing fact line + docs "What it costs" section + support FAQ answer + FAQPage
   schema on support.html.
5. terms.html §3: rewrite from success-fee to fixed onboarding + monthly (billing terms).
6. privacy.html: "fees apply only to orders won" line → metering wording.
7. benchmarks/roi pages: unaffected (no pricing claims).
8. Re-ping IndexNow + resubmit sitemap in GSC.

## Engine session owns (confirmed by engine session 2026-10-29; all HELD until both approvals + Kathir's tier amounts)
1. Claude directory listing copy (`engine/docs/directory-listing.md` as submitted): "Free to use,
   no card: Nteli earns 0.5%… (at most $1,500)" + payments note "billed outside it" — edit after approval.
2. Connector tool `fee_statement` (part of the REVIEWED tool surface): description says "nothing for
   using it; a small share of each order…". Post-flip it becomes an account statement (onboarding +
   monthly) or is retired. This is a CONNECTOR CHANGE → batch it with the other held connector changes
   (server-name alignment, archive tool) as ONE new review version, never a separate resubmission.
3. Sign-up and web app copy (`selfserve/web.py` ~lines 100, 165): "Free to use… 0.5% of each order
   you win (at most $1,500)" — reviewers saw it during sign-up; rewrite at flip.
4. Billing code: fee ledger + mark-won fee accrual (what fee_statement reports on) replaced by
   fixed + monthly invoicing.
- Reviewer Q&A mid-review: answer with current live terms — they remain true until the flip.
- ChatGPT plugin package files contain no fee mention (verified).
