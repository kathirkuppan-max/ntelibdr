'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { Account } from '@/lib/types'
import { AccountDetail } from './AccountDetail'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Austin', label: 'Austin' },
  { key: 'Houston', label: 'Houston' },
  { key: 'Dallas/DFW', label: 'Dallas' },
  { key: 'High', label: 'High Priority' },
  { key: 'PE', label: 'PE-Backed' },
]

export function AccountsPage() {
  const { accounts, selectedId, selectAccount } = useStore()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return accounts.filter(a => {
      if (search) {
        const q = search.toLowerCase()
        if (!a.company.toLowerCase().includes(q) && !a.vertical.toLowerCase().includes(q) && !a.city.toLowerCase().includes(q)) return false
      }
      if (filter === 'all') return true
      if (filter === 'PE') return a.pe
      if (filter === 'High') return a.priority === 'High'
      return a.market === filter
    })
  }, [accounts, filter, search])

  return (
    <div className="grid grid-cols-[320px_1fr] h-full">
      {/* Account List */}
      <div className="bg-white border-r border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-semibold text-text">Target Accounts</h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-bg text-blue border border-blue-border">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-surface2 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              placeholder="Search accounts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none text-text text-[13px] outline-none flex-1 placeholder-text3"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-5 py-3 flex gap-1.5 flex-wrap shrink-0 border-b border-border">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[11px] px-3 py-1 rounded-full border font-medium cursor-pointer transition-all select-none ${
                filter === f.key
                  ? 'bg-blue text-white border-blue shadow-sm'
                  : 'border-border text-text2 hover:border-border2 hover:text-text bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filtered.map(a => (
            <AccountRow key={a.id} account={a} selected={selectedId === a.id} onClick={() => selectAccount(a.id)} />
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedId ? (
        <AccountDetail />
      ) : (
        <div className="flex flex-col items-center justify-center text-text3 text-center gap-4 bg-bg">
          <div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center text-3xl">
            &#x1F3AF;
          </div>
          <div>
            <div className="text-[16px] font-semibold text-text2 mb-1">Select an account</div>
            <p className="text-[13px] text-text3 max-w-[240px] leading-relaxed">
              Account intel, contacts, and meeting follow-ups — all in one view.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const STAGE_COLORS: Record<string, string> = {
  Prospect: '#A3A3A3',
  Connected: '#2563EB',
  Met: '#D97706',
  'Following Up': '#0D9488',
  Engaged: '#3B82F6',
  Meeting: '#16A34A',
  Proposal: '#D97706',
  Won: '#16A34A',
  Lost: '#DC2626',
}

const PRIO_COLORS: Record<string, string> = {
  High: '#D97706',
  Medium: '#3B82F6',
  Low: '#A3A3A3',
}

function AccountRow({ account: a, selected, onClick }: { account: Account; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`px-5 py-3 border-b border-border/60 cursor-pointer transition-all relative group ${
        selected
          ? 'bg-blue-bg border-l-[3px] border-l-blue'
          : 'hover:bg-surface2'
      }`}
    >
      <div
        className="w-2 h-2 rounded-full absolute right-4 top-4"
        style={{ background: STAGE_COLORS[a.stage] || '#A3A3A3' }}
      />
      <div className="text-[14px] font-semibold text-text truncate pr-6 mb-1">{a.company}</div>
      <div className="flex items-center gap-2 text-[12px] text-text2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PRIO_COLORS[a.priority] }} />
        <span>{a.city}</span>
        <span className="text-text3">·</span>
        <span className="truncate text-text3">{a.vertical.substring(0, 28)}</span>
        {a.pe && (
          <span className="inline-flex items-center px-1.5 py-px rounded text-[9px] font-semibold bg-purple-bg text-purple border border-purple-border">PE</span>
        )}
      </div>
    </div>
  )
}
