# Script — "John's Tuesday" (The Estimator Story)

Series: The Leak Ledger · Format: 1080p, VO-led, ~110s raw (site plays 1.25× → ~88s effective)
Brand frame: `nteli QUOTING` top-left · `A DAY IN THE QUEUE` top-right
Formula: outcome ledger open → John's story closes the lines → receipt.
Covers: estimator queue ("What's on my plate?"), rules, compatibilities, pricing, governance.

---

| Time | VOICEOVER | ON SCREEN |
|---|---|---|
| 0:00–0:10 | A two-hundred-million-dollar equipment manufacturer got one-point-four million dollars back last year. Not from new sales — from quotes that stopped leaking. Here's what that looks like on an ordinary Tuesday. | Dark ledger card, gold numbers typing on: **$1.4M recovered — quoting errors** · **$0 invalid configs shipped** · **Close in hours, not days** |
| 0:10–0:22 | Meet John. Twenty years of product knowledge. He knows the compatibility matrix by heart — mostly. Every quote used to start in a spreadsheet and end in a prayer. | Simple estimator avatar at a desk; a cluttered spreadsheet ghosted behind him, fading out |
| 0:22–0:40 | Now John starts his day by asking Claude one question: *"What's on my plate?"* Three drafts to finish. Two waiting on his approval. Four custom parts waiting on vendor cost — one overdue. Five sent, sitting with customers. One with the Specials team. | The real queue card renders in Claude: **3 drafts · 2 approvals · 4 custom parts (1 OVERDUE in red) · 5 sent · 1 Specials**, five urgent items listed below, `Open in Nteli ↗` |
| 0:40–0:48 | The overdue one? One tap, and he's chasing the vendor — before the customer chases him. Nothing slips through a Tuesday anymore. | The overdue row highlights; tap; it files away. Red badge clears |
| 0:48–1:05 | A new request lands: three freeze-protected units for a Class I, Division 2 site. John answers questions — not forms. He picks an option the site can't support, and the engine blocks it. *With the reason.* The compatibility matrix isn't in John's head anymore. It's in the rules. | Conversational Q&A beats; then an option grays out with a one-line reason: **"Not listed for the location — Div 2 requires T3 heat trace."** A ledger line ticks ✓ |
| 1:05–1:18 | The price assembles line by line — every number from a rule, none from memory. Same facts, same quote. Every time. John hits submit. Policy routes it; his manager gets a review packet, not a reply-all thread. And the discount nobody approved? It doesn't exist here. | The quote card builds line by line to a gold total. Submit → routing chip: **→ Sales Manager · review packet** |
| 1:18–1:30 | Quoting errors — recovered. Invalid configs — zero. John's queue — empty by Friday. That's how a two-hundred-million-dollar manufacturer gets one-point-four million back. One checked quote at a time. | The opening ledger returns, each line ticking ✓, total counting up to **$1.4M**. End card: **Watch it quote your products → nteli.io/engine** |

---

## Render notes
- Queue card (0:22) should mirror the real MCP Apps card — counts, red overdue badge, `Open in Nteli ↗` — so the demo matches what a trial user sees in Claude.
- The compatibility block line reuses the corrected hazloc language ("listed for the location") — never UL 698A.
- "$1.4M / $200M" derivation (if asked): $80M quoted-config revenue × 3% config/discount error × 60% unrecoverable — same math block as Leak Ledger EP1.
- John is a fictional composite estimator; no real customer named.
- Optional 10s extension (manager cut, 0:40 alt): "His manager sees the same queue for the whole team — and can turn on a one-line morning digest by email. Most don't need it. The card is enough."
