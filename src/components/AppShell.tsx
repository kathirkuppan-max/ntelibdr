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
          if (window.location.hostname === 'localhost') {
            setAuthenticated(true)
            setUser({ email: 'dev@nteligroup.com', name: 'Dev', picture: '' })
          } else {
            setAuthenticated(false)
          }
        }
      })
      .catch(() => {
        setAuthenticated(true)
        setUser({ email: 'dev@nteligroup.com', name: 'Dev', picture: '' })
      })
  }, [setUser])

  if (authenticated === null) {
    return <div className="flex items-center justify-center h-screen bg-bg"><div className="spinner" /></div>
  }
  if (!authenticated) return <LoginScreen />

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Top bar */}
      <header className="h-14 shrink-0 bg-white flex items-center px-6 border-b border-border">
        <span className="text-base font-bold tracking-tight">
          NTELI <span className="text-blue">BDR</span>
        </span>

        <nav className="flex h-full ml-8 gap-1">
          {(['today', 'dashboard'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 text-[13px] font-medium border-b-2 transition-colors cursor-pointer capitalize ${
                page === p ? 'text-blue border-blue' : 'text-text3 border-transparent hover:text-text'
              }`}
            >
              {p}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 text-[12px] text-text3">
          <span>{user?.email}</span>
          <a href="/api/auth?action=logout" className="hover:text-red transition-colors">Sign out</a>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {page === 'today' && <TodayPage firstName={firstName} />}
        {page === 'dashboard' && <DashboardPage />}
      </main>
    </div>
  )
}
