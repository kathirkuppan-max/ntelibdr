# The Leak Ledger — ROI Video Series & Demo Formula

**The principle (Kathir, 2026-10-20): the high level for ANY product demo is a leak ledger.**
Every demo — vertical demos, ROI episodes, live sales demos, the eventual onboarding flow —
opens by itemizing where that audience's revenue leaks, in dollars, before anything is shown.
The demo is then the ledger being closed line by line: each engine action (config check,
discount policy, three-way match, rev-rec schedule) retires a ledger line. The quote total
at the end is the proof.

Demo skeleton, universally:
1. **The ledger** — 3–5 leak lines with dollars for this vertical/audience (≤15s)
2. **The close** — the engine working; each beat visually ticks a ledger line
3. **The receipt** — final number + "every line traceable" + CTA

This file's episodes are the per-leak deep dives; the 13 vertical demos are per-vertical
instances of the same formula. Future renders of the vertical demos should adopt the
ledger open (current renders open on the quote title card).

Each episode below opens one revenue leak, shows where it hides in a $200M company,
puts a defensible number on it, and closes with the fix. Build the bunch, then test
delivery by audience (see matrix at the bottom).

---

## Format spec (match the existing 13 demos)

| Element | Spec |
|---|---|
| Length | 60–90s final cut (silences pre-trimmed — lesson from the demo batch) |
| Resolution | 1920×1080, 30fps, h264+aac |
| Brand frame | `nteli QUOTING` top-left · episode label top-right (mono, caps) |
| Opening | Cold-open hook line on screen ≤8s — the dollar number appears in gold |
| Voiceover | Carries the argument; on-screen text is numbers + labels only |
| End card | One CTA line + deep link (varies by audience — see matrix) |
| File naming | `nteli-roi-<slug>.mp4` → uploads to `/media/` |
| Playback | Site plays at 1.25×; pace VO accordingly (slightly deliberate) |

**Hook formula (every episode):**
> "A $200M [vertical] manufacturer was losing $[X] a [quarter/year] in [leak area].
> Nobody could see it, because it never looked like a loss."

**Claims hygiene:** unnamed "$200M manufacturer" framing = composite, fine for public use.
Name a company ONLY with signed reference rights. Currently referenceable: **Elite Pharmaceuticals**
(episode 4 can be the named flagship). Navitas: NOT referenceable — never name.
Every on-screen stat should trace to the math block in its episode or a citable industry benchmark.

---

## The episodes

### EP1 — Quoting (the flagship)
**Leak:** configuration errors, rogue discounts, spreadsheet estimators quoting from stale price books.
**Where it hides:** the quote *closed*, so it looks like a win. The margin was lost at configuration time.
**ROI math ($200M co):** $80M quoted-config revenue × 2–4% config/discount error × ~60% unrecoverable
→ **$1.0–1.9M/yr**. On-screen: `$80M quoted × 3% error = $2.4M exposed → $1.4M lost`.
**The fix beat:** deterministic engine — invalid configs blocked, discounts from policy, every number from rules.
**CTA/link:** `/engine` (self-serve audience) or `/cpq` (Salesforce buyer).
**Script skeleton (to set series voice):**
1. (0–8s) HOOK: "A $200M equipment manufacturer lost $1.4M last year on quotes they *won*."
2. (8–25s) ANATOMY: veteran estimator quotes from memory; new rep quotes from hope. The config
   that can't be built; the discount nobody approved; freight guessed. Each ships as a win.
3. (25–45s) NUMBER: the math appears line by line (quoted revenue → error rate → unrecovered).
4. (45–70s) FIX: engine Q&A montage — invalid option blocked *with the reason*, price assembled
   from rules, "why not X?" answered. "Same inputs, same number. Every time."
5. (70–85s) CTA: "Watch it quote your products — nteli.io/engine."

### EP2 — Orders (quote-to-order handoff)
**Leak:** re-keying quotes into the ERP; configuration fidelity lost between CPQ and order entry.
**Where it hides:** the order "matches" the quote — until options, UOMs, or discounts silently differ.
**ROI math:** 6,000 orders/yr × 2% re-key discrepancy × $1,800 avg correction/concession → **~$220K/yr**
+ the unmeasured one: a mis-entered config that ships wrong (one $40K RMA pays for the year).
**Fix beat:** quote → order without translation (CRM↔ERP sync; the number finance books is the number sales closed).
**CTA/link:** `/erp`.

### EP3 — Revenue Recognition (ASC 606)
**Leak:** manual SSP allocation in Excel, schedules rebuilt at close, bundled performance obligations misallocated.
**Where it hides:** not in lost cash — in *restated* revenue, audit fees, and a close that takes days.
**ROI math:** close team 5 people × 4 days/mo fire-drill × loaded cost → **~$180K/yr of close labor**,
plus audit overrun and the unquantifiable: CFO confidence. (This episode sells pain relief, not recovered dollars.)
**Fix beat:** rev-rec schedules built where the quote was born; auditable on demand; close in hours.
**CTA/link:** `/saas` (Q2C) or `/erp`.

