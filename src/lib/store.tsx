'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Account, BdrEvent, Stage } from './types'
import { SEED_ACCOUNTS } from './seed-accounts'
import { SEED_EVENTS } from './seed-events'
import { PRE_ENRICHED } from './contacts'

interface AppState {
  accounts: Account[]
  events: BdrEvent[]
  selectedId: number | null
  gmailConnected: boolean
  gmailEmail: string
  dbReady: boolean
  user: { email: string; name: string; picture: string } | null
}

interface AppActions {
  setAccounts: (accounts: Account[]) => void
  updateAccount: (id: number, patch: Partial<Account>) => void
  setEvents: (events: BdrEvent[]) => void
  updateEvent: (id: string, patch: Partial<BdrEvent>) => void
  selectAccount: (id: number | null) => void
  setGmail: (connected: boolean, email: string) => void
  setDbReady: (ready: boolean) => void
  setUser: (user: AppState['user']) => void
  save: () => void
  saveEvents: () => void
  selectedAccount: Account | null
}

const StoreContext = createContext<(AppState & AppActions) | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccountsState] = useState<Account[]>([])
  const [events, setEventsState] = useState<BdrEvent[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailEmail, setGmailEmail] = useState('')
  const [dbReady, setDbReadyState] = useState(false)
  const [user, setUser] = useState<AppState['user']>(null)
  const [initialized, setInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedAccounts = localStorage.getItem('nteli_v8')
    const savedEvents = localStorage.getItem('nteli_events_v5')

    let accts = savedAccounts ? JSON.parse(savedAccounts) : SEED_ACCOUNTS.map(a => ({ ...a }))
    // Ensure all accounts have meetings array and pre-enriched contacts
    accts = accts.map((a: Account) => {
      if (!a.meetings) a.meetings = []
      if (!a.contacts && PRE_ENRICHED[a.company]) {
        a.contacts = PRE_ENRICHED[a.company]
        a.contactsSource = 'clay'
        a.contactsDate = 'Apr 2026 (Clay verified)'
      }
      return a
    })

    setAccountsState(accts)
    setEventsState(savedEvents ? JSON.parse(savedEvents) : SEED_EVENTS.map(e => ({ ...e })))
    setInitialized(true)
  }, [])

  // DB init + load
  useEffect(() => {
    if (!initialized) return
    const init = async () => {
      try {
        const r = await fetch('/api/db?action=setup', { method: 'POST' })
        const d = await r.json()
        if (d.success) {
          setDbReadyState(true)
          // Load from DB
          const lr = await fetch('/api/db?action=load')
          const ld = await lr.json()
          if (ld.accounts?.length) {
            const dbAccts = ld.accounts.map((a: Account) => {
              if (!a.meetings) a.meetings = []
              if (!a.contacts && PRE_ENRICHED[a.company]) {
                a.contacts = PRE_ENRICHED[a.company]
                a.contactsSource = 'clay'
                a.contactsDate = 'Apr 2026 (Clay verified)'
              }
              return a
            })
            setAccountsState(dbAccts)
            localStorage.setItem('nteli_v8', JSON.stringify(dbAccts))
          }
          if (ld.events?.length) {
            setEventsState(ld.events)
            localStorage.setItem('nteli_events_v5', JSON.stringify(ld.events))
          }
        }
      } catch {
        // DB not available, use localStorage
      }
    }
    init()
  }, [initialized])

  // Check Gmail status
  useEffect(() => {
    if (!initialized) return
    fetch('/api/gmail?action=status')
      .then(r => r.json())
      .then(d => {
        setGmailConnected(d.connected || false)
        setGmailEmail(d.email || '')
      })
      .catch(() => {})
  }, [initialized])

  const setAccounts = useCallback((accts: Account[]) => {
    setAccountsState(accts)
  }, [])

  const updateAccount = useCallback((id: number, patch: Partial<Account>) => {
    setAccountsState(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))
  }, [])

  const setEvents = useCallback((evts: BdrEvent[]) => {
    setEventsState(evts)
  }, [])

  const updateEvent = useCallback((id: string, patch: Partial<BdrEvent>) => {
    setEventsState(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  }, [])

  const selectAccount = useCallback((id: number | null) => {
    setSelectedId(id)
  }, [])

  const setGmail = useCallback((connected: boolean, email: string) => {
    setGmailConnected(connected)
    setGmailEmail(email)
  }, [])

  const setDbReady = useCallback((ready: boolean) => {
    setDbReadyState(ready)
  }, [])

  const save = useCallback(() => {
    localStorage.setItem('nteli_v8', JSON.stringify(accounts))
    if (dbReady) {
      fetch('/api/db?action=save-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts }),
      }).catch(() => {})
    }
  }, [accounts, dbReady])

  const saveEvents = useCallback(() => {
    localStorage.setItem('nteli_events_v5', JSON.stringify(events))
    if (dbReady) {
      fetch('/api/db?action=save-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      }).catch(() => {})
    }
  }, [events, dbReady])

  const selectedAccount = accounts.find(a => a.id === selectedId) || null

  if (!initialized) return null

  return (
    <StoreContext.Provider value={{
      accounts, events, selectedId, gmailConnected, gmailEmail, dbReady, user,
      setAccounts, updateAccount, setEvents, updateEvent, selectAccount,
      setGmail, setDbReady, setUser, save, saveEvents, selectedAccount,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
