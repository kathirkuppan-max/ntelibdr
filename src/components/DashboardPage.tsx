'use client'

import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import type { Account, Stage } from '@/lib/types'
import { AccountDetailDrawer } from './AccountDetailDrawer'
import { MeetingLoggerModal } from './MeetingLoggerModal'
import { EmailEditorModal } from './EmailEditorModal'

const STAGE_ORDER: Stage[] = ['Prospect', 'Connected', 'Met', 'Following Up', 'Engaged', 'Meeting', 'Proposal', 'Won', 'Lost']
const STAGE_COLOR: Record<string, string> = {
  Prospect: 'bg-surface3 text-text2', Connected: 'bg-blue-bg text-blue', Met: 'bg-amber-bg text-amber',
  'Following Up': 'bg-purple-bg text-purple', Engaged: 'bg-blue-bg text-blue', Meeting: 'bg-green-bg text-green',
  Proposal: 'bg-amber-bg text-amber', Won: 'bg-green-bg text-green', Lost: 'bg-red-bg text-red',
}

type SortKey = 'company' | 'rev' | 'emp' | 'signals' | 'contacts' | 'stage'

export function DashboardPage() {
  const { accounts, reloadFromDb } = useStore()
  const [expandedStage, setExpandedStage] = useState<Stage | null>(null)
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null)
  const [meetingModal, setMeetingModal] = useState<{ open: boolean; accountId?: number }>({ open: false })
  const [emailModal, setEmailModal] = useState<{ open: boolean; accountId?: number; meetingIdx?: number; fuIdx?: number }>({ open: false })
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; totalPulled: number; afterDedupe: number; importedCompanies?: string[]; debug?: string[] } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Accounts table state
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'enriched' | 'hot' | 'missing-contacts' | 'missing-signals'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('signals')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  async function runImport() {
    if (importing) return
    if (!confirm('Import the full US specialty pharma ICP universe from Explorium?\nThis pulls ~400+ companies with signals and writes them to Neon. One-time.')) return
    setImporting(true); setImportError(null); setImportResult(null)
    try {
      const r = await fetch('/api/import', { method: 'POST' })
      const d = await r.json()
      if (!d.success) throw new Error(d.error || 'Import failed')
      setImportResult(d)
      await reloadFromDb()
    } catch (e) { setImportError((e as Error).message) }
    setImporting(false)
  }

  const stats = useMemo(() => {
    let totalMeetings = 0, totalSent = 0, totalPending = 0
    accounts.forEach(a => {
      (a.meetings || []).forEach(m => {
        totalMeetings++
        m.followUps.forEach(fu => { if (fu.status === 'sent') totalSent++; if (fu.status === 'ready') totalPending++ })
      })
    })
    const totalSignals = accounts.reduce((sum, a) => sum + (a.signals?.length || 0), 0)
    const hotAccounts = accounts.filter(a => (a.signals?.length || 0) > 0).length
    return { totalMeetings, totalSent, totalPending, totalSignals, hotAccounts, total: accounts.length }
  }, [accounts])

  const pipeline = useMemo(() => {
    return STAGE_ORDER.map(s => ({ stage: s, accounts: accounts.filter(a => a.stage === s) })).filter(s => s.accounts.length > 0)
  }, [accounts])

  const activity = useMemo(() => {
    const items: { date: string; type: string; desc: string; account: string; accountId: number }[] = []
    accounts.forEach(a => {
      (a.meetings || []).forEach(m => {
        items.push({ date: m.date, type: 'meeting', desc: `Met ${m.contact}`, account: a.company, accountId: a.id })
        m.followUps.forEach(fu => {
          if (fu.status === 'sent' && fu.sentAt) items.push({ date: fu.sentAt, type: 'email', desc: `Sent Day ${fu.day} to ${m.contact}`, account: a.company, accountId: a.id })
        })
      })
    })
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20)
  }, [accounts])

  const activeAccount = accounts.find(a => a.id === activeAccountId) || null

  // Rows for the All Accounts table
  const tableRows = useMemo(() => {
    const rows = accounts.map(a => {
      const contactCount = (a.contacts?.length ?? 0)
      const signalCount = (a.signals?.length ?? 0)
      const hasContacts = contactCount > 0
      const hasSignals = signalCount > 0
      const enriched = hasContacts && hasSignals
      return { ...a, contactCount, signalCount, hasContacts, hasSignals, enriched }
    })
    let filtered = rows
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(r =>
        r.company.toLowerCase().includes(q) ||
        (r.city || '').toLowerCase().includes(q) ||
        (r.vertical || '').toLowerCase().includes(q)
      )
    }
    if (filter === 'enriched') filtered = filtered.filter(r => r.enriched)
    else if (filter === 'hot') filtered = filtered.filter(r => r.hasSignals)
    else if (filter === 'missing-contacts') filtered = filtered.filter(r => !r.hasContacts)
    else if (filter === 'missing-signals') filtered = filtered.filter(r => !r.hasSignals)

    filtered.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'signals') return (a.signalCount - b.signalCount) * dir
      if (sortKey === 'contacts') return (a.contactCount - b.contactCount) * dir
      if (sortKey === 'emp') return (String(a.emp) < String(b.emp) ? -1 : 1) * dir
      if (sortKey === 'rev') return (String(a.rev) < String(b.rev) ? -1 : 1) * dir
      if (sortKey === 'stage') return (a.stage < b.stage ? -1 : 1) * dir
      return (a.company.toLowerCase() < b.company.toLowerCase() ? -1 : 1) * dir
    })
    return filtered
  }, [accounts, search, filter, sortKey, sortDir])

  function handleSort(k: SortKey) {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir(k === 'signals' || k === 'contacts' ? 'desc' : 'asc') }
  }

  return (
    <div className="max-w-[960px] mx-auto px-8 py-12">
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-[32px] font-bold text-text tracking-tight">Dashboard</h1>
        <button
          onClick={runImport}
          disabled={importing}
          className="px-4 py-2 text-[13px] font-semibold text-white bg-blue rounded-lg hover:bg-blue2 disabled:opacity-40 cursor-pointer shadow-sm"
        >
          {importing ? 'Importing…' : 'Import ICP Universe'}
        </button>
      </div>

      {importError && (
        <div className="mb-6 px-5 py-4 rounded-xl bg-red-bg border border-red-border text-[13px] text-red">Import failed: {importError}</div>
      )}
      {importResult && (
        <div className={`mb-6 px-5 py-4 rounded-xl border text-[13px] ${importResult.imported > 0 ? 'bg-green-bg border-green-border text-green' : 'bg-amber-bg border-amber-border text-amber'}`}>
          <strong>{importResult.imported > 0 ? `Imported ${importResult.imported} new accounts` : 'No accounts imported'}</strong> · pulled {importResult.totalPulled} from Explorium · {importResult.afterDedupe} unique after dedupe.
          {importResult.importedCompanies && importResult.importedCompanies.length > 0 && (
            <div className="text-[12px] opacity-80 mt-1">First 20: {importResult.importedCompanies.join(', ')}{importResult.imported > 20 ? '…' : ''}</div>
          )}
          {importResult.debug && importResult.debug.length > 0 && (
            <details className="text-[12px] opacity-80 mt-2">
              <summary className="cursor-pointer font-semibold">Diagnostics ({importResult.debug.length})</summary>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px]">{importResult.debug.join('\n')}</pre>
            </details>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-10">
        <StatCard label="Accounts" value={stats.total} />
        <StatCard label="Hot (signals)" value={stats.hotAccounts} color="amber" />
        <StatCard label="Meetings" value={stats.totalMeetings} />
        <StatCard label="Emails Sent" value={stats.totalSent} color="green" />
        <StatCard label="Pending" value={stats.totalPending} color={stats.totalPending > 0 ? 'amber' : undefined} />
      </div>

      {/* Pipeline */}
      <Section label="Pipeline">
        <div className="flex flex-wrap gap-2 mb-4">
          {pipeline.map(p => (
            <button
              key={p.stage}
              onClick={() => setExpandedStage(expandedStage === p.stage ? null : p.stage)}
              className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all ${
                expandedStage === p.stage
                  ? `${STAGE_COLOR[p.stage]} ring-2 ring-offset-1 ring-current`
                  : `${STAGE_COLOR[p.stage]} hover:opacity-80`
              }`}
            >
              {p.stage} <span className="font-bold ml-1">{p.accounts.length}</span>
            </button>
          ))}
        </div>
        {expandedStage && (
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {pipeline.find(p => p.stage === expandedStage)?.accounts.map((a, i, arr) => (
              <div
                key={a.id}
                onClick={() => setActiveAccountId(a.id)}
                className={`flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-surface2 transition-colors ${i < arr.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface2 flex items-center justify-center text-[12px] font-bold text-text3">{a.company.substring(0, 2).toUpperCase()}</div>
                  <div>
                    <p className="text-[14px] font-medium text-text">{a.company}</p>
                    <p className="text-[12px] text-text3">{a.city} · {a.rev}</p>
                  </div>
                </div>
                <span className="text-[12px] text-text3">{(a.meetings || []).length} meetings</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* All Accounts Table */}
      <Section label={`All Accounts (${tableRows.length} of ${accounts.length})`}>
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-3">
          <input
            type="text"
            placeholder="Search company, city, vertical..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[220px] bg-white border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue"
          />
          {([
            ['all', 'All'],
            ['enriched', 'Enriched'],
            ['hot', 'Hot (signals)'],
            ['missing-contacts', 'Missing contacts'],
            ['missing-signals', 'Missing signals'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 text-[12px] font-semibold rounded-lg cursor-pointer transition-colors ${
                filter === key
                  ? 'bg-blue text-white'
                  : 'bg-white border border-border text-text2 hover:bg-surface2'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-surface2 border-b border-border">
                <tr>
                  <Th onClick={() => handleSort('company')} active={sortKey === 'company'} dir={sortDir}>Company</Th>
                  <Th>Location</Th>
                  <Th onClick={() => handleSort('rev')} active={sortKey === 'rev'} dir={sortDir}>Revenue</Th>
                  <Th onClick={() => handleSort('emp')} active={sortKey === 'emp'} dir={sortDir}>Emps</Th>
                  <Th onClick={() => handleSort('stage')} active={sortKey === 'stage'} dir={sortDir}>Stage</Th>
                  <Th onClick={() => handleSort('contacts')} active={sortKey === 'contacts'} dir={sortDir}>Contacts</Th>
                  <Th onClick={() => handleSort('signals')} active={sortKey === 'signals'} dir={sortDir}>Signals</Th>
                  <Th>Enrichment</Th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r, i) => (
                  <tr
                    key={r.id}
                    onClick={() => setActiveAccountId(r.id)}
                    className={`cursor-pointer hover:bg-surface2 transition-colors ${i < tableRows.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-text">{r.company}</div>
                      <div className="text-[11px] text-text3">{r.vertical}</div>
                    </td>
                    <td className="px-4 py-3 text-text2">{r.city || '—'}</td>
                    <td className="px-4 py-3 text-text2">{r.rev}</td>
                    <td className="px-4 py-3 text-text2">{r.emp}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${STAGE_COLOR[r.stage] || 'bg-surface2 text-text3'}`}>
                        {r.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.contactCount > 0 ? (
                        <span className="text-green font-bold">{r.contactCount}</span>
                      ) : (
                        <span className="text-text3">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.signalCount > 0 ? (
                        <span className="text-amber font-bold">{r.signalCount}</span>
                      ) : (
                        <span className="text-text3">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EnrichmentBadge hasContacts={r.hasContacts} hasSignals={r.hasSignals} />
                    </td>
                  </tr>
                ))}
                {tableRows.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-text3">No accounts match your filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Activity Log */}
      <Section label="Activity Log">
        {activity.length === 0 ? (
          <p className="text-[14px] text-text3 py-8 text-center">No activity yet. Meet someone at an event to get started.</p>
        ) : (
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {activity.map((item, i) => (
              <div
                key={i}
                onClick={() => setActiveAccountId(item.accountId)}
                className={`flex items-start gap-4 px-5 py-3.5 cursor-pointer hover:bg-surface2 transition-colors ${i < activity.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span className="text-[16px] mt-0.5">{item.type === 'meeting' ? '🤝' : '📧'}</span>
                <div className="flex-1">
                  <p className="text-[13px] text-text">{item.desc}</p>
                  <p className="text-[12px] text-text3">{item.account}</p>
                </div>
                <span className="text-[11px] text-text3 font-mono shrink-0">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="h-20" />

      {/* Drawers/Modals */}
      {activeAccountId && (
        <AccountDetailDrawer
          account={activeAccount}
          onClose={() => setActiveAccountId(null)}
          onLogMeeting={(id) => { setActiveAccountId(null); setMeetingModal({ open: true, accountId: id }) }}
          onEditEmail={(id, mi, fi) => { setActiveAccountId(null); setEmailModal({ open: true, accountId: id, meetingIdx: mi, fuIdx: fi }) }}
        />
      )}

      <MeetingLoggerModal open={meetingModal.open} onClose={() => setMeetingModal({ open: false })} defaultAccountId={meetingModal.accountId} />

      {emailModal.open && emailModal.accountId !== undefined && (() => {
        const acct = accounts.find(a => a.id === emailModal.accountId)
        if (!acct?.meetings?.[emailModal.meetingIdx!]) return null
        return <EmailEditorModal open={true} onClose={() => setEmailModal({ open: false })} account={acct} meeting={acct.meetings[emailModal.meetingIdx!]} meetingIdx={emailModal.meetingIdx!} followUpIdx={emailModal.fuIdx!} />
      })()}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  const c = color === 'green' ? 'text-green' : color === 'amber' ? 'text-amber' : 'text-text'
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <p className="text-[11px] text-text3 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-[28px] font-bold mt-1 ${c}`}>{value}</p>
    </div>
  )
}

function Th({ children, onClick, active, dir }: { children: React.ReactNode; onClick?: () => void; active?: boolean; dir?: 'asc' | 'desc' }) {
  return (
    <th
      onClick={onClick}
      className={`text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider ${onClick ? 'cursor-pointer hover:text-text' : ''} ${active ? 'text-blue' : 'text-text3'}`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {active && <span className="text-[9px]">{dir === 'asc' ? '▲' : '▼'}</span>}
      </span>
    </th>
  )
}

function EnrichmentBadge({ hasContacts, hasSignals }: { hasContacts: boolean; hasSignals: boolean }) {
  if (hasContacts && hasSignals) {
    return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-bg text-green">✓ Full</span>
  }
  if (hasContacts) {
    return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-bg text-blue">Contacts only</span>
  }
  if (hasSignals) {
    return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-bg text-amber">Signals only</span>
  }
  return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface2 text-text3">Not enriched</span>
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-text3">{label}</h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  )
}
