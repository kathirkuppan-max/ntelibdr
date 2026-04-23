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
  // New actions
  updateAccountWithStage: (id: number, newStage: Stage, note?: string) => void
  tagContactToEvent: (eventId: string, accountId: number, contactName: string) => void
  removeTagFromEvent: (eventId: string, accountId: number, contactName: string) => void
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

  useEffect(() => {
    const SEED_VERSION = 'v6-clay-verified'
    const storedVersion = localStorage.getItem('nteli_seed_version')
    const isStale = storedVersion !== SEED_VERSION

    let accts: Account[]
    let evts: BdrEvent[]

    if (isStale) {
      accts = SEED_ACCOUNTS.map(a => ({ ...a }))
      evts = SEED_EVENTS.map(e => ({ ...e }))
      localStorage.setItem('nteli_seed_version', SEED_VERSION)
      localStorage.removeItem('nteli_v8')
      localStorage.removeItem('nteli_events_v5')
    } else {
      const savedAccounts = localStorage.getItem('nteli_v8')
      const savedEvents = localStorage.getItem('nteli_events_v5')
      accts = savedAccounts ? JSON.parse(savedAccounts) : SEED_ACCOUNTS.map(a => ({ ...a }))
      evts = savedEvents ? JSON.parse(savedEvents) : SEED_EVENTS.map(e => ({ ...e }))
    }

    accts = accts.map((a: Account) => {
      if (!a.meetings) a.meetings = []
      if (!a.stageHistory) a.stageHistory = [{ stage: a.stage, date: new Date().toISOString() }]
      if (!a.contacts && PRE_ENRICHED[a.company]) {
        a.contacts = PRE_ENRICHED[a.company]
        a.contactsSource = 'clay'
        a.contactsDate = 'Apr 2026 (Clay verified)'
      }
      return a
    })

    evts = evts.map((e: BdrEvent) => {
      if (!e.eventTags) e.eventTags = []
      return e
    })

    setAccountsState(accts)
    setEventsState(evts)
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (!initialized) return
    const init = async () => {
      try {
        const r = await fetch('/api/db?action=setup', { method: 'POST' })
        const d = await r.json()
        if (d.success) {
          setDbReadyState(true)
          fetch('/api/db?action=save-accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accounts }) }).catch(() => {})
          fetch('/api/db?action=save-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events }) }).catch(() => {})
        }
      } catch {}
    }
    init()
  }, [initialized]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initialized) return
    fetch('/api/gmail?action=status').then(r => r.json()).then(d => { setGmailConnected(d.connected || false); setGmailEmail(d.email || '') }).catch(() => {})
  }, [initialized])

  const setAccounts = useCallback((accts: Account[]) => setAccountsState(accts), [])

  const updateAccount = useCallback((id: number, patch: Partial<Account>) => {
    setAccountsState(prev => prev.map(a => {
      if (a.id !== id) return a
      const updated = { ...a, ...patch }
      // Auto-track stage changes
      if (patch.stage && patch.stage !== a.stage) {
        const history = [...(updated.stageHistory || [])]
        history.push({ stage: patch.stage, date: new Date().toISOString() })
        updated.stageHistory = history
      }
      return updated
    }))
  }, [])

  const updateAccountWithStage = useCallback((id: number, newStage: Stage, note?: string) => {
    setAccountsState(prev => prev.map(a => {
      if (a.id !== id || a.stage === newStage) return a
      const history = [...(a.stageHistory || [])]
      history.push({ stage: newStage, date: new Date().toISOString(), note })
      return { ...a, stage: newStage, stageHistory: history }
    }))
  }, [])

  const setEvents = useCallback((evts: BdrEvent[]) => setEventsState(evts), [])

  const updateEvent = useCallback((id: string, patch: Partial<BdrEvent>) => {
    setEventsState(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  }, [])

  const tagContactToEvent = useCallback((eventId: string, accountId: number, contactName: string) => {
    setEventsState(prev => prev.map(e => {
      if (e.id !== eventId) return e
      const tags = [...(e.eventTags || [])]
      if (tags.some(t => t.accountId === accountId && t.contactName === contactName)) return e
      tags.push({ accountId, contactName })
      return { ...e, eventTags: tags }
    }))
  }, [])

  const removeTagFromEvent = useCallback((eventId: string, accountId: number, contactName: string) => {
    setEventsState(prev => prev.map(e => {
      if (e.id !== eventId) return e
      return { ...e, eventTags: (e.eventTags || []).filter(t => !(t.accountId === accountId && t.contactName === contactName)) }
    }))
  }, [])

  const selectAccount = useCallback((id: number | null) => setSelectedId(id), [])
  const setGmail = useCallback((connected: boolean, email: string) => { setGmailConnected(connected); setGmailEmail(email) }, [])
  const setDbReady = useCallback((ready: boolean) => setDbReadyState(ready), [])

  const save = useCallback(() => {
    localStorage.setItem('nteli_v8', JSON.stringify(accounts))
    if (dbReady) { fetch('/api/db?action=save-accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accounts }) }).catch(() => {}) }
  }, [accounts, dbReady])

  const saveEvents = useCallback(() => {
    localStorage.setItem('nteli_events_v5', JSON.stringify(events))
    if (dbReady) { fetch('/api/db?action=save-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events }) }).catch(() => {}) }
  }, [events, dbReady])

  const selectedAccount = accounts.find(a => a.id === selectedId) || null

  if (!initialized) return null

  return (
    <StoreContext.Provider value={{
      accounts, events, selectedId, gmailConnected, gmailEmail, dbReady, user,
      setAccounts, updateAccount, setEvents, updateEvent, selectAccount,
      setGmail, setDbReady, setUser, save, saveEvents, selectedAccount,
      updateAccountWithStage, tagContactToEvent, removeTagFromEvent,
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
