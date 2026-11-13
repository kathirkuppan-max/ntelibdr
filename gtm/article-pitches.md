# Article pitches (drafts, not sent)

Drafted 2026-11-13 in Kathir's voice from facts on the nteli.io product pages. Kathir edits and approves; the Outreach session sends on the day. No AI lines in the pitches; check each outlet's AI-disclosure rule at the article stage.

## Wiring Harness News
**To:** Joe Tito, Content Manager & Marketing (joe@wiringharnessnews.com)  
**Subject:** Article idea: the checks that should run before a cable assembly gets a price

```
Hi Joe,

I'd like to contribute a feature on a quoting problem every cable assembly shop knows: an RFQ that reads fine but describes an assembly that can't be built as specified.

Working title: Check Before You Price: Quoting Cable Assemblies End A to End B

It walks through three checks with real examples:
- Connector rating vs. data rate: a D-coded M12 has four contacts and stops at 100 Mbit/s, so a 10 Gbit/s request needs X-coding.
- Conductor gauge vs. current, against NFPA 79 ampacity.
- Jacket vs. environment and code: PUR for oil and coolant splash, CMP/OFNP for plenum runs.

It closes with how to decline a spec with the reason and priced alternatives, so the customer has a way forward.

Educational, no product mentions, about 1,300 words in Word, with 4-5 captioned images sent separately. Glad to do the interview route instead if that suits you better.

A line on me: I architected product configurators at Cisco, Dell and IBM and now run Nteli, a Quote-to-Order services firm for specialty manufacturers.

Thanks,
Kathir
```

**Article title:** Check Before You Price: Quoting Cable Assemblies End A to End B

**Outline:**
- 1. The problem: an RFQ written end A to end B can describe an assembly that cannot be built as specified. If it gets priced before it is checked, the error shows up later as rework or a re-quote. Argue that compatibility checks belong before pricing, not after the PO arrives. Use no invented statistics.
- 2. Break the assembly into three parts: end A, the cable, end B. List what an estimator has to pin down for each. Connector family and coding: M8/M12 A-coded 5/8-pole, L-coded power, D- and X-coded Ethernet, plus 7/8 in., D-sub, RJ45, IEC C14/C20 to C13/C19, NEMA 5-15P, and fiber LC duplex and MPO-12. End types: flying leads or pigtails, M12-to-RJ45, power cords, MPO-to-LC breakouts. Cable: gauge, jacket, shielding, Cat 5e/6A, fiber type (OM3, OM4, OS2) and polarity.
- 3. Check 1, connector rating vs. data rate. Worked example: an M12 D-coded to RJ45 cable, 5 m, requested for 10 Gbit/s. D-coding has four contacts and stops at 100 Mbit/s. The two honest options are to keep D-coding at 100 Mbit/s or move to X-coding for 10 Gbit/s. Use IEC 61076 connector ratings as the reference point.
- 4. Check 2, conductor gauge vs. current. Choose the gauge against NFPA 79 ampacity, and confirm the connector can carry that gauge (connector vs. cable and gauge). Mention L-coded M12 for power and the IEC C13/C19 power-cord ends as cases where the current requirement drives both the end and the cable.
- 5. Check 3, jacket vs. environment and code. Worked example: an M12 A-coded 8-pole cordset to flying leads, 5 m, on a machine with oil and coolant splash. That points to an oil-resistant PUR jacket and molded ends. Survey the jacket options (PVC, PUR, TPE, LSZH, plenum, SJT, SJOOW) and what drives each choice, including code-driven cases such as plenum.
- 6. Fiber assemblies carry their own checks. Worked example: an MPO-12 to six LC duplex breakout, OM4, about 125 m, through a plenum ceiling, for 40G. Covers a plenum-rated (CMP/OFNP) jacket per the NEC, 12-fiber OM4 within 40G reach, and polarity and loss within TIA-568.3-E. Treat 100% insertion-loss testing with a report as a line item to quote, not an afterthought.
- 7. Workmanship belongs in the quote too. Name the workmanship standard the assembly will be built to (IPC/WHMA-A-620), so the price reflects how the assembly will actually be built and inspected.
- 8. How to say no well. When a spec fails a check, give the reason and the standard it comes from, and offer priced alternatives (as in the D- vs. X-coded example), so the customer keeps moving instead of shopping the RFQ elsewhere. Cite the source for every size and every refusal.
- 9. Estimator checklist (sidebar): for each RFQ, confirm the connector rating against the data rate, the gauge against current and connector, the jacket against environment and code, fiber reach, polarity and loss, the test requirements, and the workmanship standard before any price goes out.
- About the Company (100-200 words, kept separate): Kathir's configurator background at Cisco, Dell and IBM; Nteli as a Quote-to-Order services firm for specialty manufacturers; website and contact details. Informational only.