### EP4 — Channel Claims (THE NAMED ONE — Elite Pharmaceuticals, pending number sign-off)
**Leak:** chargebacks / Ship & Debit claims posted to GL without a three-way match.
**Where it hides:** AP pays claims; nobody reconciles claim ↔ contract ↔ POS. Site canon: **5–15% of channel revenue**.
**ROI math:** $60M channel revenue × 5% unvalidated-claim leakage × 40% recoverable → **$1.2M/yr recovered**.
**Fix beat:** every claim validated against DEA license / class-of-trade / contracted price before payment.
**CTA/link:** `/pharma` (pharma cut) and a `/semi` cut with Ship & Debit vocabulary — same skeleton, two renders.

### EP5 — Billing
**Leak:** delivered-but-unbilled milestones, usage under-billing, credit memos issued without basis.
**ROI math:** 1.5% of $200M billed late by avg 45 days → **$370K/yr financing cost at 10% WACC** + 0.3% never billed at all = $600K.
**Fix beat:** billing triggered by the same record the quote and order live on.
**CTA/link:** `/erp`.

### EP6 — Renewals & Subscriptions
**Leak:** uplift clauses not applied, co-terms done by hand, expansion events missed.
**ROI math:** $40M renewal base × 3% uplift contractually owed × half never applied → **$600K/yr**.
**Fix beat:** renewal events fired from contract data, not rep memory.
**CTA/link:** `/saas`.

### EP7 — Partner Incentives & MDF
**Leak:** rebates and MDF "paid on trust"; tier discounts granted without tier compliance.
**ROI math:** $5M partner incentive pool × 10–20% unvalidated → **$500K–1M/yr exposure**.
**Fix beat:** claims validated in the portal before finance sees them.
**CTA/link:** `/prm`.

### EP8 — Tax on Channel Revenue
**Leak:** S&D claims and rebates change the tax basis after filing; certs expire silently.
**ROI math:** penalty + amended-return cost + over-remitted tax on unadjusted basis → **$150–400K/yr** (+audit risk).
**Fix beat:** claim data wired into AvaTax; the basis is the *post-claim* number.
**CTA/link:** `/tax`.

### EP9 — Pricing Drift
**Leak:** invoiced price erodes vs. contracted price across renewals, acquisitions, and "just this once" exceptions.
**ROI math:** 1% drift on $200M → **$2M/yr** (the biggest number in the series — great cold-open).
**Fix beat:** every price traceable to a rule; exceptions need an approver, and the audit trail remembers.
**CTA/link:** `/engine` or `/cpq`.

### EP10 — The Month-End Fire Drill (compilation/anthem piece)
**Leak:** all of the above arriving at once, every month. The 90-second "why Nteli exists" brand film.
**Structure:** rapid intercut of EP1–EP9 one-liners → "Wherever revenue leaks, it's the same pattern." → firm CTA.
**CTA/link:** `/` (homepage) — this one doubles as the site hero film later.

---

## Audience × delivery test matrix

| Audience | Open with | Episodes | End-card link | Channel |
|---|---|---|---|---|
| CFO / VP Finance | the dollar number | EP9, EP3, EP5, EP10 | `/` or `/erp` | Email T3+, LinkedIn |
| RevOps / Sales Ops | the broken workflow | EP1, EP2, EP6 | `/engine`, `/cpq` | Email T1 (thumbnail kit) |
| Sales leader | won-deal margin loss | EP1, EP9 | `/engine` | LinkedIn, ABM |
| Channel/commercial leader (semi) | 5–15% stat | EP4-semi, EP7 | `/semi` | ABM thumbnails |
| Pharma compliance/finance | audit risk | EP4-pharma (named Elite), EP8 | `/pharma` | ABM + named reference |
| Self-serve engine prospects | "watch it quote" | EP1 + their vertical demo | `/engine/<vertical>` | Thumbnail kit |

**Testing protocol:** one variable per send — same episode, different audience; or same audience,
different episode. UTM pattern already live: add `utm_content=roi-ep1-cfo` style tags per cut.
Touch 1 always Streak-tracking OFF (non-negotiable); the deep-link click IS the signal.

**Per-prospect thumbnails:** reuse the `PREPARED FOR <Company>` card pattern →
`/media/thumb-<company>.jpg` → deep link to the episode landing. Note: the FDE framing is dead
(Kathir, 2026-10-20: "no forward deployed! we are building a full MCP") — next render batch
replaces the "forward-deployed estimator" tagline; candidate: "An AI estimator on a checked
quoting engine — works with Claude via MCP."

---

## Production order (highest test-value first)

1. **EP1 Quoting** — flagship, works for every audience, feeds self-serve funnel
2. **EP9 Pricing Drift** — biggest number, best CFO cold-open
3. **EP4 Channel Claims** — two cuts (pharma named + semi), proven site stat
4. **EP3 Rev Rec** — completes the Quoting → Orders → Rev Rec arc the user named
5. **EP2 Orders** — pairs with EP1 as a sequence
6. EP6, EP7, EP5, EP8, EP10 as the library fills out

Site integration when ready: an `/roi` or "Resources" strip on the engine page using the same
pill-switcher pattern as the 13 demos; episodes also embeddable per practice page.
