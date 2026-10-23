# nteli.io UI Re-spec — "Recover the revenue you're already earning"

Status: DISCUSSION DRAFT (v1, 2026-10-23). Nothing ships until Kathir approves.

## The converged model

**Message:** Revenue leaks at known points. There are levers to close every one.
**Grammar:** one pipeline, four stages — **Quote → Order → Recognize → Comply** —
same names on every page; each vertical instantiates its OWN leaks and levers under them.
**GTM logic (Kathir):** the self-serve MCP engine is the market-reach wedge →
it enables **workshop sessions** → workshops convert to full lever engagements.
So the site's job is a three-step funnel, visible everywhere:

> **Try it in minutes** (engine trial) → **Workshop: your own leak ledger in a day**
> → **Recover: fixed-fee lever engagements**

The workshop is the bridge offer and deserves a NAME and a page. Working name:
**"The Leak Ledger Workshop"** — bring your quotes/claims/contracts; we run them
through the engine and the crosswalk; you leave with your dollar ledger per lever
and a phased plan. (Naming open to Kathir.)

## Information architecture

```
/                       Homepage (outcome-led, pipeline graphic, funnel strip)
/manufacturing          Vertical hub: CTO story + its 4 levers + engine hero
  /semi                 KEEPS URL. Flagship sub-vertical, own levers (Design Reg,
                        POS/sell-through, Ship & Debit @ Recognize, channel tax)
  /engine + /engine/<v> Engine hub + 14 vertical demo pages (unchanged URLs)
/pharma                 KEEPS URL. Own levers (GPO pricing, EDI, chargebacks/340B
                        @ Recognize, gov pricing)
/saas                   KEEPS URL. Own levers (Q2C, provisioning, ASC 606/renewals,
                        SaaS tax)
/workshop               NEW. The bridge offer page (what you bring, what you leave
                        with, who's in the room, fixed price TBD by Kathir)
/roi                    NEW (v1, cuttable). Calculator: vertical + 3 inputs →
                        personalized leak ledger per lever → CTA = workshop
/cpq /erp /prm /tax     REMAIN as solution pages; each tagged with the stage(s)
                        it serves; linked FROM lever sections, demoted in nav
/pricing /docs /support /privacy /terms   unchanged
```

Nav: `Industries: Manufacturing · Pharma · SaaS` | `Start: Engine · Workshop · ROI`
(Semi reachable prominently from Manufacturing + keeps all inbound links.)

## Homepage section order

1. **Hero (outcome):** "Recover the revenue you're already earning." Sub: leaks
   happen at four points between quote and GL; every Nteli solution closes one.
   CTAs: `See your leaks →` (/roi) · `Try the engine →` (/engine)
2. **Pipeline graphic:** Quote → Order → Recognize → Comply as an animated pipe
   with leak points + dollar chips (reuses leak-ledger visual language from videos)
3. **Funnel strip:** Minutes → A day → A quarter (engine / workshop / engagement)
4. **Vertical doors (3 cards):** Manufacturing (semi flagship badge) · Pharma · SaaS —
   each card lists ITS biggest lever + its headline number
5. Trust marquee + About band (keep as-is)
6. Final CTA: workshop-led ("Book the workshop" primary, "Watch a 2-min demo" secondary)

## Vertical page template (each vertical, incl. /semi)

1. Pain-led hero in the vertical's own vocabulary (current heroes largely survive)
2. **The four levers, instantiated** — stage name + this vertical's leak + the $
   math block + the solution that closes it (one primary solution per lever)
3. The vertical's crown-jewel lever gets the deep section (semi: Ship & Debit;
   pharma: chargebacks/340B; manufacturing: the engine; SaaS: Q2C)
4. Demo video(s) where they exist; funnel strip; CTA

## ROI calculator spec (v1-lean)

Inputs: vertical, annual revenue, quotes/month (or % channel revenue for semi/pharma).
Output: 4 ledger lines (one per lever) with visible formulas — reuses Leak Ledger
EP math blocks — plus total, plus "validate these numbers in a workshop" CTA.
Pure client-side JS; no backend. Disclaimered as benchmark-based estimate.

## What this does NOT change

- All engine URLs, demos, thumbnails, deep links — untouched
- /semi, /pharma, /saas URLs and their deep content — reframed, not rewritten
- Pricing page model (credits) — the workshop may appear there as its own row
- "Live in minutes" claim still gated on the launch go signal

## Open for Kathir

1. Workshop: name, price, duration (the page needs these three facts)
2. ROI calculator in v1 — yes/no (my vote: yes; it feeds workshop bookings)
3. Stage names: confirm Quote/Order/Recognize/Comply (or propose alternates)
4. Homepage hero wording: "Recover the revenue you're already earning" — react
