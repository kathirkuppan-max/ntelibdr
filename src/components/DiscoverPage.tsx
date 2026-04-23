'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Account } from '@/lib/types'

interface ExploriumBusiness {
  business_id?: string
  company_name?: string
  name?: string
  domain?: string
  website?: string
  city?: string
  state?: string
  country?: string
  linkedin_category?: string
  industry?: string
  annual_revenue?: string
  revenue?: string
  employee_count?: number | string
  number_of_employees?: string
  linkedin?: string
  linkedin_url?: string
}

type Candidate = {
  key: string
  company: string
  domain: string
  city: string
  state: string
  vertical: string
  rev: string
  emp: string
  linkedin: string
  explorium_id: string
}

export function DiscoverPage() {
  const { accounts, addDiscoveredAccount, save } = useStore()

  const [revenueBand, setRevenueBand] = useState<string>('25M-75M')
  const [state, setState] = useState<string>('')
  const [size, setSize] = useState<number>(50)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Candidate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set())
  const [bulkAdding, setBulkAdding] = useState(false)
  const [enriching, setEnriching] = useState<string | null>(null)

  async function search() {
    setLoading(true)
    setError(null)
    setResults([])
    setSelected(new Set())

    const filters: Record<string, unknown> = {
      linkedin_category: { values: ['pharmaceutical manufacturing'] },
      company_country_code: { values: ['US'] },
      company_revenue: { values: [revenueBand] },
    }
    if (state) filters.company_region_country_code = { values: [`US-${state}`] }

    try {
      const r = await fetch('/api/vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch-businesses',
          payload: { mode: 'full', size, page_size: size, filters },
        }),
      })
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      const businesses: ExploriumBusiness[] = data.data || data.businesses || data.results || []

      // Dedupe against existing accounts
      const existingDomains = new Set(accounts.map(a => (a.website || '').toLowerCase()))
      const existingNames = new Set(accounts.map(a => a.company.toLowerCase()))

      const mapped: Candidate[] = businesses.map((b, i) => {
        const company = b.company_name || b.name || 'Unknown'
        const domain = (b.domain || b.website || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
        return {
          key: String(b.business_id || `${domain || company}-${i}`),
          company,
          domain,
          city: b.city || '',
          state: b.state || '',
          vertical: b.linkedin_category || b.industry || 'Pharmaceutical Manufacturing',
          rev: b.annual_revenue || b.revenue || revenueBand,
          emp: String(b.employee_count || b.number_of_employees || '—'),
          linkedin: b.linkedin || b.linkedin_url || '',
          explorium_id: String(b.business_id || ''),
        }
      }).filter(c => c.company !== 'Unknown' && !existingDomains.has(c.domain) && !existingNames.has(c.company.toLowerCase()))

      setResults(mapped)
      if (!mapped.length) setError('No new companies returned. Try a different revenue band or state filter.')
    } catch (e) {
      setError((e as Error).message)
    }
    setLoading(false)
  }

  function toggleSelect(key: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === results.length) setSelected(new Set())
    else setSelected(new Set(results.map(r => r.key)))
  }

  function addOne(c: Candidate) {
    const newAccount: Omit<Account, 'id'> = {
      company: c.company, city: c.city || 'Unknown', market: c.state || 'Unknown',
      vertical: c.vertical, rev: c.rev, emp: c.emp,
      priority: 'Medium', pe: false, ownership: 'Unknown',
      pains: ['Chargeback / ship-debit enrichment pending', 'Needs Clay contact discovery', 'Pain-point research needed'],
      cxo: '— (enrich)', website: c.domain, liSearch: c.company,
      stage: 'Prospect', source: 'explorium', contacted: false, signals: [],
      explorium_id: c.explorium_id || undefined,
    }
    const id = addDiscoveredAccount(newAccount)
    if (id) {
      setAddedKeys(prev => new Set(prev).add(c.key))
      setTimeout(save, 100)
    }
  }

  async function addSelected() {
    setBulkAdding(true)
    const toAdd = results.filter(r => selected.has(r.key))
    for (const c of toAdd) addOne(c)
    setSelected(new Set())
    setTimeout(save, 200)
    setBulkAdding(false)
  }

  async function enrichOne(c: Candidate) {
    if (!c.explorium_id) { alert('No Explorium ID — cannot enrich'); return }
    setEnriching(c.key)
    try {
      const r = await fetch('/api/vibe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch-prospects',
          payload: {
            mode: 'full', size: 5, page_size: 5,
            filters: { business_id: { values: [c.explorium_id] }, job_level: { values: ['c-suite', 'director', 'vice president'] } },
          },
        }),
      })
      const data = await r.json()
      const prospects = data.data || data.prospects || data.results || []
      if (!prospects.length) { alert(`No contacts returned for ${c.company}`); setEnriching(null); return }
      // Add account with enriched contacts
      const contacts = prospects.slice(0, 5).map((p: Record<string, string>) => ({
        name: p.full_name || p.name || `${p.first_name} ${p.last_name}`.trim() || 'Unknown',
        initials: ((p.first_name || '')[0] || '') + ((p.last_name || '')[0] || ''),
        title: p.job_title || p.title || 'Unknown',
        email: p.email || p.business_email || '',
        emailValid: !!(p.email || p.business_email),
        phone: p.phone_number || p.phone || '',
        linkedin: p.linkedin_url || p.linkedin || '',
      }))
      const newAccount: Omit<Account, 'id'> = {
        company: c.company, city: c.city || 'Unknown', market: c.state || 'Unknown',
        vertical: c.vertical, rev: c.rev, emp: c.emp,
        priority: 'High', pe: false, ownership: 'Unknown',
        pains: ['Chargeback / ship-debit pain — pattern-based', 'GTN reserve accuracy', 'Contract & 844 exception volume'],
        cxo: contacts[0]?.title || '— (enrich)',
        website: c.domain, liSearch: c.company, stage: 'Prospect', source: 'explorium+enriched',
        contacted: false, signals: [], explorium_id: c.explorium_id,
        contacts, contactsDate: new Date().toLocaleDateString(), contactsSource: 'explorium',
      }
      const id = addDiscoveredAccount(newAccount)
      if (id) { setAddedKeys(prev => new Set(prev).add(c.key)); setTimeout(save, 100) }
      else alert(`${c.company} already in accounts`)
    } catch (e) { alert('Enrich failed: ' + (e as Error).message) }
    setEnriching(null)
  }

  return (
    <div className="max-w-[1080px] mx-auto px-8 py-12">
      <h1 className="text-[32px] font-bold text-text tracking-tight">Discover New Accounts</h1>
      <p className="text-[15px] text-text2 mt-2">
        Pull US specialty pharma companies from Explorium. Current pipeline has {accounts.length} accounts — total US TAM is ~490 in the $25M-$75M band.
      </p>

      {/* Filters */}
      <div className="mt-8 bg-white rounded-2xl border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-text3 uppercase tracking-wide mb-1.5">Revenue Band</label>
          <select value={revenueBand} onChange={e => setRevenueBand(e.target.value)} className="bg-surface2 border border-border rounded-lg px-3 py-2 text-[13px] text-text outline-none focus:border-blue min-w-[140px]">
            <option value="10M-25M">$10M–$25M</option>
            <option value="25M-75M">$25M–$75M (ICP core)</option>
            <option value="75M-200M">$75M–$200M (ref story)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-text3 uppercase tracking-wide mb-1.5">State (optional)</label>
          <select value={state} onChange={e => setState(e.target.value)} className="bg-surface2 border border-border rounded-lg px-3 py-2 text-[13px] text-text outline-none focus:border-blue min-w-[120px]">
            <option value="">All US</option>
            <option value="NJ">New Jersey</option>
            <option value="NY">New York</option>
            <option value="PA">Pennsylvania</option>
            <option value="MA">Massachusetts</option>
            <option value="CA">California</option>
            <option value="IL">Illinois</option>
            <option value="TX">Texas</option>
            <option value="GA">Georgia</option>
            <option value="FL">Florida</option>
            <option value="VA">Virginia</option>
            <option value="MD">Maryland</option>
            <option value="NC">North Carolina</option>
            <option value="RI">Rhode Island</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-text3 uppercase tracking-wide mb-1.5">Results</label>
          <select value={size} onChange={e => setSize(Number(e.target.value))} className="bg-surface2 border border-border rounded-lg px-3 py-2 text-[13px] text-text outline-none focus:border-blue min-w-[80px]">
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <button onClick={search} disabled={loading}
          className="px-5 py-2.5 text-[13px] font-semibold text-white bg-blue rounded-xl hover:bg-blue2 disabled:opacity-40 cursor-pointer transition-colors shadow-sm">
          {loading ? 'Searching…' : 'Find companies'}
        </button>
      </div>

      {error && <div className="mt-4 px-5 py-4 rounded-xl bg-amber-bg border border-amber-border text-[13px] text-amber">{error}</div>}

      {/* Results table */}
      {results.length > 0 && (
        <div className="mt-6">
          {/* Bulk bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] text-text2">
              <strong className="text-text">{results.length}</strong> new companies found
              {selected.size > 0 && <span className="ml-3 text-blue font-medium">{selected.size} selected</span>}
            </div>
            {selected.size > 0 && (
              <button onClick={addSelected} disabled={bulkAdding}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-blue rounded-lg hover:bg-blue2 disabled:opacity-40 cursor-pointer transition-colors">
                {bulkAdding ? 'Adding…' : `+ Add ${selected.size} to Accounts`}
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <table className="w-full">
              <thead className="bg-surface2">
                <tr className="text-[11px] font-semibold uppercase tracking-wide text-text3">
                  <th className="py-3 px-4 text-left w-10"><input type="checkbox" checked={selected.size === results.length && results.length > 0} onChange={toggleSelectAll} className="cursor-pointer" /></th>
                  <th className="py-3 px-4 text-left">Company</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Revenue</th>
                  <th className="py-3 px-4 text-left">Employees</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map(c => {
                  const added = addedKeys.has(c.key)
                  const isEnriching = enriching === c.key
                  return (
                    <tr key={c.key} className={`border-t border-border text-[13px] ${added ? 'bg-green-bg/40' : 'hover:bg-surface2'} transition-colors`}>
                      <td className="py-3 px-4"><input type="checkbox" checked={selected.has(c.key)} onChange={() => toggleSelect(c.key)} disabled={added} className="cursor-pointer" /></td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-text">{c.company}</div>
                        <div className="text-[11px] text-text3">{c.domain || '—'}</div>
                      </td>
                      <td className="py-3 px-4 text-text2">{[c.city, c.state].filter(Boolean).join(', ') || '—'}</td>
                      <td className="py-3 px-4 text-text2">{c.rev}</td>
                      <td className="py-3 px-4 text-text2">{c.emp}</td>
                      <td className="py-3 px-4 text-right">
                        {added ? (
                          <span className="text-[11px] font-semibold text-green bg-green-bg px-3 py-1 rounded-full">✓ Added</span>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => enrichOne(c)} disabled={isEnriching || !c.explorium_id}
                              className="px-3 py-1.5 text-[11px] font-semibold text-purple border border-purple-border rounded-lg hover:bg-purple-bg disabled:opacity-40 cursor-pointer transition-colors">
                              {isEnriching ? 'Enriching…' : 'Enrich + Add'}
                            </button>
                            <button onClick={() => addOne(c)}
                              className="px-3 py-1.5 text-[11px] font-semibold text-text border border-border rounded-lg hover:bg-surface2 cursor-pointer transition-colors">
                              + Add
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[12px] text-text3 mt-3">
            <strong className="text-text2">Enrich + Add</strong> pulls 5 verified C-suite/director contacts per company from Explorium before adding.
            <strong className="text-text2 ml-2">+ Add</strong> creates the account shell for later enrichment.
          </p>
        </div>
      )}

      {results.length === 0 && !loading && !error && (
        <div className="mt-10 text-center py-12 bg-white rounded-2xl border border-border">
          <p className="text-[14px] text-text3">Set your filters and click <strong className="text-text2">Find companies</strong> to pull from Explorium.</p>
          <p className="text-[12px] text-text3 mt-2">Default: US pharma, $25M-$75M revenue, first 50 results.</p>
        </div>
      )}

      <div className="h-16" />
    </div>
  )
}
