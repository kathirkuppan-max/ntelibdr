# Nteli Brand Kit — for LinkedIn & email

One brand, two domains: **nteli.io** is the product/brand domain (use in all public
assets); **@nteligroup.com** stays our email identity. Both resolve to the same site.

## Wordmark
`nteli` in IBM Plex Sans **Bold**, tight tracking + `.io` in **Regular**, blue `#58A6FF`.
On dark: "nteli" in `#F0F6FC`. On light (email): "nteli" in `#0D1117`.
Files: `logo-square-400.png` (avatar), site `public/logo.svg` (light bg), `public/logo-email.svg`.
Never: stretch, recolor the ".io" to anything but blue, or add taglines inside the mark.

## Colors
| Role | Hex | Use |
|---|---|---|
| Ink / dark bg | `#0D1117` | backgrounds, light-mode text |
| Card surface | `#161B22` | panels on dark |
| Text on dark | `#F0F6FC` | headlines |
| Muted | `#9BA8B4` / `#6E7B88` | body / fine print |
| **Blue** | `#58A6FF` | the ".io", links, CTAs |
| **Gold** | `#D4A843` | numbers, $ figures, Quote lever |
| Purple | `#BC8CFF` | the engine / tagline accent |
| Teal | `#2DD4BF` | Recognize/Settle lever, success |

Rule of thumb: dark background, white headline, **gold for every dollar figure**, blue for
every link. The purple→blue→gold gradient is reserved for the tagline only.

## Type
Headlines: **IBM Plex Sans** (Bold/SemiBold). Numbers & labels: **IBM Plex Mono** (caps,
letterspaced). Email fallback stack: `Arial, Helvetica, sans-serif`.

## Language
- Tagline (always this exact pair): **"Agents talk. The engine decides."**
- Method: **The Leak Ledger Method** · Pipeline: **Quote-to-Comply**
- Outcome line: "Recover the revenue you're already earning."
- One-liner boilerplate: *Nteli (nteli.io) is a Salesforce Premier Partner and the maker of
  the Agent Pricing Engine — deterministic configure-to-order quoting, delivered as an MCP
  server. AI runs the conversation; every price comes from your rules.*
- Numbers always travel with their math ("$1.4M/yr — $80M quoted × 3% error × 60% unrecovered").
- Never: "forward-deployed" (retired), un-derived dollar claims, naming Navitas or NEP,
  "live in minutes" (until launch go), Elite results claims (Tier C on hold — scale facts
  from their public 10-K are fine).

## LinkedIn assets (in this folder)
- `linkedin-company-banner-1128x191.png` — company page cover
- `linkedin-profile-banner-1584x396.png` — personal profile cover (whole team)
- `logo-square-400.png` — company page avatar
- `linkedin-post-template-1200x627.png` — layout reference for post cards: gold top bar,
  mono kicker, big statement (2 lines max), number + math, tagline bottom-left, link
  bottom-right. Ask Claude to render variants with real copy.
- Profile headline suggestion: "Recovering revenue across Quote-to-Comply · Nteli"
- Demo links to share: nteli.io/engine/<vertical> (autoplay), nteli.io/roi (calculator)

## Email signature
Use `email-signature.html` (Gmail: Settings → Signature → paste rendered HTML).
Keep @nteligroup.com addresses; the links point to nteli.io. UTM is prebuilt
(`utm_content=email-signature`) so signature clicks show up in analytics.
