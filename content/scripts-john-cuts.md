# John's Tuesday — three 1-minute test cuts

Derived from `script-john-estimator.md` (the 2:00 master stays the long cut).
Each cut: **1:00 raw** (site plays 1.25× → ~48s), stands alone, opens on an outcome
ledger line, closes on the tagline. Same brand frame (`nteli QUOTING` · label top-right).
File names: `nteli-john-queue.mp4` · `nteli-john-rules.mp4` · `nteli-john-price.mp4`.

**Test design:** one story, three doors. Queue = workflow pain (estimators, managers,
RevOps). Rules = tribal-knowledge pain (product/engineering, sales leaders). Price =
margin pain (CFO, finance). Send each to its audience; the click tells you which door
your market walks through.

---

## CUT 1 — "What's on my plate?" (the Queue) · label: THE QUEUE

| Time | VOICEOVER | ON SCREEN |
|---|---|---|
| 0:00–0:08 | A $200-million manufacturer's estimators stopped losing track of quotes. Nothing slips anymore. Here's John's Tuesday. | Gold ledger line: **0 quotes lost in the shuffle** · **Close in hours, not days** |
| 0:08–0:26 | John starts his day by asking Claude one question: *"What's on my plate?"* Three drafts to finish. Two waiting on his approval. Four custom parts waiting on vendor cost — one overdue. Five sent, sitting with customers. One with the Specials team. | The real queue card renders in Claude: **3 drafts · 2 approvals · 4 custom parts (1 OVERDUE red) · 5 sent · 1 Specials**, urgent items below, `Open in Nteli ↗` |
| 0:26–0:34 | The overdue one? One tap, and he's chasing the vendor — before the customer chases him. | Overdue row highlights; tap; red badge clears |
| 0:34–0:46 | His manager sees the same queue for the whole team — who's blocked, what's overdue, what's waiting on a customer. No status meeting required. | Web-app team view: same counts, per-estimator rows |
| 0:46–0:52 | Every quote in that queue was priced by the engine. Not by memory. | Quick flash of a quote card's gold total |
| 0:52–1:00 | Agents talk. **The engine decides.** | Black. Tagline types on in the gradient accent · **nteli.io/engine** |

---

## CUT 2 — "The blocked option" (Rules & Compatibility) · label: THE RULES

| Time | VOICEOVER | ON SCREEN |
|---|---|---|
| 0:00–0:08 | A $200-million manufacturer shipped zero invalid configurations last year. Zero. Here's the moment that makes it true. | Gold ledger line: **$0 invalid configs shipped** · **Every quote traceable to rules** |
| 0:08–0:20 | John's quoting three freeze-protected units for a Class I, Division 2 site. Twenty years of product knowledge — and he still almost picks the wrong option. | Conversational Q&A beats building the config |
| 0:20–0:34 | The engine blocks it. *With the reason.* Not listed for the location — Division 2 requires T3 heat trace. The compatibility matrix isn't in John's head anymore. It's in the rules. | The option grays out: **"Not listed for the location — Div 2 requires T3 heat trace."** |
| 0:34–0:46 | And when John asks *"why not?"* — he gets the rule, not a shrug. When the veteran retires, the knowledge doesn't. | "Why not X?" bubble → the rule appears with its source. |
| 0:46–0:52 | John talks. The engine decides. And this Tuesday, that saved the quote. | Config completes; ledger line ticks ✓ |
| 0:52–1:00 | Agents talk. **The engine decides.** | Black. Tagline types on · **nteli.io/engine** |

---

## CUT 3 — "The discount that doesn't exist" (Pricing & Governance) · label: THE PRICE

| Time | VOICEOVER | ON SCREEN |
|---|---|---|
| 0:00–0:08 | A $200-million manufacturer got $1.4 million back last year — from quotes they were already winning. The margin was leaking at the quote. | Gold ledger: **$1.4M recovered — quoting errors** |
| 0:08–0:22 | John's quote assembles line by line. Every number from a rule — the unit, the heat trace, the valves, the freight. None from memory. Same facts, same price. Every time. | Quote card builds line by line to a gold total |
| 0:22–0:36 | He hits submit. Policy decides who approves — his manager gets a review packet: the facts, the decisions, the price build-up. Not a reply-all thread. | Submit → routing chip: **→ Sales Manager · review packet** |
| 0:36–0:46 | And the discount nobody approved? It doesn't exist here. Exceptions need an approver — and the audit trail remembers. | A rogue-discount attempt bounces: **requires approval**. Audit trail scrolls |
| 0:46–0:52 | That's where the one-point-four million came from. One checked quote at a time. | Ledger total counts up to **$1.4M** ✓ |
| 0:52–1:00 | Agents talk. **The engine decides.** | Black. Tagline types on · **nteli.io/engine** |

---

## Shared render notes
- Tagline close identical across all cuts (and the 2:00 master): 4-second hold, same type-on, same gradient. It's the series signature — repetition is the point.
- Thumbnail subline for all: **"An AI estimator on a checked quoting engine."**
- Suggested test UTMs: `utm_content=john-queue` / `john-rules` / `john-price` on any landing links.
- $1.4M derivation unchanged (EP1 math block). John remains a fictional composite.
- Compatibility language: always "listed for the location" — never UL 698A.
- Pace VO with tight pauses; no silence longer than ~0.8s (these will not need auto-trimming).
