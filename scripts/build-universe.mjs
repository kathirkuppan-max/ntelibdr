// One-time build script: parse the CMS Medicaid Drug Rebate Program CSV
// (the canonical list of every US pharma manufacturer with material chargeback
// exposure) and emit the universe as a TS file checked into the repo.
//
// Source: https://download.medicaid.gov/data/drugproducts4q_2025Updated02122026.csv
// (1.9M rows, ~688 unique active labelers)
//
// Filters applied:
//   - Skip terminated labelers (Termination Date present)
//   - Skip megacap brand innovators (Pfizer, Lilly, Merck, J&J, etc.)
//   - Skip pre-1980 labelers that are now defunct subsidiaries
//   - Aggregate per labeler: # drugs, innovator/non-innovator mix, OTC/Rx mix
//
// Usage:
//   node scripts/build-universe.mjs path/to/mdrp.csv
//   → writes src/lib/universe-mdrp.ts

import { createReadStream, writeFileSync, statSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { resolve } from 'node:path'

const CSV_PATH = process.argv[2]
if (!CSV_PATH) {
  console.error('Usage: node scripts/build-universe.mjs <path-to-mdrp.csv>')
  process.exit(1)
}

const stat = statSync(CSV_PATH)
console.log(`Reading ${CSV_PATH} (${(stat.size / 1024 / 1024).toFixed(0)} MB)…`)

// Manufacturers to exclude — megacap brand innovators (>$10B revenue) plus
// defunct/legacy subsidiary names that confuse the count.
const MEGACAP_PATTERNS = [
  /^pfizer/i, /^pharmacia/i, /^wyeth/i, /^eli lilly/i, /^lilly/i,
  /^merck/i, /^msd/i, /^johnson \& johnson/i, /^janssen/i, /^abbvie/i,
  /^abbott/i, /^gd\. searle/i, /^bayer/i, /^astrazeneca/i, /^novartis/i,
  /^roche/i, /^hoffmann-la roche/i, /^genentech/i, /^bristol[- ]myers/i,
  /^glaxosmith/i, /^gsk/i, /^smithkline/i, /^sanofi/i, /^aventis/i,
  /^boehringer/i, /^takeda/i, /^shire/i, /^biogen/i, /^amgen/i, /^gilead/i,
  /^vertex/i, /^regeneron/i, /^moderna/i, /^astellas/i, /^otsuka/i,
  /^baxter/i, /^bd\b/i, /^medtronic/i, /^stryker/i, /^viatris/i, /^mylan inc/i,
  /^teva pharmaceuticals usa/i, /^teva [a-z]+ usa/i,
  /^merck sharp/i,
  // Defunct subsidiaries that show up as separate labelers
  /^lederle laboratories$/i, /^a\. h\. robins$/i, /^ayerst laboratories$/i,
  /^roerig$/i, /^mead johnson/i, /^ortho/i, /^searle/i,
  // Repackagers / non-manufacturer labelers (high-volume noise — they touch
  // every NDC but don't actually manufacture or set chargeback policy)
  /^[a-z\s\.&]*repack/i, /^cardinal health/i, /^mckesson/i, /^amerisource/i,
  /^direct dispensing/i, /^physicians total care/i, /^stat[- ]rx/i,
  /^bryant ranch/i, /^aphena/i, /^proficient/i, /^a-s medication/i,
  /^remedyrepack/i, /^golden state medical/i, /^nucare/i, /^lake erie/i,
  /^american health packaging/i, /^major pharmaceuticals/i,
  /^bluepoint laboratories/i, /^avpak/i, /^topco associates/i,
  /^strategic sourcing/i, /^northstar rx/i, /^padagis israel/i,
  /^l\. perrigo/i, /^sandoz/i, /^contract pharmacy services/i,
  /^preferred pharmaceuticals/i, /^bio[- ]ridge/i, /^acella pharmaceuticals/i,
  /^proficient rx/i, /^safecor/i, /^st mary's medical park/i,
  /^chartwell rx/i, /^tya pharmaceuticals/i, /^liberty pharmaceuticals/i,
  /^doctors signature/i, /^seasonal supply/i, /^h\.j\. harkins/i,
  /^trigen laboratories/i, /^contract packagers/i, /^trupharma/i,
  // Veterinary / retail-only
  /^petlabs/i, /\bveterinary\b/i,
]

// Drug Type Indicator codes per CMS data dictionary:
//   S = Single source brand
//   I = Innovator (multi-source brand still on patent / branded generic)
//   N = Non-innovator (generic)
const DRUG_TYPE = { S: 'brand', I: 'innovator', N: 'generic' }
// COD Status: 01=covered outpatient, 02=restricted, 03=partner/authorized generic
const COD_STATUS = { '01': 'covered', '02': 'restricted', '03': 'partnered' }

const labelers = new Map() // labelerCode → { name, drugs, generic, brand, partnered, ndcs: Set, samples: [] }

const stream = createReadStream(CSV_PATH)
const rl = createInterface({ input: stream, crlfDelay: Infinity })

let header = null
let rows = 0
let kept = 0
let terminated = 0

for await (const line of rl) {
  if (!header) { header = line.split(','); continue }
  rows++
  if (rows % 100000 === 0) process.stdout.write(`  ${(rows / 1000).toFixed(0)}k rows…\r`)

  const cols = line.split(',')
  if (cols.length < header.length) continue

  const labelerName = (cols[2] || '').trim()
  const labelerCode = (cols[4] || '').trim()
  const terminationDate = (cols[9] || '').trim()
  const drugTypeIndicator = (cols[8] || '').trim()
  const codStatus = (cols[20] || '').trim()
  const fdaProductName = (cols[15] || '').trim()

  if (terminationDate) { terminated++; continue }
  if (!labelerCode || !labelerName) continue

  const key = labelerCode
  if (!labelers.has(key)) {
    labelers.set(key, {
      labelerCode: key,
      names: new Set(),
      drugs: 0,
      brand: 0, innovator: 0, generic: 0, partnered: 0,
      ndcs: new Set(),
      sampleProducts: [],
    })
  }
  const L = labelers.get(key)
  L.names.add(labelerName)
  L.drugs++
  L.ndcs.add(cols[3])
  const drugType = DRUG_TYPE[drugTypeIndicator]
  if (drugType === 'brand') L.brand++
  else if (drugType === 'innovator') L.innovator++
  else if (drugType === 'generic') L.generic++
  if (COD_STATUS[codStatus] === 'partnered') L.partnered++
  if (L.sampleProducts.length < 5 && fdaProductName) L.sampleProducts.push(fdaProductName)
  kept++
}

console.log(`\nProcessed ${rows.toLocaleString()} rows; kept ${kept.toLocaleString()} active product entries; ${terminated.toLocaleString()} terminated.`)
console.log(`Unique active labelers: ${labelers.size}`)

// Pick the canonical name (longest non-DEFUNCT one)
const candidates = []
for (const L of labelers.values()) {
  const names = [...L.names]
  const canonical = names.sort((a, b) => b.length - a.length)[0]
  if (MEGACAP_PATTERNS.some(re => re.test(canonical))) continue
  if (L.drugs < 5) continue // single/few-product labelers are mostly compounding pharmacies
  // Skip extremely high-drug labelers — they're almost always repackagers we missed
  if (L.drugs > 8000) continue
  candidates.push({
    labelerCode: L.labelerCode,
    name: canonical,
    aliases: names.filter(n => n !== canonical),
    drugCount: L.drugs,
    ndcCount: L.ndcs.size,
    brandCount: L.brand,
    innovatorCount: L.innovator,
    genericCount: L.generic,
    partneredCount: L.partnered,
    sampleProducts: L.sampleProducts,
  })
}

candidates.sort((a, b) => b.drugCount - a.drugCount)
console.log(`After filters: ${candidates.length} candidate labelers`)

// Show top 20 to spot-check
console.log('\nTop 20 by drug count:')
for (const c of candidates.slice(0, 20)) {
  console.log(`  ${c.labelerCode}  ${c.name.padEnd(40)} ${c.drugCount.toString().padStart(4)} drugs · ${c.genericCount} gen / ${c.brandCount + c.innovatorCount} brand`)
}

// Write the TS file
const out = `// Generated by scripts/build-universe.mjs from CMS MDRP data.
// Source CSV: drugproducts4q_2025Updated02122026.csv
// Active labelers retained: ${candidates.length}
// Generated: ${new Date().toISOString()}

export interface MdrpLabeler {
  labelerCode: string      // 5-digit NDC labeler code
  name: string             // canonical name
  aliases: string[]        // historic / alternate forms
  drugCount: number        // total active products
  ndcCount: number         // unique NDC9s
  brandCount: number
  innovatorCount: number
  genericCount: number
  partneredCount: number   // COD status 03 — authorized generics / partners
  sampleProducts: string[] // up to 5 FDA product names
}

export const MDRP_UNIVERSE: MdrpLabeler[] = ${JSON.stringify(candidates, null, 2)}
`

const outPath = resolve('src/lib/universe-mdrp.ts')
writeFileSync(outPath, out)
console.log(`\nWrote ${outPath} (${(out.length / 1024).toFixed(0)} KB)`)
