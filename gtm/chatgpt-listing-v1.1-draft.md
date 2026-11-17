# ChatGPT listing copy, v1.1 draft (2026-11-17)

**Status: LIVE. v1.1.0 approved by OpenAI and published 2026-11-17 (replaced v1.0.0). Source plugin.json synced to 1.1.0; v1.0.0 kept as chatgpt-plugin/plugin-1.0.0.json.bak.**
Source of the live listing: `~/Claude/nteli-quoting/chatgpt-plugin/nteli-quoting/plugin.json` (v1.1.0, published 2026-11-17; v1.0.0 was published 2026-11-05).

## What changes, and what doesn't

**Changes.** Only the listing text in OpenAI's plugin dashboard:
- `description`
- `keywords`
- `shortDescription`
- `longDescription`

**Unchanged.**
- The MCP server, tool names, descriptions and inputs (the connector freeze for the Claude review still holds).
- `mcp.json`, logos, brand colors, URLs, category.
- The three default prompts and the review test cases (already proven against the live engine).
- No pricing text, per the hold until the Claude review clears.

**Why.** ChatGPT picks apps from what the listing says. Today it leads with "AI-native product and pricing configuration (CPQ)". Estimators type "quote", "RFQ", "estimate" and "bid", and they name the product and the standard. v1.1 leads with those words and lists every live product line, not just six.

**Rules applied.**
- "Specialty manufacturers", never "small".
- "The engine" does the checking.
- No time claims ("in minutes").
- No prices.
- No customer names.
- Only product lines live on the connector.

---

## shortDescription
- **Now:** AI quoting for manufacturers
- **v1.1:** RFQ to order for manufacturers (Kathir, 11-17: "RFP to order right?" Kept RFQ, which is what estimators receive and type. RFP added to the description and keywords. "To order" matches the site's Quote-to-Order positioning.)

## description (plugin.json)
- **Now:** AI-native product and pricing configuration (CPQ) for manufacturers: quote data center pods, control panels, HVAC, pump skids and hazardous-area electrical, every rule checked.
- **v1.1:** Turn an RFQ, RFP, spec or email into a priced, standards-checked quote, then an order, for manufactured equipment: UL 508A control panels, switchgear, data center pods, HVAC, pump skids, hazardous-location enclosures, medical gas, cable assemblies and more.

## keywords
- **Now:** cpq, quoting, configure price quote, manufacturing, control panels, data center, hvac, pump skids, hazardous area, cable assemblies
- **v1.1 (50 keywords, in five groups):**
  - **What people want to do (15):** quote, quoting software, quote generator, estimate, estimating software, bid, proposal, rfq, rfp, request for quote, price quote, cpq, configure price quote, product configurator, quote to order
  - **Who uses it (5):** estimator, application engineer, inside sales, manufacturer's rep, dealer
  - **Products (23):** control panel, ul 508a, industrial control panel, switchgear, transfer switch, ups, generator, transformer, data center, modular data center, hvac, cooling tower, boiler, pump skid, water treatment, hazardous location, explosion proof, medical gas, fume hood, lab casework, cable assembly, wire harness, stair lift
  - **Standards (3):** nec, nfpa, nema
  - **Industry (4):** manufacturing, specialty manufacturer, configure to order, engineer to order

  Every keyword maps to a line or a step the connector really handles. Cut on purpose:
  - Standards the engine doesn't claim to check (SEFA, IEEE).
  - Generic CRM words that would attract the wrong users ("crm", "sales software").
  - Any brand names.

  If OpenAI caps the count, keep the first two groups and the first 10 products.

## longDescription (v1.1)

Nteli Quoting takes a customer's RFQ, RFP, spec sheet or email to a priced, standards-checked quote, and on to the order, for engineered, configure-to-order equipment. Estimators, application engineers, inside sales teams, manufacturer's reps and dealers at specialty manufacturers use it for quotes, estimates, bids and proposals, without rebuilding a spreadsheet for every job. It works for configure-to-order and engineer-to-order products.

Product lines:
- Industrial control panels (UL 508A)
- Power packages: switchgear, transfer switches, UPS, generators and battery storage
- Distribution transformers
- Data center pods and modular data centers: white space, power train and cooling
- Commercial HVAC, cooling towers and boilers
- Packaged pump skids and water treatment systems
- Hazardous-location and explosion-proof enclosures and panels (Class I, Division 1 and 2)
- Instrumentation and controls
- Medical gas outlets, manifolds and headwalls
- Lab casework and fume hoods
- Electronic assemblies, cable assemblies and wire harnesses
- Fire doors and door hardware
- Commercial kitchen ventilation hoods
- Cranes and hoists
- Accessibility lifts: platform lifts, stair lifts and vehicle lifts
- Surgical robotic systems
- NRE for engineering and design services

Paste the request into ChatGPT. The engine works out which configurations are valid and asks only the questions that change the answer, one at a time, each with the price it leads to. Panels and data center pods are built from their parts: list the drives, starters and I/O, or the racks and kW per rack, and the engine sizes the enclosure, breakers, UPS, generators, busway and cooling. When requirements clash, it says which rule is in the way and offers the ways out. Jobs outside the standard range go to a Specials team instead of getting a guessed price. Values the customer didn't state are marked as assumptions and listed to confirm.

The quote lists every part, what to confirm and the standards it was checked against (NEC, NFPA, UL, NEMA, ASHRAE), with good / better / best options side by side. Panels come with a preliminary submittal sheet. It all happens in an interactive card: tap an answer, assume a default, switch options, undo, submit for approval.

Every price and compatibility answer comes from Nteli's rules engine, not the model. Sign in with a work email: the first person at a company creates its workspace and picks its product line.

---

## Before submitting (Kathir decides)
1. **Approve or edit the copy above.** "To order" wording approved as it stands (Kathir, 11-17: "fine as it stands").
2. **Every listed line is live: checked against production on 11-17.** `list_models` on the hosted connector returns 22 lines: 18 flat lines (boilers, cooling towers, transformers, electronic assemblies, fire doors, hazloc, HVAC air handling, I&C, interconnect, kitchen ventilation, lab fume hoods, medical gas, three mobility lifts, cranes, pumps and skids, surgical robotics, water treatment) and 4 assembly lines (control panels, data centers, power systems, NRE services). The power-systems line covers switchgear, transfer switches, UPS, generators and battery storage, so "switchgear" stays. "Switchboard" is not named by the engine, so it was dropped.
3. **Category.** It stays "Productivity" unless OpenAI offers a better fit (e.g. Business) in the dashboard.
4. **Submission route.** Build the new ZIP with only plugin.json changed and version 1.1.0, then use "Create draft from ZIP" in platform.openai.com → Plugins → Nteli Quoting. Confirm in the dashboard that 1.0.0 stays live during review.
