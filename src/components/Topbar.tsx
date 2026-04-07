'use client'

import { useStore } from '@/lib/store'
import type { Page } from './AppShell'

const TABS: { key: Page; label: string }[] = [
  { key: 'events', label: 'Events' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'settings', label: 'Settings' },
]

export function Topbar({ currentPage, onNavigate }: { currentPage: Page; onNavigate: (p: Page) => void }) {
  const { dbReady, gmailConnected, gmailEmail, user } = useStore()

  return (
    <header className="h-13 shrink-0 bg-surface flex items-center px-5 border-b border-border">
      <div className="text-base font-bold tracking-tight mr-6">
        NTELI <span className="text-blue">BDR</span>
      </div>

      <nav className="flex h-full">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            className={`flex items-center px-4 text-[13px] font-medium border-b-2 transition-all cursor-pointer select-none ${
              currentPage === tab.key
                ? 'text-blue border-blue'
                : 'text-text2 border-transparent hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex gap-2 items-center ml-auto">
        <Pill dot={dbReady ? '#22C55E' : '#F85149'}>DB</Pill>
        <Pill dot={gmailConnected ? '#22C55E' : '#F85149'}>
          {gmailConnected ? `Gmail: ${gmailEmail}` : 'Gmail'}
        </Pill>
        <Pill>Claude AI</Pill>
        {user && (
          <a
            href="/api/auth?action=logout"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-border2 bg-surface2 text-text2 hover:text-text cursor-pointer"
            title={`${user.email} — click to sign out`}
          >
            {user.name || user.email.split('@')[0]}
          </a>
        )}
      </div>
    </header>
  )
}

function Pill({ children, dot }: { children: React.ReactNode; dot?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-border2 bg-surface2 text-text2">
      {dot && (
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
          style={{ background: dot }}
        />
      )}
      {children}
    </div>
  )
}