**Facts used (and source page):**
- Connectors covered: M8 and M12 (A-coded 5/8-pole, L-coded power, D/X-coded Ethernet), 7/8 in., D-sub, RJ45, IEC C14/C20 to C13/C19, NEMA 5-15P, fiber LC duplex and MPO-12. Source: nteli.io/engine/interconnect (public/engine-interconnect.html), Connectors card
- End types: flying leads or pigtails, M12-to-RJ45, power cords, MPO-to-LC breakouts; any end A to any compatible end B. Source: public/engine-interconnect.html, Ends & adapters card
- Cable attributes: gauge, jacket (PVC, PUR, TPE, LSZH, plenum, SJT, SJOOW), shielding, Cat 5e/6A, fiber type OM3/OM4/OS2 with polarity. Source: public/engine-interconnect.html, Cable card
- Compatibility checks: connector vs. cable and gauge, jacket vs. environment and code; every size and refusal shows its source. Source: public/engine-interconnect.html, rules line
- D-coded M12 has four contacts and stops at 100 Mbit/s; the options are to keep D-coded at 100 Mbit/s or move to X-coded for 10 Gbit/s (M12 D-coded to RJ45, 5 m, 10 Gbit/s example). Source: public/engine-interconnect.html, try-it example 2
- M12 A-coded 8-pole cordset to flying leads, 5 m, with oil and coolant splash leads to a conductor gauge choice, an oil-resistant PUR jacket and molded ends, checked against IEC 61076 connector ratings, NFPA 79 ampacity and IPC/WHMA-A-620 workmanship. Source: public/engine-interconnect.html, try-it example 1
- MPO-12 to six LC duplex breakout, OM4, about 125 m, plenum ceiling, 40G: plenum-rated (CMP/OFNP) jacket per the NEC, 12-fiber OM4 within the 40G reach, polarity and loss within TIA-568.3-E, 100% insertion-loss test with report. Source: public/engine-interconnect.html, try-it example 3
- Refusals give their reason and offer priced alternatives. Source: public/engine-interconnect.html, try-it example 2
- Kathir architected configurators at Cisco, Dell and IBM; Nteli is a Quote-to-Order services firm for specialty manufacturers. Source: task brief and memory (not from the page; used only in the one-line bio)

**Guideline check:** The pitch is addressed to Joe Tito, the content manager and editorial contact named on wiringharnessnews.com/about-us. The topic fits the outlet's wanted categories: manufacturing best practices, standards and engineering insights, and case-style worked examples. It is relevant only to wire harness, cable assembly and interconnect. Tone is educational and vendor-neutral. The article names no product and contains no sales language, as the 'informational, not promotional' rule requires. Nteli appears in one line of the email and in the optional About the Company section of 100 to 200 words. Length is about 1,300 words, inside the typical 1,200 to 1,500 range. Format is Word (.docx). Images: the pitch commits to 4 or 5 captioned JPEGs sent separately. The guidelines also ask for 300 DPI minimum, figure references and photo credits. Kathir needs real photos or diagrams of assemblies and connectors; none exist in the repo yet. The email offers Joe's interview-and-draft option as an alternative. The guidelines say nothing about exclusivity or AI-content disclosure, so the pitch adds no disclosure line and none is needed at pitch stage. If a disclosure rule turns up when the article is submitted, handle it then. Rule checks: no prices; no 'agents' or 'agentic' (the engine is not mentioned at all); 'specialty manufacturers' used; no ChatGPT, Claude, MCP or connector mentions; no Salesforce partner tier, to avoid anything that reads as a certification claim. Standards (IEC 61076, NFPA 79, IPC/WHMA-A-620, NEC, TIA-568.3-E) are named only as references for checks, never as compliance claims. Every technical fact comes from public/engine-interconnect.html. No customers, results or statistics are invented. The email is 177 words, under the 180 limit. Nothing was sent; this is a draft only.

