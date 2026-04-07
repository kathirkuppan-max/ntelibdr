'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Topbar } from './Topbar'
import { StatusBar } from './StatusBar'
import { EventsPage } from './EventsPage'
import { AccountsPage } from './AccountsPage'
import { PipelinePage } from './PipelinePage'
import { SettingsPage } from './SettingsPage'
import { LoginScreen } from './LoginScreen'

export type Page = 'events' | 'accounts' | 'pipeline' | 'settings'

export function AppShell() {
  const [page, setPage] = useState<Page>('events')
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const { setUser } = useStore()

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
      .catch(() => {
        // Dev mode — show app anyway
        setAuthenticated(true)
      })
  }, [setUser])

  if (authenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="spinner" />
      </div>
    )
  }

  if (!authenticated) {
    return <LoginScreen />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar currentPage={page} onNavigate={setPage} />
      <main className="flex-1 overflow-hidden relative">
        {page === 'events' && <EventsPage />}
        {page === 'accounts' && <AccountsPage />}
        {page === 'pipeline' && <PipelinePage onNavigate={setPage} />}
        {page === 'settings' && <SettingsPage />}
      </main>
      <StatusBar />
    </div>
  )
}
