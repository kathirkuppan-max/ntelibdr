'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { Stage } from '@/lib/types'
import type { Page } from './AppShell'

const STAGES: Stage[] = ['Prospect', 'Connected', 'Met', 'Following Up', 'Engaged', 'Meeting', 'Proposal']

const STAGE_COLORS: Record<string, string> = {
  Prospect: '#A3A3A3',
  Connected: '#2563EB',
  Met: '#D97706',
  'Following Up': '#0D9488',
  Engaged: '#3B82F6',
  Meeting: '#16A34A',
  Proposal: '#D97706',
}

export function PipelinePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { accounts, selectAccount } = useStore()

  const columns = useMemo(() => {
    return STAGES.map(stage => ({
      stage,
      accounts: accounts.filter(a => a.stage === stage),
    }))
  }, [accounts])

  function goToAccount(id: number) {
    selectAccount(id)
    onNavigate('accounts')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden px-6 py-5 gap-4">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-[20px] font-bold text-text">Pipeline Tracker</h1>
      </div>
      <div className="grid grid-cols-7 gap-3 flex-1 overflow-hidden min-h-0">
        {columns.map(col => (
          <div key={col.stage} className="bg-white border border-border rounded-xl flex flex-col overflow-hidden min-h-0 shadow-sm">
            <div
              className="px-3.5 py-3 border-b border-border shrink-0"
              style={{ borderTop: `3px solid ${STAGE_COLORS[col.stage] || '#A3A3A3'}` }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text3 mb-1">{col.stage}</div>
              <div className="text-[24px] font-bold leading-none text-text">{col.accounts.length}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 min-h-0 space-y-2">
              {col.accounts.length === 0 ? (
                <p className="text-[12px] text-text3 italic px-2 py-2">Empty</p>
              ) : (
                col.accounts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => goToAccount(a.id)}
                    className="w-full text-left bg-surface2 border border-border rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-border hover:bg-blue-bg transition-all"
                  >
                    <div className="text-[13px] font-semibold text-text truncate">{a.company}</div>
                    <div className="text-[11px] text-text2 mt-0.5">{a.priority} · {a.city}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
