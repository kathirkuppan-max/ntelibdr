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
    <header className="h-[56px] shrink-0 bg-white flex items-center px-6 border-b border-border shadow-sm">
      <div className="text-[17px] font-bold tracking-tight mr-8">
        NTELI <span className="text-blue">BDR</span>
      </div>

      <nav className="flex h-full gap-1">
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

      <div className="flex gap-2.5 items-center ml-auto">
        <Pill dot={dbReady ? '#22C55E' : '#EF4444'}>DB</Pill>
        <Pill dot={gmailConnected ? '#22C55E' : '#EF4444'}>
          {gmailConnected ? gmailEmail : 'Gmail'}
        </Pill>
        <Pill>Claude AI</Pill>
        {user && (
          <a
            href="/api/auth?action=logout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-surface2 text-text2 hover:text-text hover:bg-surface3 cursor-pointer transition-colors"
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
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-surface2 text-text2">
      {dot && (
        <div
          className="w-[6px] h-[6px] rounded-full animate-pulse-slow"
          style={{ background: dot }}
        />
      )}
      {children}
    </div>
  )
}
