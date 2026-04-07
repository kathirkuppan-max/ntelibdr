'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { TodayPage } from './TodayPage'
import { DashboardPage } from './DashboardPage'
import { LoginScreen } from './LoginScreen'

type Page = 'today' | 'dashboard'

export type { Page }

export function AppShell() {
  const [page, setPage] = useState<Page>('today')
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const { setUser, user } = useStore()

  useEffect(() => {
    fetch('/api/auth?action=check')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          setAuthenticated(true)
          setUser({ email: d.email, name: d.name, picture: d.picture })
        } else {
          setAuthenticated(false)
        }
      })
      .catch(() => setAuthenticated(true))
  }, [setUser])

  if (authenticated === null) {
    return <div className="flex items-center justify-center h-screen bg-bg"><div className="spinner" /></div>
  }
  if (!authenticated) return <LoginScreen />

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Minimal top bar */}
      <header className="h-[52px] shrink-0 bg-white border-b border-border flex items-center px-6">
        <div className="text-[15px] font-bold tracking-tight mr-8">
          NTELI <span className="text-blue">BDR</span>
        </div>
        <nav className="flex h-full gap-1">
          <NavTab active={page === 'today'} onClick={() => setPage('today')}>Today</NavTab>
          <NavTab active={page === 'dashboard'} onClick={() => setPage('dashboard')}>Dashboard</NavTab>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[12px] text-text2">{user?.email}</span>
          <a href="/api/auth?action=logout" className="text-[12px] text-text3 hover:text-red transition-colors">Sign out</a>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {page === 'today' && <TodayPage firstName={firstName} />}
        {page === 'dashboard' && <DashboardPage />}
      </main>
    </div>
  )
}

function NavTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 text-[13px] font-medium border-b-2 cursor-pointer transition-all ${
        active ? 'text-blue border-blue' : 'text-text3 border-transparent hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}
