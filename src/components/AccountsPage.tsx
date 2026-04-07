'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { Account, Stage } from '@/lib/types'
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
    <div className="grid grid-cols-[300px_1fr] h-full">
      {/* Account List */}
      <div className="bg-surface border-r border-border flex flex-col overflow-hidden">
        <div className="p-3.5 pb-2.5 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[15px] font-semibold">Target Accounts</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-bg text-blue border border-blue-border">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-surface2 border border-border rounded-md px-2.5 py-1.5">
            <span className="text-text3 text-sm">&#x2315;</span>
            <input
              placeholder="Search accounts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none text-text text-[13px] outline-none flex-1"
            />
          </div>
        </div>

        <div className="px-3.5 py-2 flex gap-1.5 flex-wrap shrink-0 border-b border-border">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium cursor-pointer transition-all select-none ${
                filter === f.key
                  ? 'bg-blue-bg border-blue-border text-blue font-semibold'
                  : 'border-border text-text3 hover:text-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

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
        <div className="flex flex-col items-center justify-center text-text3 text-center gap-3 bg-bg">
          <div className="text-5xl opacity-20">&#x1F3AF;</div>
          <div className="text-lg font-semibold opacity-30">Select an account</div>
          <p className="text-[13px] text-text3 max-w-[220px] leading-relaxed">
            Account intel, contacts, and meeting follow-ups — all in one view.
          </p>
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
      className={`px-4 py-2.5 border-b border-border cursor-pointer transition-colors relative ${
        selected ? 'bg-blue-bg border-l-3 border-l-blue' : 'hover:bg-surface2'
      }`}
    >
      <div
        className="w-[7px] h-[7px] rounded-full absolute right-2.5 top-3"
        style={{ background: STAGE_COLORS[a.stage] || '#374458' }}
      />
      <div className="text-sm font-semibold truncate pr-5 mb-0.5">{a.company}</div>
      <div className="flex items-center gap-1.5 text-xs text-text3">
        <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: PRIO_COLORS[a.priority] }} />
        <span>{a.city}</span>
        <span>·</span>
        <span className="truncate">{a.vertical.substring(0, 28)}</span>
        {a.pe && (
          <span className="inline-flex items-center px-1.5 py-px rounded-full text-[9px] font-medium bg-purple-bg text-purple border border-purple-border">PE</span>
        )}
      </div>
    </div>
  )
}
