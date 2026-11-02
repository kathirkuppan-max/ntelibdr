# AppExchange listing refresh — staged content (2026-11-02)

Status: ALL content staged in the publishing console but **Save & Exit fails with
"Save failed due to a problem in Include Visuals"** even though every field validates:
gallery = 6 captioned 1500×1000 PNGs, small logo 120×120, large logo 224×164, all old
media deleted. Console error: `[Appx-PubUI]` client-side validation, plus an earlier
`TypeError ... at fy.deleteMediaItem` — AppExchange's own delete handler is bugged.
Suspects: server-side debris from the broken delete, or Grammarly extension interfering
with the LWC editor. Listing id: 965df286-4494-43ea-ae40-ad30429508b3.

## Everything to re-enter (verbatim)

**Listing Title / SEO Title:** NTeli: Revenue Cloud (RCA & RCB), CPQ, Billing and MuleSoft Implementations
**Tagline:** Quote-to-cash that reconciles, from Salesforce to your ERP
**Brief Description:** Salesforce Premier Partner for manufacturing, semiconductor, pharma, SaaS and financial services — Revenue Cloud Advanced and Billing, CPQ, and MuleSoft CRM–ERP integration.
**Learn More URL:** https://nteli.io  ← the backlink fix (was nteligroup.com)
**Business Contact:** hello@nteli.io (was sales@nteligroup.com)

**Full Description:**
> NTeli is a Salesforce Premier Partner specializing in Revenue Cloud Advanced (RCA), Revenue Cloud Billing (RCB), CPQ and MuleSoft integration. We implement the full quote-to-cash path — catalogs, pricing, quoting, orders, invoicing and revenue recognition — and connect Salesforce to your ERP so CRM agreements and ERP transactions reconcile line by line.
>
> Industries: manufacturing and high tech, semiconductors, pharmaceuticals and life sciences, SaaS, and financial services.
>
> Recent work: chargeback validation for Elite Pharmaceuticals across wholesaler contracts; Aduro Advisors (fund administration, 600+ client firms, $131B+ AUA) unified across 680 Salesforce orgs with Data Cloud and MuleSoft.
>
> 58 Salesforce certifications across the team. 20 completed projects, rated 4.93 across 10 reviews.

**Overview card 1:** We implement Salesforce Revenue Cloud Advanced (RCA), Revenue Cloud Billing (RCB), CPQ and MuleSoft CRM–ERP integration — the full quote-to-cash path, end to end.
**Overview card 2:** We serve manufacturing and high tech, semiconductors, pharmaceuticals and life sciences, SaaS, and financial services — including Elite Pharmaceuticals and Aduro Advisors (600+ client firms, 680 Salesforce orgs unified with Data Cloud and MuleSoft).
**Overview card 3:** We formulate, design and implement: Revenue Cloud Advanced & Billing, CPQ and quote-to-cash, MuleSoft CRM–ERP integration, Experience Cloud partner portals, and Avalara tax integration.

## Images (this folder — salesforce-keyword filenames for SEO; brand-safe art:
## no "Salesforce" inside logo art or wordmark lockups, per partner brand guidelines)
- **Small Logo (120×120):** nteli-salesforce-logo-120.png
- **Large Logo (224×164):** nteli-salesforce-logo-224x164.png — "nteli. AUSTIN, TX"

Gallery (1500×1000 each, <1MB), upload in this order with these captions:
1. nteli-salesforce-revenue-cloud-cpq-mulesoft.png — caption: "Salesforce Revenue Cloud, CPQ & MuleSoft implementations — quote-to-cash that reconciles"
2. nteli-salesforce-rca-rcb-cpq-services.png — caption: "What we implement: Revenue Cloud Advanced, Revenue Cloud Billing, CPQ, and MuleSoft CRM–ERP integration"
3. nteli-salesforce-industries-verticals.png — caption: "Built for your vertical: manufacturing, semiconductors, pharma, SaaS and financial services"
4. nteli-salesforce-customers-elite-aduro.png — caption: "Customers: Elite Pharmaceuticals and Aduro Advisors — 680 Salesforce orgs, 600+ client firms, $131B+ AUA"
5. nteli-salesforce-quote-to-cash-team.png — caption: "Quote-to-cash DNA: configurators and pricing systems built at Cisco, Dell and IBM"
6. nteli-salesforce-premier-partner-why-nteli.png — caption: "Why NTeli: 4.93-star reviews, 58 certifications, 20 projects — Salesforce Premier Partner, Austin TX"
(Alt text per image: reuse the caption — the editor requires both.)

Rules honored: listing stays Salesforce-implementation-specific (no Agent Pricing Engine);
Cisco/Dell/IBM text only, no logos; Elite + Aduro cleared for naming.

## Ways out
A. **Grammarly test (15 min, free):** disable Grammarly on appexchange.salesforce.com (or use
   an Incognito window with extensions off), sign in, re-enter the above by hand, Save & Exit.
   If Grammarly was corrupting the LWC editor state, this just works.
B. **Salesforce Partner Support case** (draft below) if A fails.

## Support case draft
Subject: Publishing console: Save fails with "problem in Include Visuals" though all fields valid; deleteMediaItem throws TypeError
Body: On consultant listing 965df286-4494-43ea-ae40-ad30429508b3 (NTeli LLC), Save & Exit
consistently fails with "Save failed due to a problem in Include Visuals." All Include Visuals
fields are valid: 6 gallery images (1500×1000 PNG, <1MB, caption + alt text each), small logo
120×120, large logo 224×164, Marketing Use answered, no videos/resources. Browser console
shows [Appx-PubUI] client validation failure and, when removing legacy media items, "TypeError:
Cannot read properties of null (reading 'dataset') at fy.deleteMediaItem". We suspect the
listing's media collection is in a corrupted state after removing legacy items added years ago.
Please repair the listing's media state or advise. Security contacts were added today
(kathir@nteligroup.com).
