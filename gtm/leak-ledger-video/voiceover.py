"""Speaks voiceover.md's lines with macOS `say`, fits each line into its scene, and muxes the track into both cuts.

python3 voiceover.py            -> leak-ledger-vo.mp4 and leak-ledger-60s-vo.mp4
"""
import os, subprocess, tempfile

VOICE = "Matilda (Premium)"   # matches the site demo narrator (panels & switchgear et al.), per Kathir 2026-11-01
BASE_RATE = 165                      # words a minute; raised per line only if a line overruns its scene
SAY_NTELI = "En-telly"               # how the voice should say Nteli (confirmed)

CUTS = {
    "leak-ledger": (79, [
        (0.6, "Revenue leaks between the quote and the cash. Here's where."),
        (5.0, "Nteli connects to what you already run. Salesforce, your ERP, billing, contracts."),
        (11.0, "Every quote, order, invoice and claim, joined on one deal ID."),
        (19.0, "Then the Leak Ledger itemizes what's slipping. Wrong configurations. Missed adders. "
               "Deep discounts. Invoices off contract. Rebates overpaid."),
        (30.0, "In this example, two point seven million a year."),
        (33.0, "Now, pull the levers."),
        (35.3, "The pricing engine checks every configuration against your rules, and prices the adders in, before the quote goes out."),
        (44.0, "Orders are built from the accepted quote. Exceptions go for approval, with the margin in view."),
        (50.5, "Invoices match the contract. Surcharges follow cost. Spare parts come from the same price book."),
        (58.3, "Payouts tie to shipped units. Chargebacks are matched to contract, or disputed."),
        (64.5, "The result is a recovery report your CFO can trace, line by line, down to the deal."),
        (74.2, "Nteli. Agentic revenue orchestration. nteli dot I O."),
    ]),
    "leak-ledger-60s": (60, [
        (0.5, "Revenue leaks between the quote and the cash."),
        (4.0, "Nteli connects to Salesforce, your ERP, billing, contracts and channel files, and joins every record on one deal ID."),
        (14.2, "The Leak Ledger itemizes what's slipping, from quote to compliance."),
        (21.8, "Two point seven million a year."),
        (24.3, "Now, pull the levers."),
        (26.3, "Every configuration checked against your rules. Adders priced in. Discounts benchmarked."),
        (34.0, "Orders built from the accepted quote. Invoices matched to contract."),
        (43.2, "Rebates paid on shipped units. Chargebacks matched, or disputed."),
        (50.3, "A recovery report your CFO can trace, to the deal."),
        (56.8, "Nteli. Agentic revenue orchestration."),
    ]),
}


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout
    return float(out)


def speak(text, path, slot):
    text = text.replace("Nteli", SAY_NTELI).replace("nteli", SAY_NTELI)
    rate = BASE_RATE
    while True:
        subprocess.run(["say", "-v", VOICE, "-r", str(rate), "-o", path, "--data-format=LEI16@44100", text], check=True)
        d = duration(path)
        if d <= slot or rate >= 189:
            return d, rate
        rate += 8


here = os.path.dirname(os.path.abspath(__file__))
for name, (dur, lines) in CUTS.items():
    tmp = tempfile.mkdtemp()
    inputs, filters = [], []
    for i, (start, text) in enumerate(lines):
        nxt = lines[i + 1][0] if i + 1 < len(lines) else dur
        wav = os.path.join(tmp, f"{i:02d}.wav")
        d, rate = speak(text, wav, nxt - start - 0.25)
        print(f"{name} {start:5.1f}s  {d:4.1f}s of {nxt - start:4.1f}s  @{rate}  {text[:50]}")
        inputs += ["-i", wav]
        filters.append(f"[{i + 1}:a]adelay={int(start * 1000)}:all=1[a{i}]")
    mix = "".join(f"[a{i}]" for i in range(len(lines)))
    filters.append(f"{mix}amix=inputs={len(lines)}:normalize=0,apad,atrim=0:{dur},loudnorm=I=-16:TP=-1.5[vo]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(here, f"{name}.mp4"), *inputs,
                    "-filter_complex", ";".join(filters), "-map", "0:v", "-map", "[vo]",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
                    os.path.join(here, f"{name}-vo.mp4")], check=True)
