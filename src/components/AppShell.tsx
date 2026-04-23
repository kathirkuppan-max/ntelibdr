'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { TodayPage } from './TodayPage'
import { DashboardPage } from './DashboardPage'
import { DiscoverPage } from './DiscoverPage'
import { LoginScreen } from './LoginScreen'

type Page = 'today' | 'dashboard' | 'enrichment'
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
      {/* Purple header — AI Tinkerers style */}
      <header className="shrink-0 bg-gradient-to-r from-[#4338CA] to-[#6366F1] text-white">
        <div className="max-w-[960px] mx-auto px-8 flex items-center h-14">
          <span className="text-[16px] font-bold tracking-tight whitespace-nowrap">
            NTELI BDR
          </span>

          <div className="w-px h-5 bg-white/20 mx-6 shrink-0" />

          <nav className="flex h-full gap-2">
            {(['today', 'dashboard', 'enrichment'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer capitalize whitespace-nowrap ${
                  page === p
                    ? 'text-white border-white'
                    : 'text-white/60 border-transparent hover:text-white/90'
                }`}
              >
                {p}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-5 text-[12px] shrink-0">
            <span className="text-white/60 hidden sm:inline">{user?.email}</span>
            <a href="/api/auth?action=logout" className="text-white/40 hover:text-white transition-colors whitespace-nowrap">Sign out</a>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {page === 'today' && <TodayPage firstName={firstName} />}
        {page === 'dashboard' && <DashboardPage />}
        {page === 'enrichment' && <DiscoverPage />}
      </main>
    </div>
  )
}
