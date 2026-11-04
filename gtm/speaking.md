# Speaking: the Leak Ledger methodology (2026-11-03)

Talk format (Kathir, 2026-11-03): the build is SELF-SERVED by the participants, the players
in the game. Kathir frames the method, then attendees drive it themselves on their own laptops:
raw CRM, ERP and claims exports in, an itemized dollar ledger out, and the check that closes
each line. Hands-on, game-like (teams race to find and close the most leak dollars), not a
stage demo. Ideas and examples are Kathir's (ten years of Cisco, Dell and
IBM configurator and pricing work); CFP submissions are Kathir's to send.

## Venues (verified from organizers' pages or listings, Nov 2026)

| # | Venue | Audience | Timing | How to apply | Fit |
|---|---|---|---|---|---|
| 1 | **Texas Dreamin'** (Austin) | Salesforce community: admins, architects, RevOps | 2026 ran July 9–10 in Austin; watch for 2027 | texasdreamin.org; Austin Trailblazer community groups | Home turf; CPQ end-of-sale migration angle |
| 2 | **Professional Pricing Society (PPS)** Spring and Fall conferences | Pricing leaders at manufacturers and distributors | Spring (Chicago, Apr 28–May 1, 2026 was last spring); Fall profitABLE (Atlanta, Oct 2026) | Calls for speakers run on Jotform from pricingsociety.com; speakers must co-market their talk on LinkedIn | Best audience fit: price realization, discount leakage, rebates |
| 3 | **RevOpsAF 2027 US** (RevOps Co-op) | RevOps practitioners | 2027, details "coming soon" | revopsaf.revopscoop.com/events/2027-revopsaf-us-conference | The essay's home audience |
| 4 | **Revenue Operations Alliance** events | RevOps and CRO audiences | Revenue Operations Summit (Austin listing); Revenue Operations Festival New York, July 8, 2027; CRO Summit Amsterdam, May 24, 2027 | Each event lists a call for speakers; deadlines unverified | Austin summit is local |
| 5 | **ECIA EDS Leadership Summit** (Las Vegas, usually May) | Electronics manufacturers, distributors and reps | 2027 call not yet found | ecianow.org, era.org | Ship-and-debit audience; pitch the distributor-claims talk |
| 6 | **Local Austin rooms** | Founders, operators, Salesforce users | Monthly | Capital Factory events; Austin Salesforce admin and marketer groups | Fastest to book; practice the talk here first |

Order: book a local room first (practice and footage), then PPS (best fit) and Texas
Dreamin' (home turf), then RevOpsAF and Revenue Operations Alliance as their 2027 calls open.

## Reusable abstract

**Title:** Revenue doesn't leak where you look: build your own leak ledger in one session

**Abstract (about 150 words):**
Every mid-market company has a CRM, an ERP, a billing process and a channel program, and each
looks fine on its own. The money leaks between them: discounts that run deeper than peer deals,
orders entered at a different price than the accepted quote, invoices billed off contract,
distributor claims paid unchecked. None of it shows on a single report, because every report is
drawn from one system's version of the truth.

In this hands-on session, Kathiravan Kuppan explains the method he uses in one-day workshops, and
then attendees do the build themselves. Working in teams on a realistic manufacturer's data set,
each team joins quotes, orders, invoices and claims on one deal ID, finds the leaks line by line,
puts a dollar figure on each, and applies the check that closes it. The team that recovers the
most wins. Finance people are welcome to try it in a spreadsheet: one table works the same
data in Excel, and the room sees exactly where the spreadsheet breaks (matching records that
share no ID, every line instead of a sample). Everyone leaves having built a ledger, with the
ten-line template to run on their own company.

**Takeaways:**
- Why revenue operations still runs on single entry, and what double entry looks like for revenue.
- The ten places revenue leaks between quote and cash, sized two ways: recoverable cash you can still
  collect, and preventable margin you can only stop going forward.
- How to build a first leak ledger yourself, from exports you already have, in a single session.

**Speaker bio (short):**
Kathiravan Kuppan spent ten years building product configurators and pricing systems at Cisco,
Dell and IBM. He is the founder and CEO of Nteli, a Salesforce Premier Partner in Austin that
builds quoting and revenue reconciliation for configure-to-order manufacturers.

## Variants by audience
- **PPS (pricing):** lead with discount leakage beyond peer deals and price realization.
- **Texas Dreamin' (Salesforce):** "Don't migrate your leaks": run the ledger before a CPQ to
  Revenue Cloud migration.
- **ECIA (distribution):** distributor claims: matching each line to EDI 867 resale data, design
  registrations and contracts, and disputing with evidence.
- **RevOps events:** the essay's argument, plus the live build.

## Running the self-serve build
- Each team gets its own copy of the fictional Calder demo workspace (demo.nteli.io), reset
  between sessions with `nteli.py demo-q2c` (reset), so players can't break each other's data.
- Never real customer data; every number labeled as an illustrative model.
- Scoreboard: dollars found and dollars closed per team. Check whether the workshop board (#119)
  can serve as the live leaderboard before building anything new.
- Ask organizers for: a room with tables, Wi-Fi, 60–90 minutes (a 30-minute slot only fits a
  demo), and attendees bringing laptops.

## Handling the "I can do this in a spreadsheet" objection (finance audiences)
- Agree first: the totals are easy. The ledger isn't arithmetic.
- The hard part is the join (quote, order, invoice and claim share no ID; distributor part numbers
  don't match master data), every line instead of a sample, and checks before the money moves.
- Separate recoverable cash from preventable margin before they do. Never call past discounts
  "recoverable".
- Don't defend Nteli's 3%. Place it beside MGI Research's framing (fixing leakage is worth 2-4%
  of revenue and cash flow), then: "the number that matters is yours."
- Close: "Bring your spreadsheet. Same quarter, side by side. If it finds the same dollars, you
  don't need us."