## Data Center Frontier
**To:** Matt Vincent, Editor in Chief (mvincent@endeavorb2b.com; fallback: "Drop Us a Line!" form at https://www.datacenterfrontier.com/contact-us)  
**Subject:** Story idea: pricing a data center pod as one system (vendor-neutral)

```
Hi Matt,

A pod quote can look right line by line and still be wrong as a system. A rack's kW drives its PDUs and feeds, and everything upstream: UPS, transformers, generators, switchgear. Choose 2N over N+1 and the A and B paths double. Move to direct-to-chip liquid cooling and CDUs carry the liquid load while CRAH units cover the air remainder. A 40 kW rack should never ship with 25 kW of cooling.

I'd like to write a vendor-neutral piece for DCF readers: "Price the Pod as One System." It walks through two worked examples, a 1 MW pod of 25 kW racks at N+1 and an 800 kW GPU pod of 40 kW racks at 2N, and ends on the check that is easiest to miss: capacity after redundancy.

I architected product configurators at Cisco, Dell and IBM and now run Nteli, a Quote-to-Order services firm for specialty manufacturers. The article names no products.

Happy to send a full outline and write it exclusively for DCF.

Thanks,
Kathir
```

**Article title:** Price the Pod as One System: Sizing Rack kW, Redundancy and Cooling Together Before the BOM

**Outline:**
- Opening: why a pod quote can be right line by line and wrong as a system. Pod, e-house and power-skid builders quote first-pass sizing on bids where estimating time is the scarcest resource, so the order of sizing decisions matters.
- Start at the rack: kW per rack sets the rack PDUs and feeds, and everything upstream of them. Get this number wrong and every downstream line inherits the error.
- Redundancy is a sizing decision, not a line item: UPS modules and battery runtime sized under N, N+1 or 2N, with step-down transformers per side. Under 2N the A and B paths double (UPS, transformers, switchgear).
- Upstream of the UPS: generators, switchgear and transfer gear sized to the pod's total load, with interrupting ratings checked against the available fault current (worked example uses 480 V utility at 65 kA).
- Cooling sized to the heat each rack actually sheds: CRAH, coolant distribution units and rear-door heat exchangers. With direct-to-chip liquid, CDUs carry the liquid load and CRAH covers the air remainder. Why a 40 kW rack must never ship with 25 kW of cooling.
- Worked example 1: a 1 MW pod, two rows of twenty racks at 25 kW, N+1, rear-door heat exchangers, 18 C chilled water, slab floor. Walk the full train from rack to generator.
- Worked example 2: an 800 kW GPU pod, two rows of ten 40 kW racks, direct-to-chip liquid cooling, 2N, 32 C warm-water loop. Show how the A/B doubling and the liquid/air split change the train.
- The what-if: re-sizing the same GPU pod at N+1 instead of 2N. Every component in the train moves, not just the UPS, which is why redundancy has to be settled before the BOM is priced.
- The check that is easiest to miss: capacity after redundancy. Show every component's capacity against its limit once the redundant path is removed from the count.
- Carry the rest into the same BOM: containment, row busway and commissioning levels, so the priced pod matches the sized pod.
- Close: make every size and every refusal traceable to its source (the rule, the rating, the catalog page) so a reviewer can check the quote, not just the price. A short pre-pricing checklist for estimators.

**Facts used (and source page):**
- kW per rack drives the rack PDUs and feeds, and everything upstream of them (nteli.io/engine/datacenter, public/engine-datacenter.html, 'What it sizes together')
- UPS modules and battery runtime are sized under the chosen redundancy (N, N+1 or 2N), with step-down transformers per side (engine-datacenter.html, 'What it sizes together')
- Generators, switchgear and transfer gear are sized to the pod's load, with interrupting ratings checked (engine-datacenter.html, 'What it sizes together')
- Cooling (CRAH, coolant distribution, rear-door heat exchangers) is checked against the heat each rack actually sheds, so a 40 kW rack never ships with 25 kW of cooling (engine-datacenter.html, 'What it sizes together')
- Containment, row busway and commissioning levels are carried into the same BOM (engine-datacenter.html, 'What it sizes together')
- Every size and every refusal shows its source: the rule, the rating, the catalog page (engine-datacenter.html, 'What it sizes together')
- Audience framing: pod, e-house and power-skid builders quoting first-pass sizing on bids where estimating time is the scarcest resource (engine-datacenter.html)
- Example 1: 1 MW pod, two rows of twenty racks at 25 kW, N+1, rear-door heat exchangers, 480 V utility, 65 kA, 18 C chilled water, slab (engine-datacenter.html, example prompt)
- Example 2: 800 kW GPU pod, two rows of ten 40 kW GPU racks, direct-to-chip liquid cooling, 2N, 480 V, 65 kA, 32 C warm-water loop (engine-datacenter.html, example prompt)
- Under 2N the A and B paths double (UPS, transformers, switchgear); CDUs carry the liquid load and CRAH units the air remainder (engine-datacenter.html, example result)
- Each component is checked for capacity after redundancy; every capacity is shown against its limit (engine-datacenter.html, example results)
- Changing the GPU pod from 2N to N+1 re-sizes the whole train (engine-datacenter.html, follow-up example)
- Not from the page (background supplied in the task brief): Kathir architected product configurators at Cisco, Dell and IBM; Nteli is a Quote-to-Order services firm for specialty manufacturers

**Guideline check:** Route: research found no open, unpaid route for contributed articles at DCF. Voices of the Industry is for sponsors only (every piece is tagged Sponsored, and it is sold through Tom Larranaga), and DCF says it does "not typically cover product announcements." So this is written as an editorial story idea for Matt Vincent, to go to his email or the "Drop Us a Line!" form, and not as a product pitch. Before sending, Kathir should read the About Us page (https://www.datacenterfrontier.com/about-us), as DCF asks. If Matt only takes bylines from sponsors, the fallbacks are the DCF Trends Summit call for speakers and papers (no 2026 call found yet) or a paid Voices slot, whose cost is not published. Fit is low: DCF readers are mostly operators and buyers, not pod builders. That is why the angle is a vendor-neutral sizing explainer that operators and supply-chain readers can use to check vendor quotes. Rules: no published word count, no-sales rule, exclusivity rule or AI-disclosure rule was found for DCF. The pitch offers DCF exclusivity anyway and says the article names no products. Since no AI-disclosure rule was found, the pitch has no disclosure line. Recheck this if Matt shares guidelines. (Data Center Knowledge's separate 500-750 word, exclusive, synopsis-first rules do not apply to DCF.) House rules: the email is 170 words, in plain text and addressed to Matt by name. Nteli gets one sentence, combined with Kathir's Cisco/Dell/IBM background. The pitch has no prices and no compliance or certification claims, and it says "specialty manufacturers." It uses neither "agents" nor "agentic", and it does not mention ChatGPT, Claude, MCP or connectors. The page's "twenty years" rule-pack line and its sign-up and pricing copy were left out on purpose. Every technical fact comes from public/engine-datacenter.html. Nothing was sent.

## Control Engineering
**To:** Mark Hoske, Editor-in-chief (mhoske@arrowfly.com; he is also the contact named on the contributor-guidelines page)  
**Subject:** Exclusive article idea: A complete panel quote is not a correct one

```
Hi Mark,

I'd like to offer Control Engineering an exclusive contributed article for panel builders and system integrators: "A complete panel quote is not a correct one: the sizing checks that belong before a UL 508A panel is priced."

Most quote reviews catch what is missing: ferrules, duct, labels, the crate. The costlier errors are a different kind: starters rated 5 kA on a 22 kA service, a main sized from the wrong motor currents, a filtered fan on a NEMA 4X door. They show up at inspection, after the PO. The article walks through the checks to run at quote time (motor current from NEC Table 430.250, the main per NEC 430.24 and 409.20, SCCR against available fault current, enclosure cooling), the site facts to ask for rather than assume, and when to hand a job to engineering. Vendor-neutral.

I architected product configurators at Cisco, Dell and IBM and now run Nteli, a Quote-to-Order services firm for specialty manufacturers.

If it fits, I can send an abstract, outline and deadline commitment in Word for a 2027 online issue.

Kathir
```

**Article title:** A Complete Panel Quote Is Not a Correct One: The Sizing Checks That Belong Before a UL 508A Panel Is Priced

**Outline:**
- 1. Two kinds of quote error. Completeness errors (a missing ferrule, duct, label or crate) are easy to see and cheap to fix. Correctness errors (wrong SCCR, a main sized from the wrong motor currents, the wrong cooling for the enclosure type) are harder to see, cost more, and surface at inspection after the PO. The argument: correctness checks belong before the price goes out.
- 2. Start from the site facts. Supply voltage (208, 240, 480 or 600 V) and available fault current change the panel. If the RFQ does not state them, ask for them instead of assuming, and hold the quote until you have them.
- 3. Motor currents from the table, not the nameplate guess. Take motor full-load current from NEC Table 430.250, then size the main to NEC 430.24 and 409.20. Show how a main sized from the wrong currents carries through the whole bill of materials.
- 4. SCCR against available fault current. Compare each starter's and drive's short-circuit rating with the available fault current, and the main breaker's interrupting rating at the supply voltage. Worked example: starters rated 5 kA as standard on a 22 kA service need Class J/CC fuse kits, and the main moves to a high-interrupting breaker. A second example: at 35 kA available, a 35 kAIC main and a marked panel SCCR.
- 5. Starters and drives. Full-voltage, reversing and soft starters, and drives from 1 to 50 hp, sized from published manufacturer ratings rather than rules of thumb.
- 6. Enclosure type and cooling. NEMA 1, 12, 3R, 4 and 4X, and why fans are ruled out on 3R, 4 and 4X (example: a filtered fan on a NEMA 4X door). On a 4X enclosure the cooling becomes an air conditioner. Design ambient matters too: at a 40 C (104 F) ambient, hotter-running drives can push the panel to a larger enclosure, and an enclosure heater adds control-power load.
- 7. Cite the source for every size and every refusal. Tie each sizing decision to the code section or the catalog page, so the estimator, the engineer and the customer can check it.
- 8. Know where quoting stops. Switchgear and MCC-sized jobs go to engineering review with the details already gathered, and hazardous-location panels follow their own path. Detailed design stays in the CAD tool.
- 9. From the checked quote to the submittal. The same checked quote can produce the submittal sheet the customer approves before the PO: ratings, a dimensioned layout, a one-line diagram and the bill of materials. Closing: a pre-pricing checklist panel shops and integrators can adopt with whatever tools they already use.

**Facts used (and source page):**
- "A complete quote is not a correct one." A price-book quoting tool makes sure nothing is left off (ferrules, duct, label, crate) but can't tell you the panel is wrong. Source: nteli.io/engine/panels (public/engine-panels.html)
- Example errors: starters rated 5 kA on a 22 kA service, a main sized from the wrong motor currents, a filtered fan on a NEMA 4X door. These mistakes cost more than a missing line and surface at inspection, after the PO. Source: public/engine-panels.html
- Motor current from NEC Table 430.250; the main sized to NEC 430.24 / 409.20. Source: public/engine-panels.html
- SCCR is checked against the available fault current, along with the main breaker's interrupting rating at the supply voltage. Source: public/engine-panels.html
- Supply voltage options are 208, 240, 480 or 600 V. Supply voltage and available fault current are site facts to ask for instead of assuming. If the fault current isn't in the RFQ, the quote is held for that fact. Source: public/engine-panels.html
- Starters are rated 5 kA as standard. At 22 kA available, Class J/CC fuse kits go on every starter and the main moves to a high-interrupting breaker. Source: public/engine-panels.html
- Given 35 kA available, the panel moves to a 35 kAIC main and the panel SCCR is marked. Source: public/engine-panels.html
- Starters (full-voltage, reversing, soft) and drives from 1 to 50 hp are sized from published manufacturer ratings. Source: public/engine-panels.html
- Enclosure types are NEMA 1, 12, 3R, 4 and 4X. No fans on 3R, 4 or 4X, so a 4X enclosure gets an air conditioner. Source: public/engine-panels.html
- At a 40 C (104 F) design ambient, PowerFlex drives run hotter than the default, which moves the panel to a larger enclosure. An enclosure heater adds its control-power load. In the article this is generalized to 'hotter-running drives' with no brand named. Source: public/engine-panels.html
- Every size and every refusal shows its source: the code section or the catalog page. Source: public/engine-panels.html
- Switchgear and MCC-sized jobs go to engineers for review with the details already gathered. Class/Division and Zone locations are handled separately. Source: public/engine-panels.html
- The submittal sheet the customer approves before the PO includes ratings, a dimensioned layout, a one-line diagram and the bill of materials. Detailed design stays in the CAD tool (EPLAN/AutoCAD Electrical). Source: public/engine-panels.html
- Kathir architected product configurators at Cisco, Dell and IBM. Nteli is a Quote-to-Order services firm for specialty manufacturers. Source: the task brief (not engine-panels.html)

**Guideline check:** Exclusivity: the email offers the idea as exclusive to Control Engineering. The shared CSE/CE/PE guidelines require articles to be exclusive to the three sister titles, and the author signs a license giving the publisher perpetual reuse rights. Kathir should be willing to sign that license, and the article must not be republished on nteli.io or elsewhere first.
Idea first, article not written: the pitch offers an abstract, outline and deadline commitment if the editor wants one, which matches the guideline to email an idea first, not write in advance, and expect those requests. The draft should be submitted in Word, not PDF.
Author credentials and bio: one line covers the Cisco/Dell/IBM configurator background and Nteli. That is the only line about Nteli.
Noncommercial and instructional: the article teaches a pre-pricing checklist (NEC 430.250, 430.24/409.20, SCCR versus available fault current, enclosure cooling, site facts, escalation) that readers can use with any tool. No product names, prices, trial or engine claims appear in the article or outline. The PowerFlex example from the source page is generalized to 'hotter-running drives' to keep it vendor-neutral.
No disclaimers or restricted content: nothing in the pitch needs a legal notice or a reuse permission, which matches the controleng.com page-1 rules.
Length: no word count is promised. It would fit an online article (600 to 3,000 words) or a feature (1,200 to 3,000).
Calendar: the shared guidelines say to pitch at least 3 months ahead. Many 2027 slots are already due (Jan/Feb print was due Nov. 2, March online Dec. 1), so the pitch says 'a 2027 online issue' rather than naming a slot. Possible later slots are the December online CE Roundtable on system integration and project management, and the Nov/Dec Global System Integrator Report (editorial due July 15, 2027). Kathir can name one if Mark responds.
Images: if images are used, they must be 300 dpi with no added logos.
AI disclosure: no AI-content or disclosure rule was found on any Control Engineering or CSE page, so no disclosure is included, per Kathir's rule.
Style rules: says 'specialty manufacturers'; no mention of agents, ChatGPT, Claude, MCP or connectors; no prices; no compliance or certification claims (it describes checks against code sections and does not claim panels are compliant).
Fact-source note: the requested angle cited '409.21(C) main limit', but engine-panels.html only states NEC 430.24 / 409.20. So 409.21(C) was left out of the pitch and outline. Kathir can add it from his own expertise if he wants it.
Also left out: the page's 'twenty years of configuring' line and all pricing and connector content.
Nothing was sent. This is a draft for Kathir to send through the single email channel (the Outreach session plus Superhuman) after checking gtm/suppression.csv.

## Semiconductor Engineering
**To:** Ed Sperling, Editor in Chief (ed@semi-mags.com, from https://semiengineering.com/about-us/)  
**Subject:** Article idea: checking ship-and-debit claims line by line

```
Hi Ed,

Semiconductor Engineering covers how chips are designed, made and tested. One step after the fab rarely gets an engineering treatment: ship-and-debit claims, where a distributor sells at a special price and then debits the supplier for the difference.

I'd like to contribute a vendor-neutral piece on checking those claims line by line before the credit memo goes out. It would walk through four checks. The first is the price agreement: duplicates, expired agreements, wrong contract price, credit math and quantity caps. The other three are POS resale data such as EDI 867, the stock the distributor had on hand and received, and design registrations. It would also explain why a line the data can't reach should be flagged rather than passed, and why every line that is paid, cut or rejected needs a written reason.

There would be no product mentions, and readers could apply it with their own data. I founded Nteli, a Quote-to-Order services firm in Austin, after architecting configurators at Cisco, Dell and IBM.

If this fits Opinion, or would suit another editor better, I'd be glad to send an outline.

Thanks,
Kathir
```

**Article title:** Ship-and-Debit Claims, Line by Line: Four Data Checks Before the Credit Memo Goes Out

**Outline:**
- Framing: what a ship-and-debit claim is (a distributor resells at an agreed special price and debits the supplier for the difference), and why the claim line, not the claim total, is the right unit to check.
- The four data sources each line is checked against: the price agreement, the POS resale record (EDI 867 or POS exports), the stock the distributor held, and design registrations. Practical note: these usually arrive as CSV, Excel or JSON, and the checks can run beside the ERP without changing it.
- Check 1, agreement and price: duplicate lines, expired agreements, wrong contract price, credit math errors and quantity caps.
- Check 2, POS resale: lines with no resale record, a different end customer or sale date than the POS shows, or more units claimed than were resold.
- Check 3, stock held: units paid on a claim should not exceed what the distributor had on hand plus what it received.
- Check 4, design registration: the registration belongs to another distributor, it expired before the sale, or it is missing where the agreement requires one.
- Handling gaps: when POS or stock data can't reach a line, the line should say so rather than pass quietly. Why silent passes are where leakage hides.
- Deciding each line: pay, cut or reject, each with a written reason that people review before anything posts. One credit memo per claim that carries the distributor's debit number, so the disputed portion traces back to specific lines.
- Getting started: run the four checks against one past quarter's claims, agreements and POS to see which check matters most for your channel, before changing any process.

**Facts used (and source page):**
- Ship and debit claims are checked line by line before the credit memo goes out. Source: nteli.io/engine/semiconductors (public/engine-semiconductors.html)
- Each distributor claim line is checked against the agreement, the POS resale record and the stock the distributor held. Source: nteli.io/engine/semiconductors
- Each line is paid, cut or rejected with its reason, and the team reviews the result. Source: nteli.io/engine/semiconductors
- Agreement and price check covers duplicates, expired agreements, wrong contract price, credit math and quantity caps. Source: nteli.io/engine/semiconductors
- POS resale check covers no resale record, a different end customer or sale date, and more units than were resold. Source: nteli.io/engine/semiconductors
- Stock held check: units paid can't exceed what the distributor had on hand and received. Source: nteli.io/engine/semiconductors
- Design registration check: registered to another distributor, expired before the sale, or missing where the agreement requires one. Source: nteli.io/engine/semiconductors
- Inputs are agreements, EDI 867 or POS exports, and stock, loaded as CSV, Excel or JSON. Nothing in the ERP is changed. Source: nteli.io/engine/semiconductors
- A line that POS or stock data can't reach says so, rather than passing quietly. Source: nteli.io/engine/semiconductors
- Output is one credit memo file per claim, carrying the distributor's debit number, with an auditable reason on every line. Source: nteli.io/engine/semiconductors
- Running last quarter's claims, agreements and POS as a starting point. Source: nteli.io/engine/semiconductors ('Bring last quarter's claims' and the Workshop section), used here as neutral advice with no Workshop mention
- The sample debit figures on the page ($95,690 claimed, $48,000 paid, $47,690 caught, and the per-check amounts) are marked as fictional and illustrative, so I left them out of the pitch and the outline on purpose. Source: nteli.io/engine/semiconductors
- Kathir's configurator work at Cisco, Dell and IBM, and Nteli as a Quote-to-Order services firm in Austin: from the task brief, not from the page

**Guideline check:** The research found no published contributor guidelines, word count, exclusivity rule or AI-disclosure rule. Nothing about AI disclosure is in the pitch, and none is needed at this stage. The one stated rule is that vendors bring expertise and do not promote products. The pitch meets it: the article is educational and vendor-neutral, readers can use the four checks with their own data, the outline never names Nteli or the engine, and the email says there will be no product mentions. The email has one line about Nteli and Kathir. There are no prices, statistics, customer names or results, and no compliance or certification claims. 'Auditable' is used only in the facts list. 'Agents', ChatGPT, Claude, MCP and connectors are never mentioned.

Routing: there is no submission address. The 'Submit' header label has no link. Outside bylines appear in the Opinion section, apparently by invitation or through sponsors. The pitch goes to Ed Sperling, Editor in Chief, because no editor covers channel or commercial operations, and it asks him to point it to another editor if better. A possible alternate is Gregory Haley or Laura Peters (Manufacturing & Test). I did not pursue the paid sponsorship route through Linda Christensen.

Fit risk: research rated fit as low. The audience is engineers, and the site does not cover distribution or channel pricing. The pitch admits this up front ('rarely gets an engineering treatment') and does not oversell. A distribution-focused outlet would probably be a better home for this angle.

Nothing was sent. This is a draft only. Per standing rules, prospect and press email goes through the Outreach session and Superhuman when Kathir approves.
