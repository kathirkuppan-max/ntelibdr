# LinkedIn content strategy — founder voice, Leak Ledger engine (2026-11-03)

Owner: Kathir posts from his personal profile (LGM handles connect sequences
separately; Claude drafts everything; nothing posts without Kathir). Log each
published post in `gtm/linkedin-tracker.csv` (date, layer, topic, link, notes).

## Audience & job
Two readers, one post must serve at least one of them:
1. **Mid-market manufacturing operators** (CEO/COO/CFO/VP Sales Ops at 20–300-person
   configure-to-order shops) — the engine's buyers.
2. **RevOps / Salesforce ecosystem** — the services buyers and referrers.

The job is not reach; it's recognition: "this person has seen inside my quoting
desk." Every post names a mechanism (a leak, a rule, a check), never a platitude.

## Three layers

### L1 — Leak Ledger nuggets (2–3/week, the engine)
One ledger line per post. Formula, in order:
1. **Hook** — the leak stated as a felt experience, no numbers.
2. **Mechanism** — why it happens structurally (handoffs, tribal knowledge, PDF catalogs).
3. **The line** — the dollar figure from our illustrative model, always labeled
   (see Rails). One number per post, never the whole ledger (that's the demo's job).
4. **The close** — the specific check that catches it before the money moves.
5. **CTA rotation** — (a) none, (b) one vertical-page link in first comment,
   (c) the paste-prompt ("paste your last RFQ into Claude with our connector").
   Never two CTAs. Links go in the first comment, not the post body.

Ten-line source inventory (annual $K, illustrative Calder model — leak / recoverable):
| # | Ledger line | Leak | Actionable (lines 4, 6, 9, 10 = recoverable cash; the rest = preventable margin) |
|---|---|---|---|
| 1 | Wrong configurations reworked after the order | 412 | 338 |
| 2 | Required options and adders left off the quote | 286 | 251 |
| 3 | Discounting beyond peers on similar deals | 538 | 392 |
| 4 | Order-entry errors against the accepted quote | 174 | 161 |
| 5 | Orders won below the price quoted (e.g. D-24841, $8,400 under) | 221 | 168 |
| 6 | Invoices billed off the contract price (e.g. INV-310977, $1,165 off) | 196 | 172 |
| 7 | Pass-through costs absorbed, no surcharge applied | 143 | 119 |
| 8 | Service & spare parts quoted off the price book | 127 | 94 |
| 9 | Rebates and commissions overpaid | 264 | 211 |
| 10 | Channel deductions and chargebacks unrecovered | 318 | 233 |
Total: $2.679M leak / $2.139M recoverable per year in the model.

Ten lines × angle variations (per-vertical retelling, the VO script lines,
the "ways out" patterns) ≈ a quarter of L1 content before any repeat.

### L2 — Rules-move posts (1/week)
Condensed from the lane guides and vertical pages: NEC 450.26 and the four
priced ways out; DOE 2029 efficiency floors; ship-and-debit claims matched line
by line; UL 508A SCCR checking; IMC 514.2 refusals. These are the SEO flywheel's
LinkedIn face — each one ends with the guide link in the first comment.
Angle: "rules move from four directions; your quote desk absorbs them or leaks."

### L3 — Thought pieces (1–2/month)
The six from the pipeline, full piece on nteli.io, condensed 200-word version
as the post: (1) Leak Ledger stat piece [also the link magnet], (2) Agents run,
people govern, (3) What Cisco's configurator taught me about a 50-person panel
shop, (4) Rules move from four directions, (5) Your ERP is the system of record —
stop asking it to quote, (6) Price when money moves.

## Rails (non-negotiable)
- **Recoverable vs preventable**: only off-contract invoices, overpaid rebates, unsupported
  claims and orders entered below the quote are "recoverable cash". Discounts, rework, missed
  options and concessions are "preventable margin". Never call past discounts recoverable.
- **Illustrative labeling**: every Calder/Leak-Ledger number carries "from our
  illustrative mid-market model" (or equivalent) in the same post. No implied
  customer results. Benchmarks are "benchmark planning rates."
