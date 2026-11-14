# Salesforce CPQ to Revenue Cloud play: outreach copy (DRAFT, for Kathir's approval)

Status: draft, 2026-11-13. Nothing here has been sent. Once Kathir approves, the final copy goes to the Outreach session (local_1959356d-7553-4e28-b6ba-afeff787676a), which sends it through Superhuman and checks gtm/suppression.csv first.

**Who it's for:** specialty manufacturers of configured or engineered products, sold direct and/or through dealers. They run Sales Cloud plus Salesforce CPQ (ideally 5 to 75 CPQ users), have price rules and dealer pricing, and quote with an ERP behind it (SAP, Epicor, Infor, NetSuite or Dynamics).

**The forcing event, as Salesforce states it** (checked 2026-11-13 against Salesforce's page "Navigating the Future of Salesforce CPQ: Product End of Sale (Not End of Life)"):
- CPQ is end of sale, not end of life.
- Salesforce no longer sells CPQ to new customers. Existing customers can renew, add users and keep support.
- New development goes to Revenue Cloud. Moving is not forced, and Salesforce has announced no retirement date.

**So the copy never states a date or a deadline.** The angle is that every renewal now raises the question of when to move.

**Slots:**
- `{first_name}`
- `{company}`
- `{signal_line}`: one sentence on the signal. Examples:
  - "Saw you're hiring a Salesforce CPQ admin."
  - "Congrats on the new VP of Sales role."
  - "Saw the move to S/4HANA."
  - "Your CPQ renewal is coming up."
- `{product_line}`: for example "lab equipment" or "battery packs".
- `{pov_link}`: the link for their product line:
  - nteli.io/pov/lab: lab equipment, sold through dealers.
  - nteli.io/pov/battery: battery and e-mobility.
  - nteli.io/pov/rca: everything else (23 product lines).
- `{erp}`: their ERP, for example "SAP" or "NetSuite" (Touch 4).
- `{video_link}`: the matching video:
  - nteli.io/media/nteli-lab-pov.mp4
  - nteli.io/media/nteli-battery-pov.mp4
  - For /pov/rca there's no video yet, so link the page instead.

---

## 1. Salesforce AE note

### Email or Slack (77 words)

> Subject: Your CPQ accounts in manufacturing
>
> Hi {first_name}, if you have specialty manufacturers on Salesforce CPQ, renewals now bring up the Revenue Cloud question. We help you answer it: a fixed-fee Revenue Cloud setup, quotes live in weeks, with the product rules, pricing and dashboards for their product line pre-built. Here's how it looks for {product_line}: {pov_link}
>
> Our team built configurators at Cisco, Dell and IBM. Referenceable customers include Nikola and Coulomb Solutions.
>
> Which of your CPQ accounts are coming up for renewal?
>
> Kathir, Nteli

### LinkedIn (about 245 characters)

> Hi {first_name}, for your specialty manufacturing accounts on Salesforce CPQ: fixed-fee Revenue Cloud setup, quotes live in weeks, rules and pricing pre-built. Here's how it looks: {pov_link}. Which of your CPQ accounts are coming up for renewal?

---

## 2. Free CPQ-to-Revenue Cloud readout

### The offer, in one paragraph (for emails and the AE note)

> A free CPQ-to-Revenue Cloud readout. Send us an export of your Salesforce CPQ setup: products, bundles, product rules, price rules and quote templates, plus any Excel builders your team quotes from. Within about a week, we walk you through what moving to Revenue Cloud would take for your business: the effort, a realistic timeline, the risks, and what can stay as it is. You get a summary of the Revenue Cloud rule pack your current rules would become, including what moves across as-is and what needs your engineers' review. No cost, and no commitment.

### What they receive: a one-page outline

**CPQ-to-Revenue Cloud Readout: {company}**

1. **What we read.** Counts of the products, bundles, product rules, price rules, discount schedules, quote templates and Excel builders, as exported.
2. **What it becomes in Revenue Cloud.** Products and attributes, configuration rules, pricing procedure steps and quote templates, with counts. It shows what moves across as-is and what needs a person.
3. **Items for engineering review.** Rules that conflict, are unclear, or point to retired products. Each item has its source.
4. **Effort and timeline.** A range in weeks, with the phases: set up the catalog, rules and pricing, quote templates, test on your own recent quotes, then go live.
5. **Risks and how to handle them.** For example:
   - custom code in CPQ;
   - open quotes and renewals in flight;
   - the ERP handoff;
   - dealer pricing;
   - who maintains the rules afterwards.
6. **What stays as it is.** Sales Cloud data, accounts, opportunities and your ERP as the system of record.
7. **How quoting keeps working during the move.** CPQ stays live until Revenue Cloud is tested on real quotes.
8. **Recommended next step.** Move now, move at renewal, or wait. We say so if waiting is the right call.

*Readout notes, internal only:*
- **Check the rule-pack claim first.** Item 2 relies on Kathir's statement that the migration reads CPQ and Excel rules and creates the RCA rule pack. Run it on a real export before we promise it in a readout.
- **Show counts and review items only.** The readout never contains the generated rules, model structure or rule logic, because Rules IP stays confidential.

---

## 3. Direct sequence: 5 touches over about 14 days

Rules for every touch:
- Plain text.
- Touch 1 has one plain link and no tracking.
- No prices or tier names.
- Nothing outside Salesforce.
- No lines about AI.
- Each prospect gets the touch for their role.
- Threads stay separate per person, but the later touches name the champion's thread only if the champion replied.

### Touch 1: Day 0, RevOps or sales ops owner (champion)

> Subject: CPQ renewal and Revenue Cloud
>
> Hi {first_name},
>
> {signal_line} With Salesforce no longer selling CPQ to new customers and putting new development into Revenue Cloud, most CPQ teams we talk to are deciding when to move, not whether.
>
> We offer a free readout. Send us an export of your CPQ setup and the Excel builders your team quotes from, and we'll tell you the effort, the timeline and the risks of moving, including what your current rules would become in Revenue Cloud. No cost, no commitment.
>
> Background on the end of sale, if useful: nteli.io/salesforce-cpq-end-of-sale
>
> Worth a look for {company}?
>
> Kathir
> Nteli, a Salesforce partner for specialty manufacturers

### Touch 2: about Day 4, same person (champion)

> Subject: Re: CPQ renewal and Revenue Cloud
>
> Hi {first_name}, a one-minute look at how {product_line} quoting runs on Revenue Cloud once it's moved: the CPQ and Excel rules become the rule pack, reps find products by what they are, and every order traces back to its quote.
>
> {video_link}
>
> The readout offer stands. Happy to send the export checklist.
>
> Kathir

### Touch 3: about Day 7, VP Sales, CRO or COO (economic buyer)

> Subject: Moving off CPQ without stopping quoting
>
> Hi {first_name},
>
> {signal_line} Salesforce has stopped selling CPQ to new customers and is putting new development into Revenue Cloud, so the move will come up at {company}. The business questions are simple:
>
> - **Quoting keeps working.** CPQ stays live until Revenue Cloud has been tested on your own recent quotes.
> - **A known timeline.** Fixed-fee setup, quotes live in weeks, with your product rules and pricing carried across rather than rebuilt from scratch.
> - **Less discount leak.** Every price comes from the price book and your discount limits, and every order traces back to its quote.
>
> We start with a free readout of your current setup: effort, timeline, risks. Would a 20-minute walkthrough make sense?
>
> Kathir
> Nteli · our team built configurators at Cisco, Dell and IBM

### Touch 4: about Day 10, Salesforce admin or IT (evaluator)

> Subject: What a CPQ-to-Revenue Cloud move looks like in your org
>
> Hi {first_name},
>
> {signal_line} If {company} moves from CPQ to Revenue Cloud, here's what lands in your org:
>
> - **Standard Revenue Cloud setup:** Product Catalog Management, the Product Configurator, Pricing Procedures and quote templates. No managed package of ours to babysit.
> - **ERP handoff:** orders created from the quote and sent to {erp} with nothing retyped. Your ERP stays the system of record.
> - **Nothing custom you can't maintain.** Rules live as standard configuration, documented, and your team is shown how to change them.
>
> We start with a free readout of your current CPQ setup. Want the export checklist?
>
> Kathir

### Touch 5: about Day 14, champion (close the loop)

> Subject: Re: CPQ renewal and Revenue Cloud
>
> Hi {first_name}, closing the loop. If the move isn't on this year's list, no problem. The readout is still worth having before the next CPQ renewal, so the decision is made on facts. Want me to send the export checklist and leave it with you?
>
> Kathir

**Optional proof line**, which can go into any touch: "Referenceable customers include Nikola, Coulomb Solutions and Intricon." Names only; no scope or results without Kathir.

---

## Notes for Kathir (internal; never in the copy)

1. **Open risk: rules in the customer's org.** Rules set up in a customer's Salesforce org (configuration rules, pricing procedures) can be read by their admins. That conflicts with keeping the rule packs confidential, and it has to be settled before the first real build. Options:
   - accept it: the customer owns their configured rules, and we keep the source pack and the generator;
   - deliver only what their catalog needs;
   - contract terms covering reuse.
   Touch 4's "nothing custom you can't maintain" assumes the rules sit in their org, so settle this before Touch 4 goes out.
2. **The POV assets are written for Salesforce sellers.** The pages say "Tell your prospect", and the videos carry "For Salesforce manufacturing sellers". That's fine for the AE note. For direct prospects (Touch 2), the seller framing will read oddly. Either accept it, or let me make a prospect-facing cut of the lab and battery videos (swap the tag line) before the sequence starts.
3. **Touch 1's one link** is the public end-of-sale article (nteli.io/salesforce-cpq-end-of-sale), not a POV page, because it speaks to the buyer directly. The POV video comes in Touch 2.
4. **The rule-pack claim** in Touch 2, the readout and the lab POV ("CPQ and Excel rules become the rule pack") needs a real export run before the first readout is promised.
5. **"Quotes live in weeks"** comes from the brief. It matches the tier timelines (about 1 to 5 weeks before ERP work). Full rollouts with ERP integration run longer, so Touch 3 says "quotes live", not "fully live".
6. **No dates.** Salesforce's published terms give no retirement date. Third-party "2029–2030" estimates are speculation, so don't use them.
