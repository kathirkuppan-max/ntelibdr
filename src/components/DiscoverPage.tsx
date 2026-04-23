'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'

interface EnrichmentRun {
  runAt: string
  scanned: number
  added: number
  skippedDedupe: number
  skippedFilter: number
  addedCompanies: string[]
  skipReasons: Record<string, number>
}

// Read-only enrichment status page.
// Accounts are added by the daily Vercel Cron — no manual add/remove here.
export function DiscoverPage() {
  const { accounts, reloadFromDb } = useStore()
  const [log, setLog] = useState<EnrichmentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadLog() {
    setLoading(true)
    try {
      const r = await fetch('/api/enrich?action=log')
      const d = await r.json()
      if (d.success) setLog(d.log || [])
    } catch (e) { setError((e as Error).message) }
    setLoading(false)
  }

  async function runNow() {
    setRunning(true)
    setError(null)
    try {
      const r = await fetch('/api/enrich', { method: 'POST' })
      const d = await r.json()
      if (!d.success) throw new Error(d.error || 'Failed')
      await Promise.all([loadLog(), reloadFromDb()])
    } catch (e) { setError((e as Error).message) }
    setRunning(false)
  }

  useEffect(() => { loadLog() }, [])

  const latest = log[0]
  const totalAddedAllTime = log.reduce((sum, r) => sum + r.added, 0)
  const enrichedAccounts = accounts.filter(a => a.source === 'enriched' || a.source === 'explorium+enriched')

  return (
    <div className="max-w-[960px] mx-auto px-8 py-12">
      <div className="flex items-start justify-between gap-6 mb-3">
        <div>
          <h1 className="text-[32px] font-bold text-text tracking-tight">Background Enrichment</h1>
          <p className="text-[15px] text-text2 mt-2 leading-relaxed">
            A daily Vercel Cron scans Explorium for US specialty pharma ($10M-$200M) and auto-adds only companies
            with C-suite or Director-level contacts that pass the ICP filter. No manual curation.
          </p>
        </div>
        <button
          onClick={runNow}
          disabled={running}
          className="shrink-0 px-4 py-2.5 text-[13px] font-semibold text-text border border-border rounded-xl hover:bg-surface2 disabled:opacity-40 cursor-pointer transition-colors"
        >
          {running ? 'Running…' : 'Run now'}
        </button>
      </div>

      {error && <div className="mt-4 px-5 py-4 rounded-xl bg-red-bg border border-red-border text-[13px] text-red">{error}</div>}

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mt-8">
        <Stat label="Total Pipeline" value={accounts.length} />
        <Stat label="Auto-Enriched" value={enrichedAccounts.length} accent="blue" />
        <Stat label="Added All-Time" value={totalAddedAllTime} accent="green" />
        <Stat label="Last Run" value={latest ? timeAgo(latest.runAt) : '—'} small />
      </div>

      {/* ── ICP Filter Rules ── */}
      <div className="mt-10">
        <Section label="ICP filter rules">
          <div className="bg-white rounded-2xl border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <ul className="space-y-2 text-[13px] text-text2 leading-relaxed">
              <li><span className="text-green font-bold">✓</span> US pharmaceutical manufacturing</li>
              <li><span className="text-green font-bold">✓</span> Revenue in $10M-$200M (core: $25M-$75M)</li>
              <li><span className="text-green font-bold">✓</span> Employee count 20-500 (skip &lt;20 = spreadsheets, &gt;500 = Model N territory)</li>
              <li><span className="text-green font-bold">✓</span> Has ≥1 verifiable buyer-persona contact (CFO / Director Contracts / VP)</li>
              <li><span className="text-green font-bold">✓</span> Has a real domain</li>
              <li><span className="text-red font-bold">✗</span> Already in your pipeline (dedupe by domain + name)</li>
            </ul>
          </div>
        </Section>
      </div>

      {/* ── Recent Runs ── */}
      <div className="mt-10">
        <Section label="Recent runs">
          {loading ? (
            <p className="text-[14px] text-text3 py-6 text-center">Loading…</p>
          ) : log.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <p className="text-[14px] text-text3">No runs yet. The daily cron triggers at 10am UTC.</p>
              <p className="text-[12px] text-text3 mt-2">Click <strong className="text-text">Run now</strong> to trigger a manual run.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <table className="w-full">
                <thead className="bg-surface2">
                  <tr className="text-[11px] font-semibold uppercase tracking-wide text-text3">
                    <th className="py-3 px-4 text-left">When</th>
                    <th className="py-3 px-4 text-right">Scanned</th>
                    <th className="py-3 px-4 text-right">Added</th>
                    <th className="py-3 px-4 text-right">Deduped</th>
                    <th className="py-3 px-4 text-right">Filtered Out</th>
                    <th className="py-3 px-4 text-left">Added Companies</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((r, i) => (
                    <tr key={i} className="border-t border-border text-[13px]">
                      <td className="py-3 px-4 text-text whitespace-nowrap">
                        <div>{new Date(r.runAt).toLocaleDateString()}</div>
                        <div className="text-[11px] text-text3">{new Date(r.runAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-text2 font-medium">{r.scanned}</td>
                      <td className="py-3 px-4 text-right font-bold text-green">+{r.added}</td>
                      <td className="py-3 px-4 text-right text-text3">{r.skippedDedupe}</td>
                      <td className="py-3 px-4 text-right text-text3">{r.skippedFilter}</td>
                      <td className="py-3 px-4 text-text2 max-w-[280px]">
                        {r.addedCompanies.length > 0 ? (
                          <span className="text-[12px]">{r.addedCompanies.slice(0, 3).join(', ')}{r.addedCompanies.length > 3 ? ` + ${r.addedCompanies.length - 3} more` : ''}</span>
                        ) : (
                          <span className="text-text3 italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* ── Latest run skip breakdown ── */}
      {latest && Object.keys(latest.skipReasons).length > 0 && (
        <div className="mt-10">
          <Section label="Latest run — skip reasons">
            <div className="bg-white rounded-2xl border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="space-y-2">
                {Object.entries(latest.skipReasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between text-[13px]">
                    <span className="text-text2">{reason}</span>
                    <span className="text-text3 font-mono text-[12px] bg-surface2 px-2 py-0.5 rounded">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      )}

      <div className="h-16" />
    </div>
  )
}

function Stat({ label, value, accent, small }: { label: string; value: number | string; accent?: string; small?: boolean }) {
  const c = accent === 'green' ? 'text-green' : accent === 'blue' ? 'text-blue' : 'text-text'
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <p className="text-[11px] text-text3 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`font-bold mt-1 ${c} ${small ? 'text-[15px]' : 'text-[28px]'}`}>{value}</p>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-text3">{label}</h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
