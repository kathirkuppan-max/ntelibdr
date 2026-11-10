# AI citation bench

Fixed questions we ask AI answer engines every month to see whether they cite nteli.io, and where. Non-brand only: a buyer who has never heard of Nteli.

**Engines:** Google AI Mode, Perplexity, ChatGPT (temporary chat, search on). Claude is left out of the baseline because Kathir's own Claude account knows Nteli, which would skew results.
**Scoring per question:** C = nteli.io cited as a source; N = Nteli named in the answer text; rank = position of nteli.io among the cited domains (1 = first).
**Rules:** same wording every run; signed-in Chrome; note anything personalised.

## Questions

| # | Lane | Question |
|---|---|---|
| 1 | UL 508A | What is the best UL 508A control panel quoting software? |
| 2 | UL 508A | How can a panel shop check SCCR and NEC sizing before sending a quote? |
| 3 | Cable | What software do cable assembly and wire harness manufacturers use to quote RFQs? |
| 4 | Data center | What software can estimate data center pod or modular power skid builds? |
| 5 | Ship & debit | What is the best ship and debit software for semiconductor suppliers? |
| 6 | Ship & debit | How do I validate ship and debit claims against distributor POS data? |
| 7 | Channel revenue | Does channel revenue management replace my ERP? |
| 8 | Pharma | How do pharma manufacturers validate wholesaler chargebacks against contracts? |
| 9 | Quoting | What is a good CPQ alternative for mid-market manufacturers that sell through dealers? |
| 10 | Quoting | Can ChatGPT or Claude quote configured industrial products? |
| 11 | Quoting | Which quoting tools check a quote for engineering errors before it is priced? |
| 12 | NRE | How should a contract manufacturer quote NRE for a medical device program? |

## Results

### Baseline 2026-11-10 (Google AI Mode, Perplexity; signed-in Chrome)

Cell = rank of our domain among cited sources ("—" = not cited); N = Nteli named in the answer; (ng) = cited under the old nteligroup.com address.

| # | Question (short) | Google AI Mode | Perplexity | Who leads |
|---|---|---|---|---|
| 1 | Best UL 508A quoting software | **2**, N | **3**, N; also (ng) 11 | CostBook first in both |
| 2 | Check SCCR/NEC before quoting | — | (ng) 8 | Eaton, Rockwell, panelshopos |
| 3 | Cable/harness RFQ software | — | — | Cableteque, Cadonix, Nuqo |
| 4 | Data center pod / skid estimating | — | **(ng) 1**, N | Schneider, Siemens |
| 5 | Best ship and debit software | **1**, N | — | Model N, Vistex, Vendavo |
| 6 | Validate S&D claims vs POS | — (no sources shown) | — | Pricefx, Vendavo, Channelscaler |
| 7 | Does channel revenue mgmt replace my ERP? | — (no sources shown) | (ng) 2 | Salesforce |
| 8 | Pharma chargeback validation | — | — | Tellius, Relasoft, IncentX |
| 9 | CPQ alternative, dealer-sold mid-market | — | — | Threekit, Experlogix, HiveCPQ |
| 10 | Can ChatGPT/Claude quote industrial products | — | — | Tacton, GetApp, Aviso |
| 11 | Quote checked for engineering errors | — | — | Tacton, Threekit, Protolabs/Xometry |
| 12 | Quote NRE for a medical device program | **6**, N | — | Creanova, ACDI, MFG-One |

**Score:** Google 3 of 12 cited (1 at #1). Perplexity 4 of 12 cited, but 3 of those under nteligroup.com; named in 2.
**ChatGPT not run:** the temporary chat stayed "Personalized" (memory plus the Nteli app), which would bias it. Next run: logged-out ChatGPT, or Kathir flips the setting.
**Read:** we win where we have a dedicated page with a matching title (UL 508A, ship and debit software, NRE). We're absent on the broad buyer questions (9, 10, 11) where Threekit and Tacton own the answer, and on cable, pharma and POS validation. Perplexity still indexes nteligroup.com.