- Customer names: only Elite Pharmaceuticals and Aduro Advisors, only cleared facts.
- Engine claims: replay/versioning and governed rule changes — never "detects
  rule changes automatically."
- Rules IP: name the rule (NEC 450.26), never publish pack contents or structure.
- Voice: Kathir's — first person, configurator-architect pedigree earned not
  claimed, short declarative lines, no hashtag walls (0–2 max), no emojis.
- Visuals optional: dark nteli-standard cards via the slide pipeline
  (`gtm/g2-visuals/` pattern) when a post needs one; text-first by default.

## Cadence & workflow
- Claude drafts the week's batch each Monday (2 nuggets + 1 rules post) in
  `gtm/linkedin-drafts.md`; Kathir edits/approves/posts on his own schedule
  (suggested Tue/Thu nuggets, Wed rules post).
- Posted → Kathir says so → Claude logs to tracker and marks the ledger line used.
- Measurement: monthly — follower delta, post impressions (Kathir screenshots),
  profile→site clicks if visible in GSC referrals, inbound DMs. Kill or double
  a layer after 6 weeks of data, not before.

## First batch — six nuggets, ready to paste

### N1 (line 3 — the biggest leak)
Your best salesperson's discount isn't a price. It's a habit.
On similar deals, similar customers, similar volume — one rep goes 8% deeper
than the rest of the desk. Nobody sees it, because nobody benchmarks discounts
against peer deals at quote time.
In our illustrative mid-market model, discounting beyond peers is the single
largest leak: $538K a year. You can't claw back last year's discounts, but most of
next year's are preventable — not by saying no, but by showing the rep the peer band before the
quote goes out.
The expensive discounts aren't the approved ones. They're the invisible ones.

### N2 (line 1)
The most expensive quote is the one that wins — with the wrong configuration in it.
The order hits engineering, the configuration doesn't build, and now you're
reworking it at your cost because the PO is signed.
That's $412K a year in our illustrative model. The fix isn't more review
meetings. It's checking every configuration against your rules — cited, versioned,
before the quote leaves — so "it doesn't build" happens at draft, not at order.
Rework after the order is a pricing error wearing a production costume.

### N3 (line 2)
Estimators don't forget adders. Interfaces do.
The seismic bracing, the marine-duty coating, the spare-parts kit the spec
required on page 41 — left off the quote, discovered at delivery, eaten as
goodwill. $286K a year in our illustrative model, and it never looks like a
leak because each one is "just this once."
A rules engine prices required options in because the spec triggers them —
not because someone remembered page 41.

### N4 (line 5)
Deal D-24841 closed $8,400 under the quoted price. Nobody decided that.
The quote said one number, the order entered another, and the gap between them
had no owner. Multiply by a year of orders: $221K in our illustrative model.
Orders built *from* the accepted quote can't drift from it. Exceptions still
happen — but they go for approval with the margin in view, instead of
disappearing into order entry.

### N5 (line 6)
Invoice INV-310977 billed $1,165 off the customer's contract price. The customer
didn't call. They never do when the error favors them.
Off-contract invoicing runs $196K a year in our illustrative model — the
quietest leak on the ledger, because the deal is "done" and everyone's moved on.
Matching every invoice to the contract behind it isn't an audit project.
It's a join — if your quotes, orders and invoices share one deal ID.

### N6 (line 10 — semi/channel audience)
Your distributor's chargeback isn't wrong. It's just unverified.
Ship-and-debit claims arrive by the thousand, and the desk pays them because
checking each line against the contract price takes longer than the credit memo.
Unrecovered deductions and chargebacks: $318K a year in our illustrative model.
Every claim line matched to its contract — paid when it's right, disputed with
evidence when it isn't. The distributor relationship survives. The leak doesn't.

## Next batches
Lines 4, 7, 8, 9 → batch two. Then vertical retellings (same leak, panel-shop
telling vs pump-skid telling). L2 posts start with NEC 450.26 (the grid page's
"four priced ways out" is already written).
