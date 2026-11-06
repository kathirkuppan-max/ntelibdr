# /engine/surgical-robotics: DRAFT, do not publish

Waiting on engine PR #134 to go live on quote.nteli.io (the Product Configuration Engine session will say when). Requested 2026-11-06; target is publishing before the 11-18 LinkedIn medtech follow-ups.

- Page draft: gtm/drafts/engine-surgical-robotics.html. It is kept out of public/ so a deploy can't ship it.
- Video config: gtm/vertical-video/configs/surgical-robotics.json (panels template, Aria voice). Storyboard stills are in gtm/vertical-video/out/surgical-robotics-stills/ (contact.png); the current cut runs about 89 s.

## On go-live
1. Run both try-it prompts and the video's chat request on the live engine (ChatGPT plugin). Then fix any number or wording that differs.
   - The video's request drops "60-month lease" on purpose, so that the engine's single question is about payment (capital, lease or per procedure). Confirm the live engine really asks that, and that the lease total stays $1,501,400.
   - Refusal prompt: confirm the wording "A spine system needs images to register to" and the two ways out. Add their prices to the card if the engine shows them.
   - Optional third card: an OR under 400 sq ft goes to Specials. Verify it before adding.
2. Render the video: `FRESH=1 python3 build.py surgical-robotics`, then copy it to public/media/nteli-quoting-surgical-robotics.mp4. Make og-surgical-robotics.jpg from s0.
3. Copy the page to public/engine-surgical-robotics.html. Set uploadDate (with timezone) and duration in the JSON-LD.
4. Add the route `/engine/surgical-robotics` to vercel.json. Add the page to the sitemap, llms.txt, the /engine index and the xverts lists. Then deploy, run IndexNow, and request indexing in GSC.

## Content rules applied
Say "the engine" (never "agents"); no speed or "minutes" claims; "checks configuration and site", never FDA, clearance or approval claims; every price labelled an estimated reference price; no manufacturer brands; no rule counts; no launch wording.

## Links to add on go-live
- /engine: add a `vid-pill` link to /engine/surgical-robotics, named "Surgical Robotic Systems" (tagged New).
- Add the same link to "The engine also quotes" on all 20 vertical pages. Rerun the canonical-list script; it is in the 11-06 commit message history, and the list lives in scratchpad verts.py. Also update the counts: "twenty" becomes "twenty-one" on /engine and on the homepage chip label.
- Homepage: add a chip. llms.txt: add the line.
