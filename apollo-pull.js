#!/usr/bin/env node
/**
 * Nteli — Apollo ICP Prospect Pull  v2
 * ─────────────────────────────────────
 * Two-step flow required by Apollo's current API:
 *   Step 1 — Search  /api/v1/mixed_people/api_search   → person IDs + has_email flag
 *   Step 2 — Enrich  /api/v1/people/bulk_match (×10)   → full record with email + org.industry
 *
 * Industry segments are auto-classified from the enrichment response's org.industry field.
 *
 * Usage:
 *   APOLLO_API_KEY=your_master_key node apollo-pull.js
 *
 * Optional env vars:
 *   MAX_PAGES=5          (default 5 → up to 500 contacts from search)
 *   OUTPUT_FILE=out.csv  (default prospects.csv)
 *
 * Requires a Master API Key — Settings → Integrations → API Keys → "Set as master key"
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const API_KEY    = process.env.APOLLO_API_KEY;
const MAX_PAGES  = parseInt(process.env.MAX_PAGES || '5', 10);
const OUT_FILE   = process.env.OUTPUT_FILE || 'prospects.csv';

if (!API_KEY) {
  console.error('\n  ✕  APOLLO_API_KEY is not set.\n');
  console.error('     Run:  APOLLO_API_KEY=your_master_key node apollo-pull.js\n');
  console.error('     Get your master key: Apollo → Settings → Integrations → API\n');
  process.exit(1);
}

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  'x-api-key': API_KEY,          // x-api-key header — confirmed for both endpoints
};

// ─── Target titles (all four personas) ───────────────────────────────────────

const TITLES = [
  // Revenue Operations
  'VP Revenue Operations',
  'Vice President Revenue Operations',
  'Director of Revenue Operations',
  'Director Revenue Operations',
  'Head of Revenue Operations',
  'Senior Director Revenue Operations',
  // Finance / CFO
  'CFO',
  'Chief Financial Officer',
  'VP Finance',
  'Vice President of Finance',
  'Director of Finance',
  'Director Finance',
  'VP Financial Operations',
  'Controller',
  // Channel / Partner / Alliances
  'VP Channel',
  'VP Channel Sales',
  'Vice President Channel',
  'Director of Channel',
  'Director Channel',
  'Director Channel Sales',
  'Head of Channel',
  'VP Alliances',
  'Director Alliances',
  'VP Partner',
  'VP Partner Sales',
  'Director of Partner',
  'Director Partner',
  'Head of Partners',
  'VP Partnerships',
  'Director Partnerships',
  // Sales Operations
  'VP Sales Operations',
  'Vice President Sales Operations',
  'Director of Sales Operations',
  'Director Sales Operations',
  'Head of Sales Operations',
];

// ─── Industry classification (applied after enrichment) ───────────────────────
// Apollo's new search API has no industry filter — we classify from org.industry
// returned by the bulk_match enrichment step.

const SEGMENT_RULES = [
  {
    name: 'Pharma',
    note: 'Chargeback · 340B · GPO compliance',
    pattern: /pharma|pharmaceutical|biotech|biotechnology|life science|medical device|medtech|healthcare|hospital|clinical|biopharma/i,
  },
  {
    name: 'Semi',
    note: 'Ship & Debit · Design Registration',
    pattern: /semiconductor|electronics|electronic manufacturing|electrical.*manufacturing|component|chip|wafer|embedded|defense.*space/i,
  },
  {
    name: 'SaaS',
    note: 'Q2C · CPQ · Partner programs',
    pattern: /computer software|software|saas|internet|information technology|it services|cloud|platform|network security/i,
  },
];

function classifySegment(person) {
  const industry = ((person.organization || {}).industry || '').toLowerCase();
  for (const seg of SEGMENT_RULES) {
    if (seg.pattern.test(industry)) return seg;
  }
  return { name: 'Other', note: industry || 'unknown industry' };
}

// ─── Step 1: Search ───────────────────────────────────────────────────────────

async function searchPage(page) {
  const body = {
    page,
    per_page: 100,
    person_titles:               TITLES,
    person_seniorities:          ['vp', 'director', 'c_suite', 'head', 'senior'],
    person_locations:            ['United States', 'Canada'],
    // Broad employee range covers pharma/semi/SaaS targets
    organization_num_employees_ranges: ['11,200', '201,1000', '1001,5000', '5001,20000'],
    // Only pull people Apollo has email data for
    contact_email_status:        ['verified', 'unverified', 'likely to engage'],
  };

  const res = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
    method:  'POST',
    headers: HEADERS,
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }

  return res.json();
}

// ─── Step 2: Bulk enrich (10 IDs per call) ───────────────────────────────────

async function bulkEnrich(ids) {
  const body = { details: ids.map(id => ({ id })) };

  const res = await fetch('https://api.apollo.io/api/v1/people/bulk_match', {
    method:  'POST',
    headers: HEADERS,
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.matches || [];
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function esc(v) {
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? `"${s.replace(/"/g, '""')}"` : s;
}

// ─── CSV schema ───────────────────────────────────────────────────────────────

const CSV_HEADERS = [
  'First Name', 'Last Name', 'Title',
  'Email', 'Email Status', 'Phone',
  'Company', 'Company Website', 'Industry',
  'Employees', 'Revenue',
  'City', 'State', 'Country',
  'LinkedIn URL',
  'Segment', 'Segment Note',
];

function toRow(person, segment) {
  const org   = person.organization || {};
  const phone = person.phone_numbers?.[0]?.raw_number || '';
  return [
    esc(person.first_name),
    esc(person.last_name),
    esc(person.title),
    esc(person.email),
    esc(person.email_status),
    esc(phone),
    esc(org.name),
    esc(org.website_url),
    esc(org.industry),
    esc(org.num_employees),
    esc(org.annual_revenue),
    esc(person.city),
    esc(person.state),
    esc(person.country),
    esc(person.linkedin_url),
    esc(segment.name),
    esc(segment.note),
  ].join(',');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n  Nteli — Apollo ICP Prospect Pull  v2');
  console.log('  ════════════════════════════════════');
  console.log('  Step 1 → Search for person IDs');
  console.log('  Step 2 → Bulk enrich (10 per call) to get emails + industry');
  console.log(`  Max search pages : ${MAX_PAGES} (${MAX_PAGES * 100} contacts max)\n`);

  // ── Step 1: Collect person IDs from search ─────────────────────────────────

  const candidates = [];   // { id, has_email }
  let page = 1;
  let totalPages = Infinity;

  process.stdout.write('  Searching…\n');

  while (page <= Math.min(MAX_PAGES, totalPages)) {
    process.stdout.write(`    page ${page} … `);
    try {
      const data = await searchPage(page);
      const people = data.people || [];

      const pagination = data.pagination || {};
      totalPages = pagination.total_pages || 1;

      // Only keep people Apollo has email data for
      const withEmail = people.filter(p => p.has_email === true);
      candidates.push(...withEmail.map(p => p.id));

      process.stdout.write(`${people.length} results, ${withEmail.length} with email (total candidates: ${candidates.length})\n`);

      if (people.length < 100) break;   // partial page = last page
    } catch (err) {
      process.stdout.write(`ERROR — ${err.message}\n`);
      break;
    }

    if (page < Math.min(MAX_PAGES, totalPages)) await sleep(1400);
    page++;
  }

  console.log(`\n  → ${candidates.length} candidates found with email signal`);

  // ── Step 2: Bulk enrich in batches of 10 ──────────────────────────────────

  console.log(`  → Enriching in ${Math.ceil(candidates.length / 10)} batches of 10…\n`);

  const rows   = [CSV_HEADERS.join(',')];
  const seen   = new Set();
  let enriched = 0;
  let skipped  = 0;

  for (let i = 0; i < candidates.length; i += 10) {
    const batch = candidates.slice(i, i + 10);

    process.stdout.write(`    batch ${Math.floor(i / 10) + 1}/${Math.ceil(candidates.length / 10)} … `);

    try {
      const matches = await bulkEnrich(batch);

      for (const person of matches) {
        if (!person.email) { skipped++; continue; }

        const key = person.email || person.linkedin_url || person.id;
        if (seen.has(key)) { skipped++; continue; }
        seen.add(key);

        const segment = classifySegment(person);
        rows.push(toRow(person, segment));
        enriched++;
      }

      process.stdout.write(`${matches.length} enriched\n`);
    } catch (err) {
      process.stdout.write(`ERROR — ${err.message}\n`);
    }

    // Bulk match is rate-limited at 50% of People Enrichment rate
    if (i + 10 < candidates.length) await sleep(2000);
  }

  // ── Write CSV ──────────────────────────────────────────────────────────────

  const outPath = path.resolve(OUT_FILE);
  fs.writeFileSync(outPath, rows.join('\n'), 'utf8');

  console.log(`\n  ════════════════════════════════════`);
  console.log(`  ✅  ${enriched} contacts → ${outPath}`);
  console.log(`      (${skipped} skipped — no email or duplicate)\n`);

  // Segment breakdown
  const counts = {};
  rows.slice(1).forEach(row => {
    const seg = row.split(',').at(-2).replace(/"/g, '');
    counts[seg] = (counts[seg] || 0) + 1;
  });
  console.log('  Breakdown by segment:');
  for (const [seg, n] of Object.entries(counts)) {
    console.log(`    ${seg.padEnd(8)} ${n}`);
  }

  console.log('\n  Next steps:');
  console.log('  1. Filter "Segment" column → focus Pharma first (Elite Pharma reference)');
  console.log('  2. Sort by "Email Status" → verified emails first');
  console.log('  3. Touch 1 → NO tracking pixel (Streak deliverability rule)');
  console.log('  4. Personalise using Industry + Company columns\n');
}

main().catch(err => {
  console.error('\n  Fatal:', err.message);
  process.exit(1);
});
