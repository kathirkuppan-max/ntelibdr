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
      <header className="h-14 shrink-0 bg-white flex items-center px-8 border-b border-border">
        <span className="text-[15px] font-bold tracking-tight">
          NTELI <span className="text-blue">BDR</span>
        </span>

        <div className="w-px h-6 bg-border mx-5" />

        <nav className="flex h-full gap-1">
          {(['today', 'dashboard'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer capitalize ${
                page === p ? 'text-text border-text' : 'text-text3 border-transparent hover:text-text2'
              }`}
            >
              {p}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-5 text-[12px]">
          <span className="text-text2">{user?.email}</span>
          <a href="/api/auth?action=logout" className="text-text3 hover:text-red transition-colors">Sign out</a>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {page === 'today' && <TodayPage firstName={firstName} />}
        {page === 'dashboard' && <DashboardPage />}
      </main>
    </div>
  )
}
